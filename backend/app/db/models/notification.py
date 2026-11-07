import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class AppNotification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"notif_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    time_text: Mapped[str] = mapped_column(String(100), default="Just now")
    unread: Mapped[bool] = mapped_column(Boolean, default=True)
    type: Mapped[str] = mapped_column(String(50), default="offer")  # offer, booking, reschedule, session_reminder, payment_released
    link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
