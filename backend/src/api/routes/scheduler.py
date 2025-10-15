from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.api.deps.auth import get_current_user
from src.scheduler.tasks import generate_draft_for_site


router = APIRouter(prefix="/scheduler", tags=["scheduler"])


class RunDraftNowIn(BaseModel):
    site_id: int
    sync: bool = False  # for quick local test, run inline instead of celery


@router.post("/run-draft-now")
def run_draft_now(body: RunDraftNowIn, user=Depends(get_current_user)):
    if body.sync:
        draft_id = generate_draft_for_site(body.site_id)
        return {"ok": True, "mode": "sync", "draft_id": draft_id}
    # async via celery
    async_result = generate_draft_for_site.delay(body.site_id)
    return {"ok": True, "mode": "async", "task_id": async_result.id}


