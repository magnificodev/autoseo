from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    wp_url = Column(String(500), nullable=False)
    wp_username = Column(String(255), nullable=False)
    wp_password_enc = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Auto generation config
    is_auto_enabled = Column(Boolean, default=False)
    schedule_cron = Column(String(64), default="0 * * * *")  # hourly by default
    daily_quota = Column(Integer, default=5)
    active_start_hour = Column(Integer, default=8)  # 24h
    active_end_hour = Column(Integer, default=22)


class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True)
    site_id = Column(
        Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    keyword = Column(String(255), nullable=False, index=True)
    language = Column(String(16), default="vi")
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site")


class ContentQueue(Base):
    __tablename__ = "content_queue"

    id = Column(Integer, primary_key=True)
    site_id = Column(
        Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(500), nullable=False)
    body = Column(Text, nullable=True)
    status = Column(
        String(32), default="pending"
    )  # pending|approved|rejected|published
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site")
