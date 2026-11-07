from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user
from app.core.exceptions import EntityNotFoundException
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.user import UserSchema, UserUpdateSchema
from app.services.auth_service import user_to_schema

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserSchema)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return user_to_schema(current_user)


@router.put("/me", response_model=UserSchema)
async def update_my_profile(
    data: UserUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    if data.city is not None:
        current_user.city = data.city.strip()
    if data.bio is not None:
        current_user.bio = data.bio.strip()
    if data.avatarUrl is not None:
        current_user.avatar_url = data.avatarUrl

    await db.commit()
    await db.refresh(current_user)
    return user_to_schema(current_user)


@router.get("/{user_id}", response_model=UserSchema)
async def get_user_by_id(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.seeker_details), selectinload(User.solver_details))
        .where(User.id == user_id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise EntityNotFoundException("User", user_id)
    return user_to_schema(user)
