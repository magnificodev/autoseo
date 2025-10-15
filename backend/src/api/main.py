import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from src.database.models import Base
from src.database.session import engine
from src.api.routes import auth as auth_router
from src.api.middleware.rate_limit import limiter
from slowapi.middleware import SlowAPIMiddleware


def create_app() -> FastAPI:
    app = FastAPI(title="Autoseo Backend")

    cors_origins = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    @app.on_event("startup")
    def _create_tables_on_startup() -> None:
        # Khởi tạo bảng nếu chưa có (tạm thời cho Phase 1, sau sẽ dùng Alembic)
        try:
            Base.metadata.create_all(bind=engine)
        except Exception:
            # Không làm gián đoạn startup; /health sẽ phản ánh trạng thái DB
            pass

    app.include_router(auth_router.router)

    @app.get("/health")
    def health():
        try:
            Base.metadata.create_all(bind=engine)
            db_status = "ok"
        except OperationalError:
            db_status = "degraded"
        return {"status": "ok", "db": db_status}

    return app


app = create_app()
