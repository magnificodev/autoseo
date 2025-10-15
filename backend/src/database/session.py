import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def get_database_url() -> str:
    override = os.getenv("DATABASE_URL")
    if override:
        return override
    user = os.getenv("POSTGRES_USER", "autoseo")
    pwd = os.getenv("POSTGRES_PASSWORD", "autoseo")
    db = os.getenv("POSTGRES_DB", "autoseo")
    host = os.getenv("POSTGRES_HOST", "postgres")
    port = os.getenv("POSTGRES_PORT", "5432")
    return f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{db}"


engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


