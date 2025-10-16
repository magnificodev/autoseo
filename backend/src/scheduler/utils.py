from datetime import datetime, timezone

from src.database.models import ContentQueue


def is_within_active_hours(now_utc: datetime, start_hour: int, end_hour: int) -> bool:
    current_hour = now_utc.hour
    if start_hour == end_hour:
        return True  # 24/7 window
    if start_hour < end_hour:
        return start_hour <= current_hour < end_hour
    return current_hour >= start_hour or current_hour < end_hour


def count_today_generated(db, site_id: int) -> int:
    start_of_day = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return (
        db.query(ContentQueue)
        .filter(ContentQueue.site_id == site_id)
        .filter(ContentQueue.created_at >= start_of_day.replace(tzinfo=None))
        .count()
    )


