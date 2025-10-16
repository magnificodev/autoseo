from datetime import datetime

from src.database.models import ContentQueue, Site
from src.scheduler.tasks import generate_draft_for_site


def setup_site(db, **overrides):
    data = dict(
        name="s",
        wp_url="http://example.com",
        wp_username="u",
        wp_password_enc="p",
        is_auto_enabled=True,
        schedule_cron="* * * * *",
        daily_quota=2,
        active_start_hour=0,
        active_end_hour=24,
    )
    data.update(overrides)
    site = Site(**data)
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


def test_quota_enforced(sqlite_db):
    db = sqlite_db
    site = setup_site(db, daily_quota=1)
    first = generate_draft_for_site(site.id)
    second = generate_draft_for_site(site.id)
    assert first > 0
    assert second == 0
    total = db.query(ContentQueue).filter(ContentQueue.site_id == site.id).count()
    assert total == 1


def test_active_hours_enforced(sqlite_db):
    db = sqlite_db
    # active window excluding current hour to force skip
    now_hour = datetime.utcnow().hour
    start = (now_hour + 1) % 24
    end = (now_hour + 2) % 24
    site = setup_site(db, active_start_hour=start, active_end_hour=end)
    res = generate_draft_for_site(site.id)
    assert res == 0
