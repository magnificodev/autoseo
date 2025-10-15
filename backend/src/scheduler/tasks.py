from datetime import datetime
from sqlalchemy.exc import OperationalError

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
