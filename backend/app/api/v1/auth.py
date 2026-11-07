from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.auth import (
    LoginSchema,
    RefreshTokenRequest,
    SeekerRegisterSchema,
    SolverRegisterSchema,
    TokenSchema,
)
from app.schemas.user import UserSchema
from app.services.auth_service import AuthService, user_to_schema

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/seeker", response_model=TokenSchema, status_code=status.HTTP_201_CREATED)
async def register_seeker(
    data: SeekerRegisterSchema,
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.register_seeker(db, data)


@router.post("/register/solver", response_model=TokenSchema, status_code=status.HTTP_201_CREATED)
async def register_solver(
    data: SolverRegisterSchema,
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.register_solver(db, data)


@router.post("/login", response_model=TokenSchema)
async def login(
    creds: LoginSchema,
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.login(db, creds)


@router.post("/refresh", response_model=TokenSchema)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.refresh(db, data.refresh_token)


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await AuthService.logout(db, current_user.id)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserSchema)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return user_to_schema(current_user)
