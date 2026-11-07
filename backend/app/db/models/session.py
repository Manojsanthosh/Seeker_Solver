import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"sess_{uuid.uuid4().hex[:12]}")
    problem_id: Mapped[str] = mapped_column(String(50), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    seeker_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    solver_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    offer_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("offers.id", ondelete="SET NULL"), nullable=True)
    
    # Slot Details
    slot_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    slot_date: Mapped[str] = mapped_column(String(20), nullable=False)
    slot_start_time: Mapped[str] = mapped_column(String(20), nullable=False)
    slot_end_time: Mapped[str] = mapped_column(String(20), nullable=False)
    
    mode: Mapped[str] = mapped_column(String(20), default="video")
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    fee: Mapped[float] = mapped_column(Float, nullable=False)  # Session fee in ₹
    total_paid: Mapped[float] = mapped_column(Float, nullable=False)  # Total in ₹
    status: Mapped[str] = mapped_column(String(30), default="booked", index=True)
    countdown_text: Mapped[str | None] = mapped_column(String(150), nullable=True)

    # Reschedule Details
    reschedule_requested_by: Mapped[str | None] = mapped_column(String(20), nullable=True)  # seeker / solver
    reschedule_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reschedule_new_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reschedule_new_start_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reschedule_new_end_time: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Cancellation & Refund Details
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    refund_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    refund_amount: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Completion & Ratings
    problem_solved: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)  # Private session notes
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    review: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    shared_files: Mapped[list[dict]] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    problem: Mapped["Problem"] = relationship("Problem", back_populates="sessions")
    seeker: Mapped["User"] = relationship("User", foreign_keys=[seeker_id])
    solver: Mapped["User"] = relationship("User", foreign_keys=[solver_id])
