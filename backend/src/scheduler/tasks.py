from datetime import datetime
from celery.schedules import crontab
from .celery_app import app
from src.database.session import SessionLocal
from src.database.models import Site, ContentQueue


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
    # Example: run every hour for site id 1 (can be extended to per-site config)
    app.conf.beat_schedule.update(
        {
            "generate-draft-site-1-hourly": {
                "task": "src.scheduler.tasks.generate_draft_for_site",
                "schedule": crontab(minute=0),
                "args": (1,),
            }
        }
    )


register_default_schedule()


