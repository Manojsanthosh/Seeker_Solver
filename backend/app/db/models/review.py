import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"rev_{uuid.uuid4().hex[:12]}")
    author_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String(50), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    author_role: Mapped[str] = mapped_column(String(20), default="Seeker")
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    author: Mapped["User"] = relationship("User", foreign_keys=[author_id])
    target_user: Mapped["User"] = relationship("User", foreign_keys=[target_user_id])
