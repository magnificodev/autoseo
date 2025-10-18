import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.exc import OperationalError
from src.api.middleware.rate_limit import limiter
from src.api.routes import auth as auth_router
from src.api.routes import content as content_router
from src.api.routes import keywords as keywords_router
from src.api.routes import admins as admins_router
from src.api.routes import audit_logs as audit_logs_router
from src.api.routes import scheduler as scheduler_router
from src.api.routes import sites as sites_router
from src.api.routes import users as users_router
from src.api.routes import role_applications as role_applications_router
from src.database.session import engine
from src.core.settings import settings
from src.core.logging import configure_json_logging


def create_app() -> FastAPI:
    configure_json_logging()
    app = FastAPI(title=settings.project_name)

    cors_origins = settings.backend_cors_origins.split(",")
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
    app.include_router(admins_router.router)
    app.include_router(audit_logs_router.router)
    app.include_router(users_router.router)
    app.include_router(role_applications_router.router)

    @app.get("/health")
    def health():
        try:
            with engine.connect() as _:
                db_status = "ok"
        except OperationalError:
            db_status = "degraded"
        return {"status": "ok", "db": db_status}

    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        response = await call_next(request)
        # Placeholder for future correlation-id
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": exc.errors()})

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(status_code=500, content={"detail": "internal_error"})

    return app


app = create_app()
