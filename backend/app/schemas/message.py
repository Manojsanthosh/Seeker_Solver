from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserSchema


class ChatMessageCreateSchema(BaseModel):
    conversationId: str | None = None
    recipientId: str | None = None
    sessionId: str | None = None
    text: str = Field(..., min_length=1, max_length=5000)
    attachment: dict | None = None


class ChatMessageResponseSchema(BaseModel):
    id: str
    conversationId: str | None = None
    senderId: str
    senderName: str
    senderAvatar: str | None = None
    text: str
    timestamp: str
    isMe: bool = False
    status: Literal["sent", "delivered", "read"] | None = "sent"
    attachment: dict | None = None

    model_config = ConfigDict(from_attributes=True)


class ConversationResponseSchema(BaseModel):
    id: str
    participant: UserSchema
    lastMessage: ChatMessageResponseSchema | None = None
    unreadCount: int = 0
