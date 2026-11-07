import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"tx_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # seeker or solver
    session_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    fee: Mapped[float] = mapped_column(Float, default=0.0)
    net: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="In Escrow", index=True)  # 'Paid', 'In Escrow', 'Released', 'Refunded'
    invoice_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    destination: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    session: Mapped[Optional["Session"]] = relationship("Session", foreign_keys=[session_id])
