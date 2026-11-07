from typing import Literal

from pydantic import BaseModel, ConfigDict

NotificationType = Literal["offer", "booking", "reschedule", "session_reminder", "payment_released"]


class AppNotificationCreateSchema(BaseModel):
    title: str
    message: str
    time: str | None = "Just now"
    unread: bool = True
    type: NotificationType = "offer"
    link: str | None = None


class AppNotificationResponseSchema(BaseModel):
    id: str
    title: str
    message: str
    time: str
    unread: bool
    type: NotificationType
    link: str | None = None

    model_config = ConfigDict(from_attributes=True)
