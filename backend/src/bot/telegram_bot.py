import asyncio
import os
from datetime import datetime

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from src.database.session import SessionLocal
from src.database.models import Site, ContentQueue, TelegramAdmin, AuditLog


_ENV_ADMIN_IDS: set[int] = set()
_OWNER_ID: int | None = None


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
    await update.message.reply_text("Autoseo bot sẵn sàng. Dùng /sites để xem danh sách.")


async def cmd_sites(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    db = SessionLocal()
    try:
        rows = db.query(Site).all()
        if not rows:
            await update.message.reply_text("Chưa có site nào.")
            return
        lines = [f"#{s.id}: {s.name} — {s.wp_url}" for s in rows]
        await update.message.reply_text("\n".join(lines))
    finally:
        db.close()
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
            f"Owner: {owner_str}",
            f"ENV admins: {env_ids}",
            "DB admins:",
            "- " + "\n- ".join(ids) if ids else "(trống)",
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
        await update.message.reply_text(f"Đã cấp quyền admin cho {grant_id}.")
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
        await update.message.reply_text(f"Đã thu quyền admin của {revoke_id}.")
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
            await update.message.reply_text(f"Không tìm thấy content #{content_id}.")
            return
        if item.status in {"approved", "published"}:
            await update.message.reply_text(f"Content #{content_id} đã ở trạng thái {item.status}, không thể duyệt lại.")
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
        await update.message.reply_text(f"Đã duyệt content #{content_id}.")
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
            await update.message.reply_text(f"Không tìm thấy content #{content_id}.")
            return
        if item.status == "published":
            await update.message.reply_text(f"Content #{content_id} đã published, không thể từ chối.")
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
            f"Đã từ chối content #{content_id} — lý do: {reason}."
        )
    finally:
        db.close()


def build_app() -> Application:
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        raise RuntimeError("Missing TELEGRAM_TOKEN env")
    global _ENV_ADMIN_IDS, _OWNER_ID
    _ENV_ADMIN_IDS = _load_env_admin_ids()
    _OWNER_ID = _load_owner_id()
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("sites", cmd_sites))
    app.add_handler(CommandHandler("myid", lambda u, c: u.message.reply_text(str(u.effective_user.id))))
    app.add_handler(CommandHandler("admins", cmd_admins))
    app.add_handler(CommandHandler("grant", cmd_grant))
    app.add_handler(CommandHandler("revoke", cmd_revoke_admin))
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




