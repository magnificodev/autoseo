import os
import tempfile

import pytest
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, str(__file__).rsplit('/tests/', 1)[0])

os.environ.setdefault(
    "DATABASE_URL", "sqlite:///" + tempfile.gettempdir() + "/autoseo_test.db"
)
os.environ.setdefault("BACKEND_CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("JWT_SECRET", "test-secret")

from src.api.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    return TestClient(app)
