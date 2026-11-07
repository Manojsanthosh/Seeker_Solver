import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from app.db.models.user import User
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Authentication token required")
    
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")
    except jwt.PyJWTError:
        raise UnauthorizedException("Could not validate credentials or token expired")
    
    query = (
        select(User)
        .options(
            selectinload(User.seeker_details),
            selectinload(User.solver_details)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise ForbiddenException("User account is inactive")
        
    return user


async def get_optional_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    if not token:
        return None
    try:
        return await get_current_user(token=token, db=db)
    except Exception:
        return None


def require_roles(*allowed_roles: str):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != "admin":
            raise ForbiddenException(
                f"Role '{current_user.role}' is not authorized. Required: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
