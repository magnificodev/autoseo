import asyncio
import os
from datetime import datetime, timedelta, timezone

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
import requests
from telegram.constants import ParseMode
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler

from src.database.session import SessionLocal
from src.database.models import Site, ContentQueue, TelegramAdmin, AuditLog


_ENV_ADMIN_IDS: set[int] = set()
_OWNER_ID: int | None = None


def _load_env_file_if_present(path: str = "/app/.env") -> None:
    try:
        if not os.path.exists(path):
            return
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        # Best-effort; ignore
        pass

def _load_env_admin_ids() -> set[int]:
    raw = os.getenv("TELEGRAM_ADMINS", "").strip()
    ids: set[int] = set()
    if raw:
        for part in raw.split(","):
            token = part.strip()
            if not token:
                continue
            try:
                ids.add(int(token))
            except ValueError:
                continue
    return ids


def _load_owner_id() -> int | None:
    owner_raw = os.getenv("TELEGRAM_OWNER_ID", "").strip()
    try:
        return int(owner_raw) if owner_raw else None
    except ValueError:
        return None


def _is_admin_user_id(user_id: int) -> bool:
    if _OWNER_ID is not None and user_id == _OWNER_ID:
        return True
    if user_id in _ENV_ADMIN_IDS:
        return True
    db = SessionLocal()
    try:
        exists = db.query(TelegramAdmin).filter(TelegramAdmin.user_id == user_id).first()
        return exists is not None
    finally:
        db.close()


async def _ensure_admin(update: Update) -> bool:
    user = update.effective_user
    if user is None:
        return False
    if not _is_admin_user_id(user.id):
        await update.message.reply_text("Bạn không có quyền thực hiện lệnh này.")
        return False
    return True


async def _ensure_owner(update: Update) -> bool:
    user = update.effective_user
    if user is None:
        return False
    if _OWNER_ID is not None and user.id == _OWNER_ID:
        return True
    await update.message.reply_text("Chỉ chủ sở hữu mới có thể thực hiện lệnh này.")
    return False


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "🚀 <b>Autoseo Bot đã sẵn sàng</b>\n\nGõ <b>/help</b> để xem danh sách lệnh.",
        parse_mode=ParseMode.HTML,
    )


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    lines = [
        "📖 <b>Danh sách lệnh</b>",
        "• <b>/sites</b> – liệt kê site",
        "• <b>/status</b> – thống kê hôm nay",
        "• <b>/queue</b> <code>&lt;site_id&gt; [n]</code> – xem queue chờ duyệt",
        "• <b>/approve</b> <code>&lt;id&gt;</code> – duyệt nội dung",
        "• <b>/reject</b> <code>&lt;id&gt; [lý_do]</code> – từ chối",
        "• <b>/publish</b> <code>&lt;id&gt;</code> – publish ngay",
        "• <b>/setquota</b> <code>&lt;site_id&gt; &lt;n&gt;</code> – đặt quota/ngày",
        "• <b>/sethours</b> <code>&lt;site_id&gt; &lt;start&gt; &lt;end&gt;</code> – đặt khung giờ",
        "• <b>/toggleauto</b> <code>&lt;site_id&gt; on|off</code> – bật/tắt auto",
        "• <b>/find</b> <code>&lt;keyword&gt;</code> – tìm nội dung",
        "• <b>/health</b> – kiểm tra hệ thống",
        "• <b>/myid</b>, <b>/whoami</b> – xem ID & quyền",
        "• <b>/admins</b> – owner/env/db admins",
        "• <b>/grant</b>/<b>/revoke</b> – quản trị (owner)",
        "• <b>/reload_admins</b> – nạp lại owner/admin từ env",
    ]
    await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.HTML)


