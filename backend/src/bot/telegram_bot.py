import asyncio
import os
from datetime import datetime, timedelta, timezone

from telegram import Update
import requests
from telegram.ext import Application, CommandHandler, ContextTypes

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
        "🚀 Autoseo bot đã sẵn sàng!\n\nDùng /help để xem đầy đủ lệnh."
    )


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    lines = [
        "📖 Danh sách lệnh:",
        "• /sites – liệt kê site",
        "• /status – thống kê hôm nay",
        "• /queue <site_id> [n] – xem queue chờ duyệt",
        "• /approve <id> – duyệt nội dung",
        "• /reject <id> [lý_do] – từ chối",
        "• /publish <id> – publish ngay",
        "• /setquota <site_id> <n> – đặt quota/ngày",
        "• /sethours <site_id> <start> <end> – đặt khung giờ",
        "• /toggleauto <site_id> on|off – bật/tắt auto",
        "• /find <keyword> – tìm nội dung theo tiêu đề",
        "• /health – kiểm tra hệ thống",
        "• /myid, /whoami – xem ID & quyền",
        "• /admins – owner/env/db admins",
        "• /grant <user_id> /revoke <user_id> – quản trị (owner)",
        "• /reload_admins – nạp lại owner/admin từ env",
    ]
    await update.message.reply_text("\n".join(lines))


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
            "📊 Trạng thái hôm nay\n"
            f"• ⏳ Pending: {total_pending}\n"
            f"• ✅ Approved (today): {today_approved}\n"
            f"• 📢 Published (today): {today_published}"
        )
        await update.message.reply_text(msg)
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
    db = SessionLocal()
    try:
        rows = (
            db.query(ContentQueue)
            .filter(ContentQueue.site_id == site_id, ContentQueue.status == "pending")
            .order_by(ContentQueue.id.desc())
            .limit(limit)
            .all()
        )
        if not rows:
            await update.message.reply_text("ℹ️ Không có mục chờ duyệt cho site này.")
            return
        lines = [f"#{r.id} • {r.title[:80]}" for r in rows]
        await update.message.reply_text("📥 Pending queue:\n" + "\n".join(lines))
    finally:
        db.close()


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
            await update.message.reply_text(f"❌ Không tìm thấy content #{content_id}.")
            return
        if item.status == "published":
            await update.message.reply_text("⚠️ Mục này đã published rồi.")
            return
        if item.status != "approved":
            await update.message.reply_text("⚠️ Chỉ publish mục đã Approved.")
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
        await update.message.reply_text(f"📢 Đã publish content #{content_id}.")
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
            await update.message.reply_text(f"✅ Backend OK: {r.text}")
        else:
            await update.message.reply_text(f"⚠️ Backend degraded: {r.status_code}")
    except Exception as e:
        await update.message.reply_text(f"❌ Backend unreachable: {e}")

async def cmd_sites(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    db = SessionLocal()
    try:
        rows = db.query(Site).all()
        if not rows:
            await update.message.reply_text("ℹ️ Chưa có site nào.")
            return
        lines = [f"#{s.id} • {s.name}\n↳ {s.wp_url}" for s in rows]
        await update.message.reply_text("\n".join(lines))
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
            await update.message.reply_text(f"❌ Không tìm thấy content #{content_id}.")
            return
        if item.status in {"approved", "published"}:
            await update.message.reply_text(
                f"⚠️ Content #{content_id} đang ở trạng thái '{item.status}', không thể duyệt lại."
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
        await update.message.reply_text(f"✅ Đã duyệt content #{content_id}.")
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
            await update.message.reply_text(f"❌ Không tìm thấy content #{content_id}.")
            return
        if item.status == "published":
            await update.message.reply_text(
                f"⚠️ Content #{content_id} đã published, không thể từ chối."
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
            f"🛑 Đã từ chối content #{content_id}\n• Lý do: {reason}"
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




