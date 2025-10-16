from datetime import datetime, timezone

from celery.schedules import crontab
from sqlalchemy.exc import OperationalError
from src.database.models import ContentQueue, Site
from src.database.session import SessionLocal

from .celery_app import app


def _is_within_active_hours(now_utc: datetime, start_hour: int, end_hour: int) -> bool:
    # Treat configured hours as UTC to avoid server TZ ambiguity
    current_hour = now_utc.hour
    if start_hour == end_hour:
        return True  # 24/7
    if start_hour < end_hour:
        return start_hour <= current_hour < end_hour
    # Overnight window (e.g., 22 -> 6)
    return current_hour >= start_hour or current_hour < end_hour


def _count_today_generated(db, site_id: int) -> int:
    # Count rows created today UTC
    start_of_day = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return (
        db.query(ContentQueue)
        .filter(ContentQueue.site_id == site_id)
        .filter(ContentQueue.created_at >= start_of_day.replace(tzinfo=None))
        .count()
    )


@app.task
def generate_draft_for_site(site_id: int) -> int:
    db = SessionLocal()
    try:
        site = db.query(Site).get(site_id)
        if not site:
            return 0
        # Enforce active hours
        now_utc = datetime.utcnow().replace(tzinfo=timezone.utc)
        if not _is_within_active_hours(
            now_utc, site.active_start_hour or 0, site.active_end_hour or 0
        ):
            return 0
        # Enforce daily quota
        generated_today = _count_today_generated(db, site.id)
        if site.daily_quota is not None and generated_today >= (site.daily_quota or 0):
            return 0
        title = f"Auto Draft {datetime.utcnow().isoformat()}"
        row = ContentQueue(site_id=site.id, title=title, body=None, status="pending")
        db.add(row)
        db.commit()
        return row.id
    finally:
        db.close()


def register_default_schedule():
    # Build schedule dynamically from sites table where is_auto_enabled
    db = SessionLocal()
    try:
        sites = db.query(Site).filter(Site.is_auto_enabled == True).all()  # noqa: E712
        schedule = {}
        for s in sites:
            try:
                minute, hour, dom, month, dow = (s.schedule_cron or "0 * * * *").split()
            except ValueError:
                minute, hour, dom, month, dow = ("0", "*", "*", "*", "*")
            schedule[f"auto-generate-site-{s.id}"] = {
                "task": "src.scheduler.tasks.generate_draft_for_site",
                "schedule": crontab(
                    minute=minute,
                    hour=hour,
                    day_of_month=dom,
                    month_of_year=month,
                    day_of_week=dow,
                ),
                "args": (s.id,),
            }
        app.conf.beat_schedule.update(schedule)
    except OperationalError:
        pass
    finally:
        db.close()


try:
    register_default_schedule()
except Exception:
    # Avoid import-time failures in environments where DB isn't ready (e.g. CI)
    pass
