import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.exc import OperationalError
from src.api.middleware.rate_limit import limiter
from src.api.routes import auth as auth_router
from src.api.routes import content as content_router
from src.api.routes import keywords as keywords_router
from src.api.routes import scheduler as scheduler_router
from src.api.routes import sites as sites_router
from src.database.session import engine


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

    app.include_router(auth_router.router)
    app.include_router(sites_router.router)
    app.include_router(keywords_router.router)
    app.include_router(content_router.router)
    app.include_router(scheduler_router.router)

    @app.get("/health")
    def health():
        try:
            with engine.connect() as _:
                db_status = "ok"
        except OperationalError:
            db_status = "degraded"
        return {"status": "ok", "db": db_status}

    return app


app = create_app()
