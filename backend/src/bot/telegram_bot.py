import asyncio
import os
from datetime import datetime, timedelta, timezone

import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update

try:
    from telegram.constants import ParseMode  # PTB v20+

    PARSE_MODE_HTML = ParseMode.HTML
except Exception:  # pragma: no cover
    try:
        from telegram import ParseMode  # PTB v13 fallback

        PARSE_MODE_HTML = ParseMode.HTML
    except Exception:
        ParseMode = None  # type: ignore
        PARSE_MODE_HTML = "HTML"
from src.database.models import AuditLog, ContentQueue, Site, TelegramAdmin
from src.database.session import SessionLocal
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, ContextTypes

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
        exists = (
            db.query(TelegramAdmin).filter(TelegramAdmin.user_id == user_id).first()
        )
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
        "",
        "🔎 <b>Nội dung & duyệt</b>",
        "• <b>/queue</b> <code>&lt;site_id&gt; [n|status] [status]</code> – xem hàng đợi (mặc định pending, n=10)",
        "• <b>/approve</b> <code>&lt;id&gt;</code> – duyệt nội dung",
        "• <b>/reject</b> <code>&lt;id&gt; [lý_do]</code> – từ chối",
        "• <b>/publish</b> <code>&lt;id&gt;</code> – publish ngay",
        "• <b>/find</b> <code>&lt;keyword&gt;</code> – tìm theo tiêu đề/body",
        "",
        "🛠 <b>Quản trị site</b>",
        "• <b>/sites</b> – liệt kê site",
        "• <b>/setquota</b> <code>&lt;site_id&gt; &lt;n&gt;</code> – đặt quota/ngày",
        "• <b>/sethours</b> <code>&lt;site_id&gt; &lt;start&gt; &lt;end&gt;</code> – giờ hoạt động",
        "• <b>/toggleauto</b> <code>&lt;site_id&gt; on|off</code> – bật/tắt auto",
        "",
        "🧭 <b>Hệ thống</b>",
        "• <b>/status</b> – thống kê trong ngày",
        "• <b>/health</b> – kiểm tra backend",
        "",
        "👤 <b>Tài khoản & quyền</b>",
        "• <b>/myid</b>, <b>/whoami</b> – xem ID & quyền",
        "• <b>/admins</b> – xem owner/env/db admins",
        "• <b>/grant</b> <code>&lt;user_id&gt;</code> / <b>/revoke</b> <code>&lt;user_id&gt;</code> – quản trị (owner)",
        "• <b>/reload_admins</b> – nạp lại owner/admin từ env",
        "",
        "💡 <i>Mẹo:</i> Vào /queue rồi dùng các nút inline để thao tác nhanh và phân trang.",
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
        await update.message.reply_text("Cách dùng: /queue <site_id> [n|status] [status]\nVí dụ: /queue 1, /queue 1 pending, /queue 1 10, /queue 1 10 approved")
        return
    try:
        site_id = int(args[0])
        
        # Logic mới: hỗ trợ cả /queue 1 pending và /queue 1 10 pending
        if len(args) == 2:
            # Có 2 tham số: /queue 1 <status> hoặc /queue 1 <n>
            second_arg = args[1].lower().strip()
            if second_arg in {"pending", "approved", "rejected"}:
                # /queue 1 pending -> n=10, status=pending
                limit = 10
                status = second_arg
            else:
                # /queue 1 10 -> n=10, status=pending
                limit = int(second_arg)
                limit = max(1, min(limit, 50))
                status = "pending"
        elif len(args) == 3:
            # Có 3 tham số: /queue 1 10 pending
            limit = int(args[1])
            limit = max(1, min(limit, 50))
            status = args[2].lower().strip()
            if status not in {"pending", "approved", "rejected"}:
                status = "pending"
        else:
            # Chỉ có 1 tham số: /queue 1 -> n=10, status=pending
            limit = 10
            status = "pending"
            
    except ValueError:
        await update.message.reply_text("Tham số không hợp lệ. Ví dụ: /queue 1, /queue 1 pending, /queue 1 10, /queue 1 10 pending")
        return

    # Fallback logic: nếu không có bài pending, thử approved
    if status == "pending":
        available_statuses = _get_available_statuses(site_id)
        if "pending" not in available_statuses and available_statuses:
            status = available_statuses[0]  # Lấy trạng thái đầu tiên có dữ liệu

    chat = update.effective_chat
    if not chat:
        return
    await _send_queue_page(
        context.bot, chat.id, site_id=site_id, offset=0, limit=limit, status=status
    )