def _today_range_utc() -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    return start, end


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    start, end = _today_range_utc()
    db = SessionLocal()
    try:
        from sqlalchemy import func

        total_pending = (
            db.query(func.count(ContentQueue.id))
            .filter(ContentQueue.status == "pending")
            .scalar()
        )
        today_approved = (
            db.query(func.count(ContentQueue.id))
            .filter(ContentQueue.status == "approved")
            .filter(ContentQueue.updated_at >= start, ContentQueue.updated_at < end)
            .scalar()
        )
        today_published = (
            db.query(func.count(ContentQueue.id))
            .filter(ContentQueue.status == "published")
            .filter(ContentQueue.updated_at >= start, ContentQueue.updated_at < end)
            .scalar()
        )
        msg = (
            "📊 <b>Trạng thái hôm nay</b>\n"
            f"• ⏳ Pending: <b>{total_pending}</b>\n"
            f"• ✅ Approved (today): <b>{today_approved}</b>\n"
            f"• 📢 Published (today): <b>{today_published}</b>"
        )
        await update.message.reply_text(msg, parse_mode=ParseMode.HTML)
    finally:
        db.close()


async def cmd_queue(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /queue <site_id> [n=10]")
        return
    try:
        site_id = int(args[0])
        limit = int(args[1]) if len(args) > 1 else 10
        limit = max(1, min(limit, 50))
    except ValueError:
        await update.message.reply_text("Tham số không hợp lệ. Ví dụ: /queue 1 10")
        return
    _send_queue_page(update, site_id=site_id, offset=0, limit=limit)


def _fetch_pending(site_id: int, offset: int, limit: int) -> list[ContentQueue]:
    db = SessionLocal()
    try:
        rows = (
            db.query(ContentQueue)
            .filter(ContentQueue.site_id == site_id, ContentQueue.status == "pending")
            .order_by(ContentQueue.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return rows
    finally:
        db.close()


def _send_queue_page(update: Update, site_id: int, offset: int, limit: int) -> None:
    rows = _fetch_pending(site_id, offset, limit)
    if not rows:
        update.message.reply_text(
            "ℹ️ <i>Không có mục chờ duyệt cho site này.</i>", parse_mode=ParseMode.HTML
        )
        return
    # Gửi danh sách + nút phân trang
    start = offset + 1
    end = offset + len(rows)
    header = f"📥 <b>Pending queue</b> (site={site_id}) — <i>{start}–{end}</i>"
    update.message.reply_text(header, parse_mode=ParseMode.HTML,
                              reply_markup=InlineKeyboardMarkup([[
                                  InlineKeyboardButton("⬅️ Prev", callback_data=f"page:{site_id}:{max(0, offset - limit)}"),
                                  InlineKeyboardButton("➡️ Next", callback_data=f"page:{site_id}:{offset + limit}"),
                              ]]))
    # Gửi từng item với nút hành động + xem nội dung
    for r in rows:
        text = f"<b>#{r.id}</b> • {r.title[:80]}"
        buttons = [
            [
                InlineKeyboardButton(text="👁 View", callback_data=f"view:{r.id}"),
                InlineKeyboardButton(text="✅ Approve", callback_data=f"approve:{r.id}"),
                InlineKeyboardButton(text="🛑 Reject", callback_data=f"reject:{r.id}"),
                InlineKeyboardButton(text="📢 Publish", callback_data=f"publish:{r.id}"),
            ]
        ]
        update.message.reply_text(
            text, parse_mode=ParseMode.HTML, reply_markup=InlineKeyboardMarkup(buttons)
        )


async def cmd_publish(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /publish <content_id>")
        return
    content_id = args[0]
    db = SessionLocal()
    try:
        item = db.get(ContentQueue, int(content_id))
        if not item:
            await update.message.reply_text(f"❌ Không tìm thấy content <code>#{content_id}</code>.", parse_mode=ParseMode.HTML)
            return
        if item.status == "published":
            await update.message.reply_text("⚠️ Mục này đã <b>published</b> rồi.", parse_mode=ParseMode.HTML)
            return
        if item.status != "approved":
            await update.message.reply_text("⚠️ Chỉ publish mục đã <b>Approved</b>.", parse_mode=ParseMode.HTML)
            return
        item.status = "published"
        item.updated_at = datetime.utcnow()
        db.add(
            AuditLog(
                actor_user_id=update.effective_user.id,
                action="publish",
                target_type="content_queue",
                target_id=item.id,
                note=None,
            )
        )
        db.commit()
        await update.message.reply_text(f"📢 Đã publish content <code>#{content_id}</code>.", parse_mode=ParseMode.HTML)
    finally:
        db.close()


def _approve_item(db: SessionLocal, content_id: int, actor_user_id: int) -> tuple[bool, str]:
    item = db.get(ContentQueue, content_id)
    if not item:
        return False, f"❌ Không tìm thấy content <code>#{content_id}</code>."
    if item.status in {"approved", "published"}:
        return (
            False,
            f"⚠️ Content <code>#{content_id}</code> đang ở trạng thái '<b>{item.status}</b>', không thể duyệt lại.",
        )
    item.status = "approved"
    item.updated_at = datetime.utcnow()
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            action="approve",
            target_type="content_queue",
            target_id=item.id,
            note=None,
        )
    )
    db.commit()
    return True, f"✅ Đã duyệt content <code>#{content_id}</code>."


def _reject_item(db: SessionLocal, content_id: int, actor_user_id: int, reason: str) -> tuple[bool, str]:
    item = db.get(ContentQueue, content_id)
    if not item:
        return False, f"❌ Không tìm thấy content <code>#{content_id}</code>."
    if item.status == "published":
        return False, f"⚠️ Content <code>#{content_id}</code> đã <b>published</b>, không thể từ chối."
    item.status = "rejected"
    item.updated_at = datetime.utcnow()
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            action="reject",
            target_type="content_queue",
            target_id=item.id,
            note=reason,
        )
    )
    db.commit()
    return True, f"🛑 Đã từ chối content <code>#{content_id}</code><br/>• Lý do: <i>{reason}</i>"


