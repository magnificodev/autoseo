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
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

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
    """Lệnh duy nhất - thông báo bot hoạt động"""
    await update.message.reply_text(
        "🚀 <b>Autoseo Bot đang hoạt động</b>\n\n"
        "📊 <b>Dashboard:</b> <code>http://localhost:3000</code>\n"
        "🔧 <b>Quản lý:</b> Sites, Keywords, Content, Admins\n"
        "📱 <b>Bot:</b> Đang phát triển...\n\n"
        "💡 <i>Sử dụng Dashboard để quản lý hệ thống</i>",
        parse_mode=ParseMode.HTML,
    )




async def cmd_unknown(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý tất cả lệnh không xác định"""
    await update.message.reply_text(
        "❓ <b>Lệnh không xác định</b>\n\n"
        "📱 <b>Bot đang phát triển...</b>\n"
        "📊 <b>Dashboard:</b> <code>http://localhost:3000</code>\n\n"
        "💡 <i>Sử dụng Dashboard để quản lý hệ thống</i>",
        parse_mode=ParseMode.HTML,
    )


def _today_range_utc() -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    return start, end


# Keep these functions for future use but don't expose as commands
async def _cmd_queue_placeholder(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xem hàng đợi nội dung - đơn giản hóa"""
    if not await _ensure_admin(update):
        return

    args = context.args if context.args else []
    if not args:
        await update.message.reply_text("Cách dùng: /queue <site_id>\nVí dụ: /queue 1")
        return

    try:
        site_id = int(args[0])

        # Check if site exists
        db = SessionLocal()
        try:
            site = db.get(Site, site_id)
            if not site:
                await update.message.reply_text(
                    f"❌ Không tìm thấy site <code>#{site_id}</code>",
                    parse_mode=ParseMode.HTML,
                )
                return

            # Show all statuses in one view
            await _send_queue_overview(
                bot=context.bot, chat_id=update.effective_chat.id, site_id=site_id
            )

        finally:
            db.close()

    except ValueError:
        await update.message.reply_text("❌ Site ID phải là số")
    except Exception as e:
        await update.message.reply_text(f"❌ Lỗi: {e}")


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


def _get_status_counts(site_id: int) -> dict[str, int]:
    """Lấy số lượng bài theo từng trạng thái"""
    db = SessionLocal()
    try:
        counts = {}
        for status in ["pending", "approved", "rejected", "published"]:
            count = (
                db.query(ContentQueue)
                .filter(ContentQueue.site_id == site_id, ContentQueue.status == status)
                .count()
            )
            counts[status] = count
        return counts
    finally:
        db.close()


async def _send_queue_overview(bot, chat_id: int, site_id: int) -> None:
    """Hiển thị tổng quan tất cả trạng thái"""
    db = SessionLocal()
    try:
        site = db.get(Site, site_id)
        if not site:
            await bot.send_message(
                chat_id,
                f"❌ Không tìm thấy site <code>#{site_id}</code>",
                parse_mode=ParseMode.HTML,
            )
            return

        # Get counts for all statuses
        counts = _get_status_counts(site_id)
        total = sum(counts.values())

        if total == 0:
            await bot.send_message(
                chat_id,
                f"ℹ️ <i>Site {site.name} chưa có nội dung nào.</i>",
                parse_mode=ParseMode.HTML,
            )
            return

        # Create overview message
        status_icons = {
            "pending": "⏳",
            "approved": "✅",
            "rejected": "🛑",
            "published": "📢",
        }

        header = f"📥 <b>Queue Overview</b> • {site.name} (ID: {site_id})\n"
        header += f"📊 <b>Tổng cộng:</b> {total} bài\n\n"

        # Show counts for each status
        status_lines = []
        for status, count in counts.items():
            if count > 0:
                icon = status_icons.get(status, "❓")
                status_lines.append(f"{icon} <b>{status.title()}:</b> {count} bài")

        overview_text = header + "\n".join(status_lines)

        # Create buttons for each status with content
        buttons = []
        for status, count in counts.items():
            if count > 0:
                icon = status_icons.get(status, "❓")
                buttons.append(
                    [
                        InlineKeyboardButton(
                            f"{icon} {status.title()} ({count})",
                            callback_data=f"view_status:{site_id}:{status}",
                        )
                    ]
                )

        # Add refresh button
        buttons.append(
            [
                InlineKeyboardButton(
                    "🔄 Refresh", callback_data=f"refresh_overview:{site_id}"
                )
            ]
        )

        await bot.send_message(
            chat_id,
            overview_text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(buttons),
        )

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
                        "✅ Bulk Approve",
                        callback_data=f"bulk_approve_input:{site_id}:{offset}:{limit}",
                    ),
                    InlineKeyboardButton(
                        "🛑 Bulk Reject",
                        callback_data=f"bulk_reject_input:{site_id}:{offset}:{limit}",
                    ),
                ],
            ]
        )
    elif status == "approved":
        header_rows.append(
            [
                InlineKeyboardButton(
                    "📢 Bulk Publish",
                    callback_data=f"bulk_publish_input:{site_id}:{offset}:{limit}",
                ),
            ]
        )

    # Không có filter buttons nữa - sử dụng lệnh text

    # Gửi danh sách dạng bảng đơn giản
    if rows:
        # Tạo bảng đơn giản
        table_lines = []
        for i, r in enumerate(rows, 1):
            # Format: #123  Title  [👁] [✅] [🛑]
            title_short = r.title[:30] + "..." if len(r.title) > 30 else r.title
            table_lines.append(f"<b>#{r.id}</b>  {title_short}  [👁] [✅] [🛑]")

        # Tạo nút hành động cho từng item
        action_buttons = []
        for i, r in enumerate(rows, 1):
            row_buttons = []

            # Nút View
            row_buttons.append(
                InlineKeyboardButton(
                    text=f"👁 {i}",
                    callback_data=f"view:{r.id}:{site_id}:{offset}:{limit}:{status}",
                )
            )

            # Nút hành động theo trạng thái
            if status == "pending":
                row_buttons.extend(
                    [
                        InlineKeyboardButton(
                            text=f"✅ {i}",
                            callback_data=f"approve:{r.id}:{site_id}:{offset}:{limit}:{status}",
                        ),
                        InlineKeyboardButton(
                            text=f"🛑 {i}",
                            callback_data=f"reject:{r.id}:{site_id}:{offset}:{limit}:{status}",
                        ),
                    ]
                )
            elif status == "approved":
                row_buttons.append(
                    InlineKeyboardButton(
                        text=f"📢 {i}",
                        callback_data=f"publish:{r.id}:{site_id}:{offset}:{limit}:{status}",
                    )
                )
            # rejected không có nút hành động, chỉ xem

            action_buttons.append(row_buttons)

        # Gộp tất cả vào 1 message
        full_text = f"{header}\n\n" + "\n".join(table_lines)

        await bot.send_message(
            chat_id,
            full_text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(header_rows + action_buttons),
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
                                "⬅️ Back",
                                callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:pending",
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
                                "⬅️ Back",
                                callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:{status_ctx}",
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
                                "⬅️ Back",
                                callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:pending",
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
                                "⬅️ Back",
                                callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:approved",
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
                                "⬅️ Back",
                                callback_data=f"page:{site_ctx}:{offset_ctx}:{limit_ctx}:{status_ctx}",
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

        if action == "bulk_approve_input":
            try:
                site_id = int(parts[1])
                offset = int(parts[2])
                limit = int(parts[3])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk approve không hợp lệ.")
                return
            # Lưu context để sử dụng sau
            context.user_data[f"bulk_site_{query.from_user.id}"] = site_id
            context.user_data[f"bulk_offset_{query.from_user.id}"] = offset
            context.user_data[f"bulk_limit_{query.from_user.id}"] = limit
            context.user_data[f"bulk_status_{query.from_user.id}"] = "pending"
            await query.edit_message_text(
                "✅ <b>Bulk Approve</b>\n\nNhập số lượng bài muốn approve (1-20):",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "Cancel",
                                callback_data=f"page:{site_id}:{offset}:{limit}:pending",
                            )
                        ]
                    ]
                ),
            )
            return

        if action == "bulk_reject_input":
            try:
                site_id = int(parts[1])
                offset = int(parts[2])
                limit = int(parts[3])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk reject không hợp lệ.")
                return
            # Lưu context để sử dụng sau
            context.user_data[f"bulk_site_{query.from_user.id}"] = site_id
            context.user_data[f"bulk_offset_{query.from_user.id}"] = offset
            context.user_data[f"bulk_limit_{query.from_user.id}"] = limit
            context.user_data[f"bulk_status_{query.from_user.id}"] = "pending"
            await query.edit_message_text(
                "🛑 <b>Bulk Reject</b>\n\nNhập số lượng bài muốn reject (1-20):",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "Cancel",
                                callback_data=f"page:{site_id}:{offset}:{limit}:pending",
                            )
                        ]
                    ]
                ),
            )
            return

        if action == "bulk_publish_input":
            try:
                site_id = int(parts[1])
                offset = int(parts[2])
                limit = int(parts[3])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk publish không hợp lệ.")
                return
            # Lưu context để sử dụng sau
            context.user_data[f"bulk_site_{query.from_user.id}"] = site_id
            context.user_data[f"bulk_offset_{query.from_user.id}"] = offset
            context.user_data[f"bulk_limit_{query.from_user.id}"] = limit
            context.user_data[f"bulk_status_{query.from_user.id}"] = "approved"
            await query.edit_message_text(
                "📢 <b>Bulk Publish</b>\n\nNhập số lượng bài muốn publish (1-20):",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                "Cancel",
                                callback_data=f"page:{site_id}:{offset}:{limit}:approved",
                            )
                        ]
                    ]
                ),
            )
            return

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
                                    "⬅️ Back",
                                    callback_data=f"page:{site_id}:{offset}:{limit}:pending",
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
                            text="Cancel",
                            callback_data=f"page:{site_id}:{offset}:{limit}:pending",
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
                                "⬅️ Back",
                                callback_data=f"page:{site_id}:{offset}:{limit}:pending",
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

        if action == "bulk_approve_exec":
            try:
                count = int(parts[1])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk approve không hợp lệ.")
                return
            # Lấy thông tin từ context
            site_id = context.user_data.get(f"bulk_site_{query.from_user.id}", 1)
            offset = context.user_data.get(f"bulk_offset_{query.from_user.id}", 0)
            limit = context.user_data.get(f"bulk_limit_{query.from_user.id}", 10)
            status = context.user_data.get(
                f"bulk_status_{query.from_user.id}", "pending"
            )
            rows = _fetch_by_status(site_id, status, offset, count)
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
                                "⬅️ Back to Queue",
                                callback_data=f"page:{site_id}:{offset}:{limit}:{status}",
                            )
                        ]
                    ]
                ),
            )
            return

        if action == "bulk_reject_exec":
            try:
                count = int(parts[1])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk reject không hợp lệ.")
                return
            # Hiển thị menu chọn lý do
            buttons = [
                [
                    InlineKeyboardButton(
                        "Duplicate",
                        callback_data=f"bulk_reject_confirm:{count}:duplicate",
                    ),
                    InlineKeyboardButton(
                        "LowQuality",
                        callback_data=f"bulk_reject_confirm:{count}:lowquality",
                    ),
                ],
                [
                    InlineKeyboardButton(
                        "Irrelevant",
                        callback_data=f"bulk_reject_confirm:{count}:irrelevant",
                    ),
                    InlineKeyboardButton(
                        "NoReason",
                        callback_data=f"bulk_reject_confirm:{count}:noreason",
                    ),
                ],
                [
                    InlineKeyboardButton("❌ Cancel", callback_data="bulk_cancel"),
                ],
            ]
            await query.edit_message_text(
                f"🛑 <b>Bulk Reject {count} mục</b>\n\nChọn lý do từ chối:",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(buttons),
            )
            return

        if action == "bulk_publish_exec":
            try:
                count = int(parts[1])
            except Exception:
                await query.edit_message_text("❌ Tham số bulk publish không hợp lệ.")
                return
            # Lấy thông tin từ context
            site_id = context.user_data.get(f"bulk_site_{query.from_user.id}", 1)
            offset = context.user_data.get(f"bulk_offset_{query.from_user.id}", 0)
            limit = context.user_data.get(f"bulk_limit_{query.from_user.id}", 10)
            status = context.user_data.get(
                f"bulk_status_{query.from_user.id}", "approved"
            )
            rows = _fetch_by_status(site_id, status, offset, count)
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
                                "⬅️ Back to Queue",
                                callback_data=f"page:{site_id}:{offset}:{limit}:{status}",
                            )
                        ]
                    ]
                ),
            )
            return

        if action == "bulk_reject_confirm":
            try:
                count = int(parts[1])
                reason_key = parts[2]
            except Exception:
                await query.edit_message_text(
                    "❌ Tham số bulk reject confirm không hợp lệ."
                )
                return
            reason_map = {
                "duplicate": "duplicate",
                "lowquality": "low_quality",
                "irrelevant": "irrelevant",
                "noreason": "",
            }
            reason = reason_map.get(reason_key, reason_key)
            # Lấy thông tin từ context
            site_id = context.user_data.get(f"bulk_site_{query.from_user.id}", 1)
            offset = context.user_data.get(f"bulk_offset_{query.from_user.id}", 0)
            limit = context.user_data.get(f"bulk_limit_{query.from_user.id}", 10)
            status = context.user_data.get(
                f"bulk_status_{query.from_user.id}", "pending"
            )
            rows = _fetch_by_status(site_id, status, offset, count)
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
                                "⬅️ Back to Queue",
                                callback_data=f"page:{site_id}:{offset}:{limit}:{status}",
                            )
                        ]
                    ]
                ),
            )
            return

        if action == "bulk_cancel":
            await query.edit_message_text("❌ Đã hủy bulk action.")
            return

        # New simplified handlers
        if action == "view_status":
            # callback: view_status:<site_id>:<status>
            try:
                site_id = int(parts[1])
                status = parts[2]
            except Exception:
                await query.edit_message_text("❌ Tham số không hợp lệ.")
                return
            await query.edit_message_text("🔄 Đang tải...")
            await _send_queue_page(
                bot=context.bot,
                chat_id=query.message.chat_id,
                site_id=site_id,
                offset=0,
                limit=10,
                status=status,
            )
            return

        if action == "refresh_overview":
            # callback: refresh_overview:<site_id>
            try:
                site_id = int(parts[1])
            except Exception:
                await query.edit_message_text("❌ Tham số không hợp lệ.")
                return
            await query.edit_message_text("🔄 Đang tải...")
            await _send_queue_overview(
                bot=context.bot, chat_id=query.message.chat_id, site_id=site_id
            )
            return

        if action == "quick_queue":
            # callback: quick_queue:<site_id>
            try:
                site_id = int(parts[1])
            except Exception:
                await query.edit_message_text("❌ Tham số không hợp lệ.")
                return
            await query.edit_message_text("🔄 Đang tải...")
            await _send_queue_overview(
                bot=context.bot, chat_id=query.message.chat_id, site_id=site_id
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


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xem tổng quan tất cả sites"""
    if not await _ensure_admin(update):
        return

    db = SessionLocal()
    try:
        sites = db.query(Site).all()
        if not sites:
            await update.message.reply_text(
                "ℹ️ <i>Chưa có site nào.</i>", parse_mode=ParseMode.HTML
            )
            return

        status_icons = {
            "pending": "⏳",
            "approved": "✅",
            "rejected": "🛑",
            "published": "📢",
        }

        header = "📊 <b>System Status</b>\n\n"

        total_counts = {"pending": 0, "approved": 0, "rejected": 0, "published": 0}
        site_lines = []

        for site in sites:
            counts = _get_status_counts(site.id)
            site_total = sum(counts.values())

            # Update totals
            for status, count in counts.items():
                total_counts[status] += count

            if site_total > 0:
                status_summary = []
                for status, count in counts.items():
                    if count > 0:
                        icon = status_icons.get(status, "❓")
                        status_summary.append(f"{icon}{count}")

                site_lines.append(
                    f"<b>#{site.id}</b> {site.name} • {site_total} bài\n"
                    f"   {' '.join(status_summary)}"
                )

        # Create message
        message_lines = [header]

        # Overall totals
        total_all = sum(total_counts.values())
        if total_all > 0:
            total_summary = []
            for status, count in total_counts.items():
                if count > 0:
                    icon = status_icons.get(status, "❓")
                    total_summary.append(f"{icon} {count}")

            message_lines.append(f"<b>📈 Tổng cộng:</b> {total_all} bài")
            message_lines.append(f"   {' '.join(total_summary)}")
            message_lines.append("")

        # Per site details
        if site_lines:
            message_lines.append("<b>📋 Chi tiết theo site:</b>")
            message_lines.extend(site_lines)

        full_message = "\n".join(message_lines)

        # Split if too long
        if len(full_message) > 4000:
            # Send header first
            await update.message.reply_text(
                header + f"<b>📈 Tổng cộng:</b> {total_all} bài",
                parse_mode=ParseMode.HTML,
            )

            # Send sites in chunks
            chunk = []
            for line in site_lines:
                if len("\n".join(chunk + [line])) > 3500:
                    await update.message.reply_text(
                        "\n".join(chunk), parse_mode=ParseMode.HTML
                    )
                    chunk = [line]
                else:
                    chunk.append(line)

            if chunk:
                await update.message.reply_text(
                    "\n".join(chunk), parse_mode=ParseMode.HTML
                )
        else:
            await update.message.reply_text(full_message, parse_mode=ParseMode.HTML)

    finally:
        db.close()


async def cmd_setstatus(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Cập nhật trạng thái bài viết trực tiếp"""
    if not await _ensure_admin(update):
        return

    args = context.args if context.args else []
    if len(args) < 2:
        await update.message.reply_text(
            "Cách dùng: /setstatus <content_id> <status>\n"
            "Status: pending, approved, rejected, published\n"
            "Ví dụ: /setstatus 123 published"
        )
        return

    try:
        content_id = int(args[0])
        new_status = args[1].lower().strip()

        if new_status not in ["pending", "approved", "rejected", "published"]:
            await update.message.reply_text(
                "❌ Trạng thái không hợp lệ. Dùng: pending, approved, rejected, published"
            )
            return

        db = SessionLocal()
        try:
            item = db.get(ContentQueue, content_id)
            if not item:
                await update.message.reply_text(
                    f"❌ Không tìm thấy bài <code>#{content_id}</code>",
                    parse_mode=ParseMode.HTML,
                )
                return

            old_status = item.status
            item.status = new_status
            item.updated_at = datetime.utcnow()

            # Ghi audit log
            audit_log = AuditLog(
                actor_user_id=update.effective_user.id,
                action="setstatus",
                target_type="content_queue",
                target_id=content_id,
                note=f"Changed from {old_status} to {new_status}",
                created_at=datetime.utcnow(),
            )
            db.add(audit_log)
            db.commit()

            status_icons = {
                "pending": "⏳",
                "approved": "✅",
                "rejected": "🛑",
                "published": "📢",
            }

            await update.message.reply_text(
                f"✅ <b>Đã cập nhật trạng thái</b>\n\n"
                f"<b>#{content_id}</b> • {item.title[:50]}...\n"
                f"{status_icons.get(old_status, '❓')} {old_status} → {status_icons.get(new_status, '❓')} {new_status}",
                parse_mode=ParseMode.HTML,
            )

        except Exception as e:
            await update.message.reply_text(f"❌ Lỗi: {e}")
            db.rollback()
        finally:
            db.close()

    except ValueError:
        await update.message.reply_text("❌ ID bài viết phải là số")


async def cmd_createtest(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Tạo bài test để kiểm tra phân trang"""
    if not await _ensure_admin(update):
        return

    args = context.args if context.args else []
    count = int(args[0]) if len(args) > 0 and args[0].isdigit() else 20
    count = max(1, min(count, 100))  # Giới hạn 1-100

    db = SessionLocal()
    try:
        # Lấy site đầu tiên
        site = db.query(Site).first()
        if not site:
            await update.message.reply_text(
                "❌ Không có site nào. Vui lòng tạo site trước."
            )
            return

        # Tạo bài test
        created = 0
        for i in range(1, count + 1):
            content = ContentQueue(
                site_id=site.id,
                title=f"Test Article #{i:03d} - {datetime.now().strftime('%H:%M:%S')}",
                body=f"Đây là nội dung test số {i}. Bài viết này được tạo tự động để test tính năng phân trang của Telegram bot. Nội dung bao gồm các thông tin cần thiết để kiểm tra các chức năng approve, reject và publish. Bài viết có độ dài vừa phải để hiển thị tốt trong giao diện bot.",
                status="pending",
                created_at=datetime.utcnow(),
            )
            db.add(content)
            created += 1

        db.commit()

        # Thống kê
        total_pending = (
            db.query(ContentQueue)
            .filter(ContentQueue.site_id == site.id, ContentQueue.status == "pending")
            .count()
        )

        await update.message.reply_text(
            f"✅ <b>Đã tạo {created} bài test</b>\n\n"
            f"📊 <b>Thống kê site #{site.id}:</b>\n"
            f"• Pending: {total_pending} bài\n"
            f"• Có thể test: <code>/queue {site.id} pending</code>\n"
            f"• Phân trang: <code>/queue {site.id} 10 pending</code>",
            parse_mode=ParseMode.HTML,
        )

    except Exception as e:
        await update.message.reply_text(f"❌ Lỗi: {e}")
        db.rollback()
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
    # Scope per-user: chat_member in 1:1 chat - simplified to 5 basic commands
    commands = [
        {"command": "help", "description": "Danh sách lệnh"},
        {"command": "queue", "description": "Xem và duyệt bài"},
        {"command": "sites", "description": "Danh sách sites"},
        {"command": "status", "description": "Tổng quan hệ thống"},
        {"command": "setstatus", "description": "Cập nhật trạng thái"},
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
    """Xem danh sách sites với thông tin cơ bản"""
    db = SessionLocal()
    try:
        sites = db.query(Site).all()
        if not sites:
            await update.message.reply_text(
                "ℹ️ <i>Chưa có site nào.</i>", parse_mode=ParseMode.HTML
            )
            return

        header = "🌐 <b>Danh sách Sites</b>\n\n"

        site_lines = []
        for site in sites:
            # Get content counts
            counts = _get_status_counts(site.id)
            total = sum(counts.values())

            # Status indicators
            auto_status = "🟢" if site.is_auto_enabled else "🔴"
            quota_info = (
                f" (quota: {site.daily_quota or '∞'})" if site.daily_quota else ""
            )

            site_info = f"<b>#{site.id}</b> {site.name} {auto_status}\n"
            site_info += f"↳ <code>{site.wp_url}</code>\n"
            site_info += f"↳ 📊 {total} bài{quota_info}"

            site_lines.append(site_info)

        full_message = header + "\n\n".join(site_lines)

        # Add quick action buttons
        buttons = []
        for site in sites:
            buttons.append(
                [
                    InlineKeyboardButton(
                        f"📥 Queue #{site.id}", callback_data=f"quick_queue:{site.id}"
                    )
                ]
            )

        await update.message.reply_text(
            full_message,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(buttons) if buttons else None,
        )
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


async def handle_bulk_input(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý input số lượng cho bulk actions"""
    if not await _ensure_admin(update):
        return

    user_id = update.effective_user.id
    text = update.message.text.strip()

    # Kiểm tra xem có phải là số không
    try:
        count = int(text)
        if not (1 <= count <= 20):
            await update.message.reply_text("❌ Số lượng phải từ 1 đến 20.")
            return
    except ValueError:
        await update.message.reply_text("❌ Vui lòng nhập số hợp lệ (1-20).")
        return

    # Lưu vào context để sử dụng trong callback
    context.user_data[f"bulk_count_{user_id}"] = count

    # Hiển thị menu chọn action
    buttons = [
        [
            InlineKeyboardButton(
                "✅ Approve", callback_data=f"bulk_approve_exec:{count}"
            ),
            InlineKeyboardButton(
                "🛑 Reject", callback_data=f"bulk_reject_exec:{count}"
            ),
        ],
        [
            InlineKeyboardButton(
                "📢 Publish", callback_data=f"bulk_publish_exec:{count}"
            ),
        ],
        [
            InlineKeyboardButton("❌ Cancel", callback_data="bulk_cancel"),
        ],
    ]

    await update.message.reply_text(
        f"🎯 <b>Bulk Action</b>\n\nSố lượng: <b>{count}</b> bài\nChọn hành động:",
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(buttons),
    )


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
    # Only 5 basic commands - simplified bot
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("queue", cmd_queue))
    app.add_handler(CommandHandler("sites", cmd_sites))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("setstatus", cmd_setstatus))
    app.add_handler(CallbackQueryHandler(on_action_button))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_bulk_input))
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
