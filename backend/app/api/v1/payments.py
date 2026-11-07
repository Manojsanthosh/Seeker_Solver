
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_roles
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.payment import (
    PaymentRecordSchema,
    SolverEarningsSummarySchema,
    WithdrawRequestSchema,
)
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments & Escrow"])


@router.get("/seeker", response_model=list[PaymentRecordSchema])
async def get_seeker_payments(
    current_user: User = Depends(require_roles("seeker")),
    db: AsyncSession = Depends(get_db)
):
    return await PaymentService.get_seeker_payments(db, current_user.id)


@router.get("/solver-payouts", response_model=SolverEarningsSummarySchema)
async def get_solver_payouts(
    current_user: User = Depends(require_roles("solver")),
    db: AsyncSession = Depends(get_db)
):
    return await PaymentService.get_solver_earnings(db, current_user.id)


@router.post("/withdraw", response_model=PaymentRecordSchema)
async def withdraw_earnings(
    data: WithdrawRequestSchema,
    current_user: User = Depends(require_roles("solver")),
    db: AsyncSession = Depends(get_db)
):
    return await PaymentService.withdraw(db, current_user, data)
