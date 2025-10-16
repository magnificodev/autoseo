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


def build_app() -> Application:
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        raise RuntimeError("Missing TELEGRAM_TOKEN env")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("sites", cmd_sites))
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


