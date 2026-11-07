
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_roles
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.offer import (
    OfferCreateSchema,
    OfferResponseSchema,
    OfferStatusUpdateSchema,
)
from app.services.offer_service import OfferService

router = APIRouter(prefix="/offers", tags=["Appointment Offers"])


@router.post("", response_model=OfferResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_offer(
    data: OfferCreateSchema,
    current_user: User = Depends(require_roles("solver")),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.create_offer(db, data, current_user)


@router.get("", response_model=list[OfferResponseSchema])
async def list_offers(
    problem_id: str | None = None,
    solver_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if problem_id:
        return await OfferService.get_offers_for_problem(db, problem_id)
    if solver_id:
        return await OfferService.get_solver_offers(db, solver_id)
    if current_user.role == "solver":
        return await OfferService.get_solver_offers(db, current_user.id)
    return []


@router.get("/my", response_model=list[OfferResponseSchema])
async def get_my_offers(
    current_user: User = Depends(require_roles("solver")),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_solver_offers(db, current_user.id)


@router.get("/{offer_id}", response_model=OfferResponseSchema)
async def get_offer(
    offer_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_offer_by_id(db, offer_id)


@router.patch("/{offer_id}/status", response_model=OfferResponseSchema)
async def update_offer_status(
    offer_id: str,
    data: OfferStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.update_offer_status(db, offer_id, data.status, current_user)
