import os
from celery import Celery


broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")

app = Celery("autoseo", broker=broker_url, backend=result_backend)
app.conf.timezone = "Asia/Ho_Chi_Minh"
app.conf.beat_schedule = {}


