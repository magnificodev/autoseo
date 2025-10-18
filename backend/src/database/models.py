from datetime import datetime
from typing import List
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped

Base = declarative_base()


class Role(Base):
    __tablename__ = "roles"
    
    id: int = Column(Integer, primary_key=True)
    name: str = Column(String(50), unique=True, nullable=False)
    max_users: int = Column(Integer, default=-1)  # -1 = unlimited
    permissions: str = Column(Text)  # JSON string
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    
    id: int = Column(Integer, primary_key=True)
    email: str = Column(String(255), unique=True, nullable=False)
    password_hash: str = Column(String(255), nullable=False)
    role_id: int = Column(Integer, ForeignKey("roles.id"), default=3)  # Default to viewer
    is_active: bool = Column(Boolean, default=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users")


class Site(Base):
    __tablename__ = "sites"
    
    id: int = Column(Integer, primary_key=True)
    name: str = Column(String(255), nullable=False)
    wp_url: str = Column(String(500), nullable=False)
    wp_username: str = Column(String(255), nullable=False)
    wp_password_enc: str = Column(String(500), nullable=False)
    is_auto_enabled: bool = Column(Boolean, default=False)
    schedule_cron: str = Column(String(100), default="0 9 * * *")
    daily_quota: int = Column(Integer, default=5)
    active_start_hour: int = Column(Integer, default=9)
    active_end_hour: int = Column(Integer, default=18)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)


class Keyword(Base):
    __tablename__ = "keywords"
    
    id: int = Column(Integer, primary_key=True)
    keyword: str = Column(String(255), nullable=False)
    site_id: int = Column(Integer, ForeignKey("sites.id"))
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site: Mapped["Site"] = relationship("Site")


class ContentQueue(Base):
    __tablename__ = "content_queue"
    
    id: int = Column(Integer, primary_key=True)
    site_id: int = Column(Integer, ForeignKey("sites.id"))
    title: str = Column(String(500), nullable=False)
    body: str = Column(Text, nullable=False)
    status: str = Column(String(50), default="pending")
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    site: Mapped["Site"] = relationship("Site")


class TelegramAdmin(Base):
    __tablename__ = "telegram_admins"
    
    id: int = Column(Integer, primary_key=True)
    user_id: int = Column(Integer, nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: int = Column(Integer, primary_key=True)
    actor_user_id: int = Column(Integer, nullable=False)
    action: str = Column(String(100), nullable=False)
    target_type: str = Column(String(100), nullable=False)
    target_id: int = Column(Integer, nullable=False)
    note: str = Column(Text)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)