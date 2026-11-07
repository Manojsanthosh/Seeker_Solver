
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.notification import AppNotification
from app.schemas.notification import (
    AppNotificationCreateSchema,
    AppNotificationResponseSchema,
)


def notif_to_schema(n: AppNotification) -> AppNotificationResponseSchema:
    return AppNotificationResponseSchema(
        id=n.id,
        title=n.title,
        message=n.message,
        time=n.time_text,
        unread=n.unread,
        type=n.type,
        link=n.link
    )


class NotificationService:
    @staticmethod
    async def add_notification(
        db: AsyncSession,
        user_id: str,
        data: AppNotificationCreateSchema
    ) -> AppNotificationResponseSchema:
        notif = AppNotification(
            user_id=user_id,
            title=data.title,
            message=data.message,
            time_text=data.time or "Just now",
            unread=data.unread,
            type=data.type,
            link=data.link
        )
        db.add(notif)
        await db.commit()
        return notif_to_schema(notif)

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        user_id: str
    ) -> list[AppNotificationResponseSchema]:
        stmt = (
            select(AppNotification)
            .where(AppNotification.user_id == user_id)
            .order_by(AppNotification.created_at.desc())
        )
        res = await db.execute(stmt)
        notifs = res.scalars().all()
        return [notif_to_schema(n) for n in notifs]

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: str) -> None:
        stmt = (
            update(AppNotification)
            .where(AppNotification.user_id == user_id, AppNotification.unread == True)
            .values(unread=False)
        )
        await db.execute(stmt)
        await db.commit()
