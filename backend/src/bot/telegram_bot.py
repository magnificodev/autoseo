#!/usr/bin/env python3
"""
Autoseo Telegram Bot - Minimal Version
Chỉ có lệnh /start và phản hồi cơ bản
"""

import logging
import os

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# Setup logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Lệnh chính - thông báo bot hoạt động"""
    await update.message.reply_text(
        "🚀 <b>Autoseo Bot đang hoạt động</b>\n\n"
        "📊 <b>Dashboard:</b> <code>http://40.82.144.18</code>\n"
        "🔧 <b>Quản lý:</b> Sites, Keywords, Content, Admins\n"
        "📱 <b>Bot:</b> Đang phát triển...\n\n"
        "💡 <i>Sử dụng Dashboard để quản lý hệ thống</i>",
        parse_mode="HTML",
    )


async def cmd_unknown(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý tất cả lệnh không xác định"""
    await update.message.reply_text(
        "❓ <b>Lệnh không xác định</b>\n\n"
        "📱 <b>Bot đang phát triển...</b>\n"
        "📊 <b>Dashboard:</b> <code>http://40.82.144.18</code>\n\n"
        "💡 <i>Sử dụng Dashboard để quản lý hệ thống</i>",
        parse_mode="HTML",
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý tin nhắn thường"""
    await update.message.reply_text(
        "📱 <b>Autoseo Bot</b>\n\n"
        "Gõ <b>/start</b> để xem thông tin\n"
        "📊 <b>Dashboard:</b> <code>http://40.82.144.18</code>",
        parse_mode="HTML",
    )


def build_app() -> Application:
    """Tạo ứng dụng bot đơn giản - không có menu lệnh"""
    token = os.getenv("TELEGRAM_TOKEN")
    if not token:
        raise RuntimeError("Missing TELEGRAM_TOKEN env")
    
    app = Application.builder().token(token).build()
    
    # Chỉ có 1 lệnh cơ bản - không hiển thị menu
    app.add_handler(CommandHandler("start", cmd_start))

    # Xử lý tất cả lệnh khác
    app.add_handler(MessageHandler(filters.COMMAND, cmd_unknown))
    
    # Xử lý tin nhắn thường
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Xóa menu lệnh để bot "ẩn" hoàn toàn
    try:
        app.bot.delete_my_commands()
    except Exception:
        pass  # Ignore if commands can't be deleted
    
    return app


def main() -> None:
    """Chạy bot"""
    app = build_app()

    # Ensure bot is in polling mode (remove webhook if previously set)
    try:
        app.bot.delete_webhook()
    except Exception:
        pass

    logger.info("Starting Autoseo Bot (Minimal Version)...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