def _publish_item(db: SessionLocal, content_id: int, actor_user_id: int) -> tuple[bool, str]:
    item = db.get(ContentQueue, content_id)
    if not item:
        return False, f"❌ Không tìm thấy content <code>#{content_id}</code>."
    if item.status == "published":
        return False, "⚠️ Mục này đã <b>published</b> rồi."
    if item.status != "approved":
        return False, "⚠️ Chỉ publish mục đã <b>Approved</b>."
    item.status = "published"
    item.updated_at = datetime.utcnow()
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            action="publish",
            target_type="content_queue",
            target_id=item.id,
            note=None,
        )
    )
    db.commit()
    return True, f"📢 Đã publish content <code>#{content_id}</code>."


async def on_action_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data or ""
    try:
        parts = data.split(":")
        action = parts[0]
        content_id = int(parts[1]) if len(parts) > 1 else 0
        extra = parts[2] if len(parts) > 2 else None
    except Exception:
        await query.edit_message_text("❌ Dữ liệu không hợp lệ.")
        return
    db = SessionLocal()
    try:
        if action == "approve":
            ok, msg = _approve_item(db, content_id, query.from_user.id)
            await query.edit_message_text(msg, parse_mode=ParseMode.HTML)
            return

        if action == "view":
            item = db.get(ContentQueue, content_id)
            if not item:
                await query.edit_message_text(
                    f"❌ Không tìm thấy content <code>#{content_id}</code>.", parse_mode=ParseMode.HTML
                )
                return
            body = (item.body or "").strip()
            snippet = (body[:900] + ("…" if len(body) > 900 else "")) if body else "(trống)"
            await query.edit_message_text(
                f"<b>#{content_id}</b> • {item.title[:80]}\n<code>{snippet}</code>",
                parse_mode=ParseMode.HTML,
            )
            return

        if action == "reject":
            # Hiển thị gợi ý lý do nhanh
            buttons = [[
                InlineKeyboardButton(text="Duplicate", callback_data=f"confirm_reject:{content_id}:duplicate"),
                InlineKeyboardButton(text="LowQuality", callback_data=f"confirm_reject:{content_id}:lowquality"),
                InlineKeyboardButton(text="Irrelevant", callback_data=f"confirm_reject:{content_id}:irrelevant"),
            ], [
                InlineKeyboardButton(text="NoReason", callback_data=f"confirm_reject:{content_id}:noreason"),
                InlineKeyboardButton(text="Cancel", callback_data=f"cancel:{content_id}"),
            ]]
            await query.edit_message_text(
                f"🛑 Chọn lý do từ chối cho <code>#{content_id}</code>:",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(buttons),
            )
            return

        if action == "confirm_reject":
            reason_map = {
                "duplicate": "duplicate",
                "lowquality": "low_quality",
                "irrelevant": "irrelevant",
                "noreason": "",
            }
            reason = reason_map.get((extra or "").lower(), extra or "")
            ok, msg = _reject_item(db, content_id, query.from_user.id, reason)
            await query.edit_message_text(msg, parse_mode=ParseMode.HTML)
            return

        if action == "publish":
            # Hiển thị xác nhận publish
            buttons = [[
                InlineKeyboardButton(text="✅ Confirm Publish", callback_data=f"confirm_publish:{content_id}"),
                InlineKeyboardButton(text="Cancel", callback_data=f"cancel:{content_id}"),
            ]]
            await query.edit_message_text(
                f"📢 Xác nhận publish <code>#{content_id}</code>?",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(buttons),
            )
            return

        if action == "confirm_publish":
            ok, msg = _publish_item(db, content_id, query.from_user.id)
            await query.edit_message_text(msg, parse_mode=ParseMode.HTML)
            return

        if action == "cancel":
            await query.edit_message_text("⏹ Đã hủy thao tác.")
            return

        if action == "page":
            # callback for pagination from header
            # reuse same chat by sending a new page header
            site_id = content_id  # in this context content_id is site_id (packed earlier)
            try:
                new_offset = int(extra or 0)
            except Exception:
                new_offset = 0
            # cannot edit header message easily with list below; simply acknowledge
            await query.edit_message_text("🔄 Đang tải trang...")
            # Send new page in chat
            chat = update.effective_chat
            if chat:
                # Build a fake Update-like call using context.bot
                from telegram import Message
                # Send header
                header = f"📥 <b>Pending queue</b> (site={site_id}) — <i>{new_offset+1}…</i>"
                await context.bot.send_message(chat.id, header, parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("⬅️ Prev", callback_data=f"page:{site_id}:{max(0, new_offset - 10)}"),
                        InlineKeyboardButton("➡️ Next", callback_data=f"page:{site_id}:{new_offset + 10}"),
                    ]]))
                rows = _fetch_pending(site_id, new_offset, 10)
                for r in rows:
                    text = f"<b>#{r.id}</b> • {r.title[:80]}"
                    buttons = [[
                        InlineKeyboardButton(text="👁 View", callback_data=f"view:{r.id}"),
                        InlineKeyboardButton(text="✅ Approve", callback_data=f"approve:{r.id}"),
                        InlineKeyboardButton(text="🛑 Reject", callback_data=f"reject:{r.id}"),
                        InlineKeyboardButton(text="📢 Publish", callback_data=f"publish:{r.id}"),
                    ]]
                    await context.bot.send_message(chat.id, text, parse_mode=ParseMode.HTML,
                        reply_markup=InlineKeyboardMarkup(buttons))
            return

        await query.edit_message_text("❌ Hành động không hỗ trợ.")
    finally:
        db.close()


