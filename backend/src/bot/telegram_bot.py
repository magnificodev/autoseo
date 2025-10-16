import asyncio
import os
from datetime import datetime

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from src.database.session import SessionLocal
from src.database.models import Site, ContentQueue


_ADMIN_IDS: set[int] = set()


def _load_admin_ids() -> set[int]:
    raw = os.getenv("TELEGRAM_ADMINS", "").strip()
    if not raw:
        return set()
    ids: set[int] = set()
    for part in raw.split(","):
        token = part.strip()
        if not token:
            continue
        try:
            ids.add(int(token))
        except ValueError:
            # Ignore invalid tokens silently
            continue
    return ids


async def _ensure_admin(update: Update) -> bool:
    user = update.effective_user
    if user is None:
        return False
    if not _ADMIN_IDS:
        await update.message.reply_text("Bạn không có quyền thực hiện lệnh này (chưa cấu hình TELEGRAM_ADMINS).")
        return False
    if user.id not in _ADMIN_IDS:
        await update.message.reply_text("Bạn không có quyền thực hiện lệnh này.")
        return False
    return True


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
        item.status = "approved"
        item.updated_at = datetime.utcnow()
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
        item.status = "rejected"
        item.updated_at = datetime.utcnow()
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
    global _ADMIN_IDS
    _ADMIN_IDS = _load_admin_ids()
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("sites", cmd_sites))
    app.add_handler(CommandHandler("myid", lambda u, c: u.message.reply_text(str(u.effective_user.id))))
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


