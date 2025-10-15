from datetime import datetime
import os

from celery.schedules import crontab
from src.database.models import ContentQueue, Site
from src.database.session import SessionLocal

from .celery_app import app


@app.task
def generate_draft_for_site(site_id: int) -> int:
    db = SessionLocal()
    try:
        site = db.query(Site).get(site_id)
        if not site:
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
            minute, hour, dom, month, dow = (s.schedule_cron or "0 * * * *").split()
            schedule[f"auto-generate-site-{s.id}"] = {
                "task": "src.scheduler.tasks.generate_draft_for_site",
                "schedule": crontab(minute=minute, hour=hour, day_of_month=dom, month_of_year=month, day_of_week=dow),
                "args": (s.id,),
            }
        app.conf.beat_schedule.update(schedule)
    finally:
        db.close()


register_default_schedule()