def _fetch_by_status(
    site_id: int, status: str, offset: int, limit: int
) -> list[ContentQueue]:
    db = SessionLocal()
    try:
        rows = (
            db.query(ContentQueue)
            .filter(ContentQueue.site_id == site_id, ContentQueue.status == status)
            .order_by(ContentQueue.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return rows
    finally:
        db.close()


def _get_available_statuses(site_id: int) -> list[str]:
    """Tìm trạng thái có dữ liệu cho site"""
    db = SessionLocal()
    try:
        statuses = []
        for status in ["pending", "approved", "rejected"]:
            count = (
                db.query(ContentQueue)
                .filter(ContentQueue.site_id == site_id, ContentQueue.status == status)
                .count()
            )
            if count > 0:
                statuses.append(status)
        return statuses
    finally:
        db.close()


async def _send_queue_page(
    bot, chat_id: int, site_id: int, offset: int, limit: int, status: str = "pending"
) -> None:
    rows = _fetch_by_status(site_id, status, offset, limit)
    if not rows:
        available_statuses = _get_available_statuses(site_id)
        if available_statuses:
            msg = f"ℹ️ <i>Không có bài {status}.</i>\n"
            msg += f"Có thể xem: {', '.join(available_statuses)}"
        else:
            msg = "ℹ️ <i>Site này chưa có nội dung nào.</i>"
        await bot.send_message(chat_id, msg, parse_mode=ParseMode.HTML)
        return
    # Gửi danh sách + nút phân trang
    start = offset + 1
    end = offset + len(rows)
    title_map = {"pending": "Pending", "approved": "Approved", "rejected": "Rejected"}
    title = title_map.get(status, status.title())
    header = f"📥 <b>{title} queue</b> (site={site_id}) — <i>{start}–{end}</i>"
    # Header với phân trang và bulk actions
    header_rows = [
        [
            InlineKeyboardButton(
                "⬅️ Prev",
                callback_data=f"page:{site_id}:{max(0, offset - limit)}:{limit}:{status}",
            ),
            InlineKeyboardButton(
                "➡️ Next",
                callback_data=f"page:{site_id}:{offset + limit}:{limit}:{status}",
            ),
        ],
    ]

    # Bulk actions theo trạng thái
    if status == "pending":
        header_rows.extend(
            [
                [
                    InlineKeyboardButton(
                        "✅ Bulk Approve 3",
                        callback_data=f"bulk_approve:{site_id}:{offset}:{limit}:3",
                    ),
                    InlineKeyboardButton(
                        "✅ Bulk Approve 5",
                        callback_data=f"bulk_approve:{site_id}:{offset}:{limit}:5",
                    ),
                ],
                [
                    InlineKeyboardButton(
                        "🛑 Bulk Reject 3",
                        callback_data=f"bulk_reject_pick:{site_id}:{offset}:{limit}:3",
                    ),
                    InlineKeyboardButton(
                        "🛑 Bulk Reject 5",
                        callback_data=f"bulk_reject_pick:{site_id}:{offset}:{limit}:5",
                    ),
                ],
            ]
        )
    elif status == "approved":
        header_rows.append(
            [
                InlineKeyboardButton(
                    "📢 Bulk Publish 3",
                    callback_data=f"bulk_publish:{site_id}:{offset}:{limit}:3",
                ),
                InlineKeyboardButton(
                    "📢 Bulk Publish 5",
                    callback_data=f"bulk_publish:{site_id}:{offset}:{limit}:5",
                ),
            ]
        )

    # Không có filter buttons nữa - sử dụng lệnh text
    await bot.send_message(
        chat_id,
        header,
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(header_rows),
    )
    # Gửi từng item với nút hành động + xem nội dung
    for r in rows:
        text = f"<b>#{r.id}</b> • {r.title[:80]}"
        buttons = [
            InlineKeyboardButton(
                text="👁 View",
                callback_data=f"view:{r.id}:{site_id}:{offset}:{limit}:{status}",
            ),
        ]

        # Nút hành động theo trạng thái
        if status == "pending":
            buttons.extend(
                [
                    InlineKeyboardButton(
                        text="✅ Approve",
                        callback_data=f"approve:{r.id}:{site_id}:{offset}:{limit}:{status}",
                    ),
                    InlineKeyboardButton(
                        text="🛑 Reject",
                        callback_data=f"reject:{r.id}:{site_id}:{offset}:{limit}:{status}",
                    ),
                ]
            )
        elif status == "approved":
            buttons.append(
                InlineKeyboardButton(
                    text="📢 Publish",
                    callback_data=f"publish:{r.id}:{site_id}:{offset}:{limit}:{status}",
                )
            )
        # rejected không có nút hành động, chỉ xem

        await bot.send_message(
            chat_id,
            text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup([buttons]),
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
            await update.message.reply_text(
                f"❌ Không tìm thấy content <code>#{content_id}</code>.",
                parse_mode=ParseMode.HTML,
            )
            return
        if item.status == "published":
            await update.message.reply_text(
                "⚠️ Mục này đã <b>published</b> rồi.", parse_mode=ParseMode.HTML
            )
            return
        if item.status != "approved":
            await update.message.reply_text(
                "⚠️ Chỉ publish mục đã <b>Approved</b>.", parse_mode=ParseMode.HTML
            )
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
        await update.message.reply_text(
            f"📢 Đã publish content <code>#{content_id}</code>.",
            parse_mode=ParseMode.HTML,
        )
    finally:
        db.close()


def _approve_item(
    db: SessionLocal, content_id: int, actor_user_id: int
) -> tuple[bool, str]:
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


def _reject_item(
    db: SessionLocal, content_id: int, actor_user_id: int, reason: str
) -> tuple[bool, str]:
    item = db.get(ContentQueue, content_id)
    if not item:
        return False, f"❌ Không tìm thấy content <code>#{content_id}</code>."
    if item.status == "published":
        return (
            False,
            f"⚠️ Content <code>#{content_id}</code> đã <b>published</b>, không thể từ chối.",
        )
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
    return (
        True,
        f"🛑 Đã từ chối content <code>#{content_id}</code><br/>• Lý do: <i>{reason}</i>",
    )


def _publish_item(
    db: SessionLocal, content_id: int, actor_user_id: int
) -> tuple[bool, str]:
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
        site_ctx = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else None
        offset_ctx = (
            int(parts[3]) if len(parts) > 3 and parts[3].lstrip("-").isdigit() else 0
        )
        limit_ctx = int(parts[4]) if len(parts) > 4 and parts[4].isdigit() else 10
        extra = parts[5] if len(parts) > 5 else None
    except Exception:
        await query.edit_message_text("❌ Dữ liệu không hợp lệ.")
        return
    db = SessionLocal()
    try:
        if action == "approve":
            ok, msg = _approve_item(db, content_id, query.from_user.id)
            back = (
                InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back", callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:pending"
                            )
                        ]
                    ]
                )
                if site_ctx is not None
                else None
            )
            await query.edit_message_text(
                msg, parse_mode=ParseMode.HTML, reply_markup=back
            )
            return

        if action == "view":
            item = db.get(ContentQueue, content_id)
            if not item:
                await query.edit_message_text(
                    f"❌ Không tìm thấy content <code>#{content_id}</code>.",
                    parse_mode=ParseMode.HTML,
                )
                return
            body = (item.body or "").strip()
            snippet = (
                (body[:900] + ("…" if len(body) > 900 else "")) if body else "(trống)"
            )
            back = (
                InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back", callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:{status_ctx}"
                            )
                        ]
                    ]
                )
                if site_ctx is not None
                else None
            )
            await query.edit_message_text(
                f"<b>#{content_id}</b> • {item.title[:80]}\n<code>{snippet}</code>",
                parse_mode=ParseMode.HTML,
                reply_markup=back,
            )
            return

        if action == "reject":
            # Hiển thị gợi ý lý do nhanh
            buttons = [
                [
                    InlineKeyboardButton(
                        text="Duplicate",
                        callback_data=f"confirm_reject:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}:duplicate",
                    ),
                    InlineKeyboardButton(
                        text="LowQuality",
                        callback_data=f"confirm_reject:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}:lowquality",
                    ),
                    InlineKeyboardButton(
                        text="Irrelevant",
                        callback_data=f"confirm_reject:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}:irrelevant",
                    ),
                ],
                [
                    InlineKeyboardButton(
                        text="NoReason",
                        callback_data=f"confirm_reject:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}:noreason",
                    ),
                    InlineKeyboardButton(
                        text="Cancel",
                        callback_data=f"cancel:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}",
                    ),
                ],
            ]
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
            back = (
                InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back", callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:pending"
                            )
                        ]
                    ]
                )
                if site_ctx is not None
                else None
            )
            await query.edit_message_text(
                msg, parse_mode=ParseMode.HTML, reply_markup=back
            )
            return

        if action == "publish":
            # Hiển thị xác nhận publish
            buttons = [
                [
                    InlineKeyboardButton(
                        text="✅ Confirm Publish",
                        callback_data=f"confirm_publish:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}",
                    ),
                    InlineKeyboardButton(
                        text="Cancel",
                        callback_data=f"cancel:{content_id}:{site_ctx}:{offset_ctx}:{limit_ctx}",
                    ),
                ]
            ]
            await query.edit_message_text(
                f"📢 Xác nhận publish <code>#{content_id}</code>?",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(buttons),
            )
            return

        if action == "confirm_publish":
            ok, msg = _publish_item(db, content_id, query.from_user.id)
            back = (
                InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back", callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:approved"
                            )
                        ]
                    ]
                )
                if site_ctx is not None
                else None
            )
            await query.edit_message_text(
                msg, parse_mode=ParseMode.HTML, reply_markup=back
            )
            return

        if action == "cancel":
            back = (
                InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back", callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:{status_ctx}"
                            )
                        ]
                    ]
                )
                if site_ctx is not None
                else None
            )
            await query.edit_message_text("⏹ Đã hủy thao tác.", reply_markup=back)
            return

        if action == "copy_myid":
            # Simply re-send the ID in a code block so user can long-press to copy
            await query.edit_message_text(
                f"👤 <b>User ID</b>: <code>{content_id}</code>",
                parse_mode=ParseMode.HTML,
            )
            return

        if action == "reload_admins_cb":
            global _ENV_ADMIN_IDS, _OWNER_ID
            _ENV_ADMIN_IDS = _load_env_admin_ids()
            _OWNER_ID = _load_owner_id()
            await query.edit_message_text("🔄 Đã nạp lại cấu hình admins từ env.")
            return

        if action == "page":
            # callback for pagination from header: data format page:<site_id>:<offset>
            try:
                site_id = int(parts[1])
                new_offset = int(parts[2])
                new_limit = int(parts[3]) if len(parts) > 3 else 10
                new_status = parts[4] if len(parts) > 4 else "pending"
            except Exception:
                await query.edit_message_text("❌ Tham số phân trang không hợp lệ.")
                return
            await query.edit_message_text("🔄 Đang tải trang...")
            # Gửi trang mới vào chat hiện tại
            chat = update.effective_chat
            if chat:
                # Gửi message mới, giữ nguyên thread
                await _send_queue_page(
                    context.bot,
                    chat.id,
                    site_id=site_id,
                    offset=new_offset,
                    limit=new_limit or 10,
                    status=new_status,
                )
            return

        # Filter action đã bị loại bỏ - sử dụng lệnh text

        if action in {"bulk_approve", "bulk_reject_pick"}:
            try:
                site_id = int(parts[1])
                offset = int(parts[2])
                limit = int(parts[3])
                count = int(parts[4])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk không hợp lệ.")
                return
            if action == "bulk_approve":
                rows = _fetch_by_status(site_id, "pending", offset, count)
                ok_count = 0
                for r in rows:
                    ok, _ = _approve_item(db, r.id, query.from_user.id)
                    if ok:
                        ok_count += 1
                await query.edit_message_text(
                    f"✅ Đã approve {ok_count}/{count} mục.",
                    reply_markup=InlineKeyboardMarkup(
                        [
                            [
                                InlineKeyboardButton(
                                    "⬅️ Back", callback_data=f"page:{site_id}:{offset}:{limit}:pending"
                                )
                            ]
                        ]
                    ),
                )
                return
            else:
                # chọn lý do cho bulk reject
                buttons = [
                    [
                        InlineKeyboardButton(
                            text="Duplicate",
                            callback_data=f"bulk_reject:{site_id}:{offset}:{limit}:{count}:duplicate",
                        ),
                        InlineKeyboardButton(
                            text="LowQuality",
                            callback_data=f"bulk_reject:{site_id}:{offset}:{limit}:{count}:lowquality",
                        ),
                        InlineKeyboardButton(
                            text="Irrelevant",
                            callback_data=f"bulk_reject:{site_id}:{offset}:{limit}:{count}:irrelevant",
                        ),
                    ],
                    [
                        InlineKeyboardButton(
                            text="NoReason",
                            callback_data=f"bulk_reject:{site_id}:{offset}:{limit}:{count}:noreason",
                        ),
                        InlineKeyboardButton(
                            text="Cancel", callback_data=f"page:{site_id}:{offset}:{limit}:pending"
                        ),
                    ],
                ]
                await query.edit_message_text(
                    f"🛑 Chọn lý do từ chối {count} mục đầu trang:",
                    reply_markup=InlineKeyboardMarkup(buttons),
                )
                return

        if action == "bulk_reject":
            try:
                site_id = int(parts[1])
                offset = int(parts[2])
                limit = int(parts[3])
                count = int(parts[4])
                reason_key = parts[5]
            except Exception:
                await query.edit_message_text("❌ Tham số bulk reject không hợp lệ.")
                return
            reason_map = {
                "duplicate": "duplicate",
                "lowquality": "low_quality",
                "irrelevant": "irrelevant",
                "noreason": "",
            }
            reason = reason_map.get(reason_key, reason_key)
            rows = _fetch_by_status(site_id, "pending", offset, count)
            rej = 0
            for r in rows:
                ok, _ = _reject_item(db, r.id, query.from_user.id, reason)
                if ok:
                    rej += 1
            await query.edit_message_text(
                f"🛑 Đã reject {rej}/{count} mục. Lý do: {reason or 'n/a'}",
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back", callback_data=f"page:{site_id}:{offset}:{limit}:pending"
                            )
                        ]
                    ]
                ),
            )
            return

        if action == "bulk_publish":
            try:
                site_id = int(parts[1])
                offset = int(parts[2])
                limit = int(parts[3])
                count = int(parts[4])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk publish không hợp lệ.")
                return
            rows = _fetch_by_status(site_id, "approved", offset, count)
            pub = 0
            for r in rows:
                ok, _ = _publish_item(db, r.id, query.from_user.id)
                if ok:
                    pub += 1
            await query.edit_message_text(
                f"📢 Đã publish {pub}/{count} mục (Approved).",
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "⬅️ Back",
                                callback_data=f"page:{site_id}:{offset}:{limit}:approved",
                            )
                        ]
                    ]
                ),
            )
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
        site.updated_at = (
            datetime.utcnow() if hasattr(site, "updated_at") else site.created_at
        )
        db.commit()
        await update.message.reply_text(f"✅ Đã đặt quota site #{site_id} = {n}/ngày")
    finally:
        db.close()


