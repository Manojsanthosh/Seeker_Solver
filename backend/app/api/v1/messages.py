
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.message import (
    ChatMessageCreateSchema,
    ChatMessageResponseSchema,
    ConversationResponseSchema,
)
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["Messages & Chat"])


@router.post("", response_model=ChatMessageResponseSchema, status_code=status.HTTP_201_CREATED)
async def send_message(
    data: ChatMessageCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await MessageService.send_message(db, data, current_user)


@router.get("/conversations", response_model=list[ConversationResponseSchema])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await MessageService.get_conversations(db, current_user)


@router.get("/conversation/{conversation_id}", response_model=list[ChatMessageResponseSchema])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await MessageService.get_conversation_messages(db, conversation_id, current_user)
