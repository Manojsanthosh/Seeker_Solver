import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.user import User


def utcnow():
    return datetime.now(timezone.utc)


class SolverAvailability(Base):
    __tablename__ = "solver_availabilities"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"av_{uuid.uuid4().hex[:12]}")
    solver_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    weekly_schedule: Mapped[list[dict]] = mapped_column(JSON, default=list)
    blocked_dates: Mapped[list[str]] = mapped_column(JSON, default=list)
    default_fee_per_30_min: Mapped[float] = mapped_column(Float, default=1500.0)
    preferred_modes: Mapped[list[str]] = mapped_column(JSON, default=lambda: ["video", "audio", "chat"])
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    solver: Mapped["User"] = relationship("User", foreign_keys=[solver_id])
