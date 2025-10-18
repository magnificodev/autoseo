import os
import sys
import tempfile

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(__file__).rsplit("/tests/", 1)[0])

os.environ.setdefault(
    "DATABASE_URL", "sqlite:///" + tempfile.gettempdir() + "/autoseo_test.db"
)
os.environ.setdefault("BACKEND_CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("JWT_SECRET", "test-secret")

from src.api.main import app  # noqa: E402
from src.database.session import SessionLocal, engine  # noqa: E402
from src.database.models import Base  # noqa: E402


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture()
def sqlite_db():
    # Clean database before each test
    Base.metadata.drop_all(bind=engine)
    # Ensure tables exist for the SQLite test database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up after test
        Base.metadata.drop_all(bind=engine)