async def cmd_sethours(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    args = context.args if context.args else []
    if len(args) < 3:
        await update.message.reply_text(
            "Cách dùng: /sethours <site_id> <start> <end> (0-23)"
        )
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
        site.updated_at = (
            datetime.utcnow() if hasattr(site, "updated_at") else site.created_at
        )
        db.commit()
        await update.message.reply_text(
            f"⏱ Đã đặt giờ hoạt động site #{site_id}: {start_h}:00–{end_h}:00"
        )
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
            await update.message.reply_text(
                f"✅ <b>Backend OK</b>: <code>{r.text}</code>",
                parse_mode=ParseMode.HTML,
            )
        else:
            await update.message.reply_text(
                f"⚠️ Backend degraded: <code>{r.status_code}</code>",
                parse_mode=ParseMode.HTML,
            )
    except Exception as e:
        await update.message.reply_text(
            f"❌ Backend unreachable: <code>{e}</code>", parse_mode=ParseMode.HTML
        )


def _bot_api(method: str, payload: dict) -> None:
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{token}/{method}", json=payload, timeout=5
        )
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
            await update.message.reply_text(
                "ℹ️ <i>Chưa có site nào.</i>", parse_mode=ParseMode.HTML
            )
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
    owner_badge = "✅" if owner else "❌"
    admin_badge = "✅" if admin else "❌"
    owner_id = _OWNER_ID if _OWNER_ID is not None else "(none)"
    msg = (
        "👤 <b>Thông tin tài khoản</b>\n"
        f"• ID: <code>{uid}</code>\n"
        f"• Owner: <b>{owner_badge}</b>\n"
        f"• Admin: <b>{admin_badge}</b>\n"
        f"• OWNER_ID đang nạp: <code>{owner_id}</code>"
    )
    await update.message.reply_text(msg, parse_mode=ParseMode.HTML)


