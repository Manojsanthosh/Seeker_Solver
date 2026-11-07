import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"off_{uuid.uuid4().hex[:12]}")
    problem_id: Mapped[str] = mapped_column(String(50), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    solver_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    mode: Mapped[str] = mapped_column(String(20), default="video")
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    session_fee: Mapped[float] = mapped_column(Float, nullable=False)
    platform_fee: Mapped[float] = mapped_column(Float, nullable=False)
    gst: Mapped[float] = mapped_column(Float, nullable=False)
    total_payable: Mapped[float] = mapped_column(Float, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="sent", index=True)  # sent, accepted, declined, rescheduled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    problem: Mapped["Problem"] = relationship("Problem", back_populates="offers")
    solver: Mapped["User"] = relationship("User", foreign_keys=[solver_id])
    slots: Mapped[list["OfferSlot"]] = relationship("OfferSlot", back_populates="offer", cascade="all, delete-orphan")


class OfferSlot(Base):
    __tablename__ = "offer_slots"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"slt_{uuid.uuid4().hex[:12]}")
    offer_id: Mapped[str] = mapped_column(String(50), ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    start_time: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g., "10:30 AM"
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g., "11:00 AM"
    is_best_match: Mapped[bool] = mapped_column(Boolean, default=False)
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False)

    offer: Mapped["Offer"] = relationship("Offer", back_populates="slots")
