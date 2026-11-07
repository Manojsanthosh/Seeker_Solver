
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.notification import (
    AppNotificationCreateSchema,
    AppNotificationResponseSchema,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[AppNotificationResponseSchema])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await NotificationService.get_user_notifications(db, current_user.id)


@router.post("/mark-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await NotificationService.mark_all_as_read(db, current_user.id)
    return {"success": True}


@router.post("", response_model=AppNotificationResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_notification(
    data: AppNotificationCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await NotificationService.add_notification(db, current_user.id, data)
