from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ForbiddenException
from app.db.models.message import ChatMessage
from app.db.models.user import User
from app.schemas.message import (
    ChatMessageCreateSchema,
    ChatMessageResponseSchema,
    ConversationResponseSchema,
)
from app.services.auth_service import user_to_schema


def format_msg(msg: ChatMessage, current_user_id: str) -> ChatMessageResponseSchema:
    return ChatMessageResponseSchema(
        id=msg.id,
        conversationId=msg.conversation_id,
        senderId=msg.sender_id,
        senderName=msg.sender.name if msg.sender else "User",
        senderAvatar=msg.sender.avatar_url if msg.sender else None,
        text=msg.text,
        timestamp=msg.created_at.strftime("%I:%M %p IST"),
        isMe=(msg.sender_id == current_user_id),
        status=msg.status,
        attachment=msg.attachment_data
    )


class MessageService:
    @staticmethod
    async def send_message(
        db: AsyncSession,
        data: ChatMessageCreateSchema,
        current_user: User
    ) -> ChatMessageResponseSchema:
        recipient_id = data.recipientId

        # Derive or check conversation ID
        if not recipient_id and data.conversationId:
            # Look up conversation counterpart
            prev_msg_stmt = select(ChatMessage).where(ChatMessage.conversation_id == data.conversationId)
            prev_res = await db.execute(prev_msg_stmt)
            prev = prev_res.scalars().first()
            if prev:
                recipient_id = prev.recipient_id if prev.sender_id == current_user.id else prev.sender_id

        if not recipient_id:
            raise ForbiddenException("Recipient ID required.")

        # Canonical conversation ID for two users: conv_min_max
        participants = sorted([current_user.id, recipient_id])
        conversation_id = f"conv_{participants[0]}_{participants[1]}"

        new_msg = ChatMessage(
            conversation_id=conversation_id,
            sender_id=current_user.id,
            recipient_id=recipient_id,
            session_id=data.sessionId,
            text=data.text,
            status="sent",
            attachment_data=data.attachment
        )
        db.add(new_msg)
        await db.commit()

        # Load sender
        stmt = select(ChatMessage).options(selectinload(ChatMessage.sender)).where(ChatMessage.id == new_msg.id)
        msg_full = (await db.execute(stmt)).scalar_one()

        return format_msg(msg_full, current_user.id)

    @staticmethod
    async def get_conversations(
        db: AsyncSession,
        current_user: User
    ) -> list[ConversationResponseSchema]:
        # Get all messages where current user is sender or recipient
        stmt = (
            select(ChatMessage)
            .options(selectinload(ChatMessage.sender), selectinload(ChatMessage.recipient))
            .where(
                or_(
                    ChatMessage.sender_id == current_user.id,
                    ChatMessage.recipient_id == current_user.id
                )
            )
            .order_by(ChatMessage.created_at.desc())
        )
        res = await db.execute(stmt)
        all_msgs = res.scalars().all()

        conv_dict = {}
        for m in all_msgs:
            if m.conversation_id not in conv_dict:
                counterpart = m.recipient if m.sender_id == current_user.id else m.sender
                conv_dict[m.conversation_id] = {
                    "last_msg": m,
                    "counterpart": counterpart,
                    "unread": 0
                }
            if m.recipient_id == current_user.id and m.status == "sent":
                conv_dict[m.conversation_id]["unread"] += 1

        results = []
        for conv_id, val in conv_dict.items():
            results.append(
                ConversationResponseSchema(
                    id=conv_id,
                    participant=user_to_schema(val["counterpart"]),
                    lastMessage=format_msg(val["last_msg"], current_user.id),
                    unreadCount=val["unread"]
                )
            )
        return results

    @staticmethod
    async def get_conversation_messages(
        db: AsyncSession,
        conversation_id: str,
        current_user: User
    ) -> list[ChatMessageResponseSchema]:
        stmt = (
            select(ChatMessage)
            .options(selectinload(ChatMessage.sender))
            .where(ChatMessage.conversation_id == conversation_id)
            .order_by(ChatMessage.created_at.asc())
        )
        res = await db.execute(stmt)
        msgs = res.scalars().all()

        # Verify access
        if msgs and current_user.role != "admin":
            first = msgs[0]
            if first.sender_id != current_user.id and first.recipient_id != current_user.id:
                raise ForbiddenException("Unauthorized to view this conversation.")

        # Mark unread messages as read
        for m in msgs:
            if m.recipient_id == current_user.id and m.status != "read":
                m.status = "read"
        await db.commit()

        return [format_msg(m, current_user.id) for m in msgs]
