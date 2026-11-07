import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"prob_{uuid.uuid4().hex[:12]}")
    seeker_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    solver_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    budget_type: Mapped[str] = mapped_column(String(20), default="fixed")  # range or fixed
    budget_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    budget_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    budget: Mapped[float] = mapped_column(Float, nullable=False)
    preferred_mode: Mapped[str] = mapped_column(String(20), default="video")  # chat, audio, video
    estimated_duration: Mapped[int] = mapped_column(Integer, default=30)  # 15, 30, 45, 60, 90 minutes
    preferred_availability: Mapped[list[dict]] = mapped_column(JSON, default=list)  # PreferredWindow[]
    urgency: Mapped[str] = mapped_column(String(20), default="flexible")  # today, this_week, flexible
    deadline: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(30), default="open", index=True)  # open, in_progress, resolved, closed
    offers_count: Mapped[int] = mapped_column(Integer, default=0)
    location: Mapped[str] = mapped_column(String(100), default="Remote (IST)")
    attachments: Mapped[list[dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    seeker: Mapped["User"] = relationship("User", foreign_keys=[seeker_id])
    solver: Mapped[Optional["User"]] = relationship("User", foreign_keys=[solver_id])
    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="problem", cascade="all, delete-orphan")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="problem")
