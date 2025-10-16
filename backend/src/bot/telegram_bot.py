import asyncio
import os

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from src.database.session import SessionLocal
from src.database.models import Site


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
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /approve <content_id>")
        return
    content_id = args[0]
    await update.message.reply_text(f"[STUB] Đã nhận yêu cầu duyệt content #{content_id}.")


async def cmd_reject(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    args = context.args if context.args else []
    if len(args) < 1:
        await update.message.reply_text("Cách dùng: /reject <content_id> [lý_do]")
        return
    content_id = args[0]
    reason = " ".join(args[1:]) if len(args) > 1 else "không nêu lý do"
    await update.message.reply_text(
        f"[STUB] Đã nhận yêu cầu từ chối content #{content_id} — lý do: {reason}."
    )


def build_app() -> Application:
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        raise RuntimeError("Missing TELEGRAM_TOKEN env")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("sites", cmd_sites))
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