async def cmd_myid(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if user is None:
        return
    await update.message.reply_text(
        f"👤 <b>User ID</b>: <code>{user.id}</code>",
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton(text="Copy", callback_data=f"copy_myid:{user.id}")]]
        ),
    )


async def cmd_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if user is None:
        return
    uid = user.id
    owner = _OWNER_ID is not None and uid == _OWNER_ID
    admin = _is_admin_user_id(uid)
    owner_badge = "✅" if owner else "❌"
    admin_badge = "✅" if admin else "❌"
    msg = (
        "👤 <b>Hồ sơ</b>\n"
        f"• ID: <code>{uid}</code>\n"
        f"• Owner: <b>{owner_badge}</b>\n"
        f"• Admin: <b>{admin_badge}</b>"
    )
    await update.message.reply_text(msg, parse_mode=ParseMode.HTML)


async def cmd_reload_admins(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Allow anyone to trigger; it only reloads from env. Useful after CD.
    global _ENV_ADMIN_IDS, _OWNER_ID
    _ENV_ADMIN_IDS = _load_env_admin_ids()
    _OWNER_ID = _load_owner_id()
    owner_str = str(_OWNER_ID) if _OWNER_ID is not None else "(none)"
    env_ids = (
        ",".join(str(i) for i in sorted(_ENV_ADMIN_IDS)) if _ENV_ADMIN_IDS else "(none)"
    )
    await update.message.reply_text(f"Reloaded. OWNER_ID={owner_str}; ENV={env_ids}")


async def cmd_admins(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not await _ensure_admin(update):
        return
    db = SessionLocal()
    try:
        rows = db.query(TelegramAdmin).all()
        ids = [str(r.user_id) for r in rows]
        owner_str = str(_OWNER_ID) if _OWNER_ID is not None else "(chưa đặt)"
        env_ids = (
            ",".join(str(i) for i in sorted(_ENV_ADMIN_IDS))
            if _ENV_ADMIN_IDS
            else "(không)"
        )
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
        exists = (
            db.query(TelegramAdmin).filter(TelegramAdmin.user_id == grant_id).first()
        )
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
            await update.message.reply_text(
                f"❌ Không tìm thấy content <code>#{content_id}</code>.",
                parse_mode=ParseMode.HTML,
            )
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
        await update.message.reply_text(
            f"✅ Đã duyệt content <code>#{content_id}</code>.",
            parse_mode=ParseMode.HTML,
        )
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
            await update.message.reply_text(
                f"❌ Không tìm thấy content <code>#{content_id}</code>.",
                parse_mode=ParseMode.HTML,
            )
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
    app.add_handler(CommandHandler("profile", cmd_profile))
    # Remove dedicated commands to keep UI gọn: dùng /profile thay thế
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