async def cmd_setquota(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 2:
        await update.message.reply_text("Cách dùng: /setquota <site_id> <n>")
        return
    try:
        site_id = int(args[0])
        n = int(args[1])
        if n < 0:
            raise ValueError
    except ValueError:
        await update.message.reply_text("Giá trị không hợp lệ. Ví dụ: /setquota 1 5")
        return
    db = SessionLocal()
    try:
        site = db.get(Site, site_id)
        if not site:
            await update.message.reply_text("❌ Không tìm thấy site.")
            return
        site.daily_quota = n
        site.updated_at = datetime.utcnow() if hasattr(site, 'updated_at') else site.created_at
        db.commit()
        await update.message.reply_text(f"✅ Đã đặt quota site #{site_id} = {n}/ngày")
    finally:
        db.close()


async def cmd_sethours(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 3:
        await update.message.reply_text("Cách dùng: /sethours <site_id> <start> <end> (0-23)")
        return
    try:
        site_id = int(args[0])
        start_h = int(args[1])
        end_h = int(args[2])
        if not (0 <= start_h <= 23 and 0 <= end_h <= 23):
            raise ValueError
    except ValueError:
        await update.message.reply_text("Tham số không hợp lệ. Ví dụ: /sethours 1 8 22")
        return
    db = SessionLocal()
    try:
        site = db.get(Site, site_id)
        if not site:
            await update.message.reply_text("❌ Không tìm thấy site.")
            return
        site.active_start_hour = start_h
        site.active_end_hour = end_h
        site.updated_at = datetime.utcnow() if hasattr(site, 'updated_at') else site.created_at
        db.commit()
        await update.message.reply_text(f"⏱ Đã đặt giờ hoạt động site #{site_id}: {start_h}:00–{end_h}:00")
    finally:
        db.close()


async def cmd_toggleauto(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 2:
        await update.message.reply_text("Cách dùng: /toggleauto <site_id> on|off")
        return
    try:
        site_id = int(args[0])
        state = args[1].lower()
        if state not in {"on", "off"}:
            raise ValueError
    except ValueError:
        await update.message.reply_text("Ví dụ: /toggleauto 1 on")
        return
    db = SessionLocal()
    try:
        site = db.get(Site, site_id)
        if not site:
            await update.message.reply_text("❌ Không tìm thấy site.")
            return
        site.is_auto_enabled = state == "on"
        db.commit()
        await update.message.reply_text(
            f"🔁 Auto-generate cho site #{site_id}: {'BẬT' if site.is_auto_enabled else 'TẮT'}"
        )
    finally:
        db.close()


async def cmd_find(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /find <keyword>")
        return
    keyword = " ".join(args)
    db = SessionLocal()
    try:
        from sqlalchemy import or_

        rows = (
            db.query(ContentQueue)
            .filter(
                or_(
                    ContentQueue.title.ilike(f"%{keyword}%"),
                    ContentQueue.body.ilike(f"%{keyword}%"),
                )
            )
            .order_by(ContentQueue.id.desc())
            .limit(10)
            .all()
        )
        if not rows:
            await update.message.reply_text("🔍 Không tìm thấy nội dung phù hợp.")
            return
        lines = [f"#{r.id} [{r.status}] • {r.title[:80]}" for r in rows]
        await update.message.reply_text("🔎 Kết quả:\n" + "\n".join(lines))
    finally:
        db.close()


async def cmd_health(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Simple health: call backend /health inside compose network
    try:
        r = requests.get("http://backend:8000/health", timeout=5)
        if r.ok:
            await update.message.reply_text(f"✅ <b>Backend OK</b>: <code>{r.text}</code>", parse_mode=ParseMode.HTML)
        else:
            await update.message.reply_text(f"⚠️ Backend degraded: <code>{r.status_code}</code>", parse_mode=ParseMode.HTML)
    except Exception as e:
        await update.message.reply_text(f"❌ Backend unreachable: <code>{e}</code>", parse_mode=ParseMode.HTML)


def _bot_api(method: str, payload: dict) -> None:
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        return
    try:
        requests.post(f"https://api.telegram.org/bot{token}/{method}", json=payload, timeout=5)
    except Exception:
        pass


def _set_default_commands_menu() -> None:
    commands = [
        {"command": "help", "description": "Danh sách lệnh"},
        {"command": "status", "description": "Thống kê hôm nay"},
        {"command": "sites", "description": "Liệt kê site"},
        {"command": "queue", "description": "Xem queue"},
        {"command": "approve", "description": "Duyệt"},
        {"command": "reject", "description": "Từ chối"},
        {"command": "publish", "description": "Publish"},
    ]
    _bot_api("setMyCommands", {"commands": commands})


def _set_admin_commands_for_user(user_id: int) -> None:
    # Scope per-user: chat_member in 1:1 chat
    commands = [
        {"command": "help", "description": "Danh sách lệnh"},
        {"command": "status", "description": "Thống kê hôm nay"},
        {"command": "sites", "description": "Liệt kê site"},
        {"command": "queue", "description": "Xem queue"},
        {"command": "approve", "description": "Duyệt"},
        {"command": "reject", "description": "Từ chối"},
        {"command": "publish", "description": "Publish"},
        {"command": "setquota", "description": "Đặt quota"},
        {"command": "sethours", "description": "Khung giờ"},
        {"command": "toggleauto", "description": "Bật/tắt auto"},
        {"command": "find", "description": "Tìm nội dung"},
        {"command": "health", "description": "Kiểm tra hệ thống"},
    ]
    scope = {"type": "chat_member", "chat_id": user_id, "user_id": user_id}
    _bot_api("setMyCommands", {"scope": scope, "commands": commands})


def _refresh_commands_menu_for_all_admins() -> None:
    db = SessionLocal()
    try:
        _set_default_commands_menu()
        # owner
        if _OWNER_ID:
            _set_admin_commands_for_user(_OWNER_ID)
        # env admins
        for uid in _ENV_ADMIN_IDS:
            _set_admin_commands_for_user(uid)
        # db admins
        for row in db.query(TelegramAdmin).all():
            _set_admin_commands_for_user(int(row.user_id))
    finally:
        db.close()

async def cmd_sites(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    db = SessionLocal()
    try:
        rows = db.query(Site).all()
        if not rows:
            await update.message.reply_text("ℹ️ <i>Chưa có site nào.</i>", parse_mode=ParseMode.HTML)
            return
        lines = [f"<b>#{s.id}</b> • {s.name}\n↳ <code>{s.wp_url}</code>" for s in rows]
        await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.HTML)
    finally:
        db.close()


async def cmd_whoami(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if user is None:
        return
    uid = user.id
    owner = _OWNER_ID is not None and uid == _OWNER_ID
    admin = _is_admin_user_id(uid)
    await update.message.reply_text(
        f"user_id={uid}\nowner={owner}\nadmin={admin}\nOWNER_ID={_OWNER_ID if _OWNER_ID is not None else '(none)'}"
    )


async def cmd_reload_admins(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Allow anyone to trigger; it only reloads from env. Useful after CD.
    global _ENV_ADMIN_IDS, _OWNER_ID
    _ENV_ADMIN_IDS = _load_env_admin_ids()
    _OWNER_ID = _load_owner_id()
    owner_str = str(_OWNER_ID) if _OWNER_ID is not None else "(none)"
    env_ids = ",".join(str(i) for i in sorted(_ENV_ADMIN_IDS)) if _ENV_ADMIN_IDS else "(none)"
    await update.message.reply_text(f"Reloaded. OWNER_ID={owner_str}; ENV={env_ids}")
async def cmd_admins(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    db = SessionLocal()
    try:
        rows = db.query(TelegramAdmin).all()
        ids = [str(r.user_id) for r in rows]
        owner_str = str(_OWNER_ID) if _OWNER_ID is not None else "(chưa đặt)"
        env_ids = ",".join(str(i) for i in sorted(_ENV_ADMIN_IDS)) if _ENV_ADMIN_IDS else "(không)"
        lines = [
            f"👑 Owner: {owner_str}",
            f"🛠 ENV admins: {env_ids}",
            "📜 DB admins:",
            ("• " + "\n• ".join(ids)) if ids else "(trống)",
        ]
        await update.message.reply_text("\n".join(lines))
    finally:
        db.close()


async def cmd_grant(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_owner(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /grant <user_id>")
        return
    try:
        grant_id = int(args[0])
    except ValueError:
        await update.message.reply_text("user_id không hợp lệ")
        return
    if _OWNER_ID is not None and grant_id == _OWNER_ID:
        await update.message.reply_text("Người này đã là owner.")
        return
    db = SessionLocal()
    try:
        exists = db.query(TelegramAdmin).filter(TelegramAdmin.user_id == grant_id).first()
        if exists:
            await update.message.reply_text("Người này đã là admin.")
            return
        db.add(TelegramAdmin(user_id=grant_id, created_at=datetime.utcnow()))
        db.commit()
        await update.message.reply_text(f"✅ Đã cấp quyền admin cho {grant_id}.")
    finally:
        db.close()


async def cmd_revoke_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_owner(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /revoke <user_id>")
        return
    try:
        revoke_id = int(args[0])
    except ValueError:
        await update.message.reply_text("user_id không hợp lệ")
        return
    if _OWNER_ID is not None and revoke_id == _OWNER_ID:
        await update.message.reply_text("Không thể thu quyền của owner.")
        return
    db = SessionLocal()
    try:
        row = db.query(TelegramAdmin).filter(TelegramAdmin.user_id == revoke_id).first()
        if not row:
            await update.message.reply_text("Người này chưa là admin.")
            return
        db.delete(row)
        db.commit()
        await update.message.reply_text(f"♻️ Đã thu quyền admin của {revoke_id}.")
    finally:
        db.close()


async def cmd_approve(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /approve <content_id>")
        return
    content_id = args[0]
    db = SessionLocal()
    try:
        item = db.get(ContentQueue, int(content_id))
        if not item:
            await update.message.reply_text(f"❌ Không tìm thấy content <code>#{content_id}</code>.", parse_mode=ParseMode.HTML)
            return
        if item.status in {"approved", "published"}:
            await update.message.reply_text(
                f"⚠️ Content <code>#{content_id}</code> đang ở trạng thái '<b>{item.status}</b>', không thể duyệt lại.",
                parse_mode=ParseMode.HTML,
            )
            return
        item.status = "approved"
        item.updated_at = datetime.utcnow()
        db.add(
            AuditLog(
                actor_user_id=update.effective_user.id,
                action="approve",
                target_type="content_queue",
                target_id=item.id,
                note=None,
            )
        )
        db.commit()
        await update.message.reply_text(f"✅ Đã duyệt content <code>#{content_id}</code>.", parse_mode=ParseMode.HTML)
    finally:
        db.close()


async def cmd_reject(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /reject <content_id> [lý_do]")
        return
    content_id = args[0]
    reason = " ".join(args[1:]) if len(args) > 1 else "không nêu lý do"
    db = SessionLocal()
    try:
        item = db.get(ContentQueue, int(content_id))
        if not item:
            await update.message.reply_text(f"❌ Không tìm thấy content <code>#{content_id}</code>.", parse_mode=ParseMode.HTML)
            return
        if item.status == "published":
            await update.message.reply_text(
                f"⚠️ Content <code>#{content_id}</code> đã <b>published</b>, không thể từ chối.",
                parse_mode=ParseMode.HTML,
            )
            return
        item.status = "rejected"
        item.updated_at = datetime.utcnow()
        db.add(
            AuditLog(
                actor_user_id=update.effective_user.id,
                action="reject",
                target_type="content_queue",
                target_id=item.id,
                note=reason,
            )
        )
        db.commit()
        await update.message.reply_text(
            f"🛑 Đã từ chối content <code>#{content_id}</code><br/>• Lý do: <i>{reason}</i>",
            parse_mode=ParseMode.HTML,
        )
    finally:
        db.close()


def build_app() -> Application:
    _load_env_file_if_present()  # ensure env from /app/.env available in container
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        raise RuntimeError("Missing TELEGRAM_TOKEN env")
    global _ENV_ADMIN_IDS, _OWNER_ID
    _ENV_ADMIN_IDS = _load_env_admin_ids()
    _OWNER_ID = _load_owner_id()
    app = Application.builder().token(token).build()
    # Set commands menu asynchronously after startup
    _refresh_commands_menu_for_all_admins()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("sites", cmd_sites))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("myid", lambda u, c: u.message.reply_text(str(u.effective_user.id))))
    app.add_handler(CommandHandler("whoami", cmd_whoami))
    app.add_handler(CommandHandler("reload_admins", cmd_reload_admins))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("admins", cmd_admins))
    app.add_handler(CommandHandler("grant", cmd_grant))
    app.add_handler(CommandHandler("revoke", cmd_revoke_admin))
    app.add_handler(CommandHandler("queue", cmd_queue))
    app.add_handler(CommandHandler("publish", cmd_publish))
    app.add_handler(CommandHandler("setquota", cmd_setquota))
    app.add_handler(CommandHandler("sethours", cmd_sethours))
    app.add_handler(CommandHandler("toggleauto", cmd_toggleauto))
    app.add_handler(CommandHandler("find", cmd_find))
    app.add_handler(CommandHandler("health", cmd_health))
    app.add_handler(CommandHandler("approve", cmd_approve))
    app.add_handler(CommandHandler("reject", cmd_reject))
    app.add_handler(CallbackQueryHandler(on_action_button))
    return app


def main() -> None:
    app = build_app()
    # Ensure bot is in polling mode (remove webhook if previously set)
    async def _prepare():
        try:
            await app.bot.delete_webhook(drop_pending_updates=False)
        except Exception:
            pass
    asyncio.get_event_loop().run_until_complete(_prepare())
    app.run_polling(close_loop=False)


if __name__ == "__main__":
    main()




