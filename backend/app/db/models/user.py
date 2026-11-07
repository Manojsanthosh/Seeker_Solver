import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:12]}")
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="seeker")  # seeker, solver, admin
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    seeker_details: Mapped[Optional["SeekerDetails"]] = relationship(
        "SeekerDetails", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    solver_details: Mapped[Optional["SolverDetails"]] = relationship(
        "SolverDetails", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["AppNotification"]] = relationship(
        "AppNotification", back_populates="user", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"rtk_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")


class SeekerDetails(Base):
    __tablename__ = "seeker_details"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"skd_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_spent: Mapped[float] = mapped_column(Float, default=0.0)
    posted_problems_count: Mapped[int] = mapped_column(Integer, default=0)
    in_progress_count: Mapped[int] = mapped_column(Integer, default=0)
    resolved_count: Mapped[int] = mapped_column(Integer, default=0)
    upcoming_sessions_count: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship("User", back_populates="seeker_details")


class SolverDetails(Base):
    __tablename__ = "solver_details"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"svd_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    highest_qualification: Mapped[str] = mapped_column(String(100), default="Bachelor's")
    field_of_study: Mapped[str] = mapped_column(String(150), default="General")
    institution: Mapped[str] = mapped_column(String(200), default="")
    completion_year: Mapped[str] = mapped_column(String(20), default="")
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    skills: Mapped[list[str]] = mapped_column(JSON, default=list)  # stored as list of strings
    certifications: Mapped[list[dict]] = mapped_column(JSON, default=list)
    documents: Mapped[list[dict]] = mapped_column(JSON, default=list)
    linked_in: Mapped[str | None] = mapped_column(String(255), nullable=True)
    instagram: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    completed_jobs_count: Mapped[int] = mapped_column(Integer, default=0)
    active_jobs_count: Mapped[int] = mapped_column(Integer, default=0)
    total_earnings: Mapped[float] = mapped_column(Float, default=0.0)
    hourly_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="solver_details")
