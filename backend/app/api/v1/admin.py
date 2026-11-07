
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import require_roles
from app.core.exceptions import EntityNotFoundException
from app.db.models.payment import PaymentRecord
from app.db.models.problem import Problem
from app.db.models.session import Session
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.admin import AdminStatsSchema, AdminVerifySolverSchema
from app.schemas.problem import ProblemResponseSchema
from app.schemas.session import SessionResponseSchema
from app.schemas.user import UserSchema
from app.services.auth_service import user_to_schema
from app.services.problem_service import problem_to_schema
from app.services.session_service import session_to_schema

router = APIRouter(prefix="/admin", tags=["Admin Governance"])


@router.get("/stats", response_model=AdminStatsSchema)
async def get_admin_stats(
    current_user: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_seekers = (await db.execute(select(func.count(User.id)).where(User.role == "seeker"))).scalar() or 0
    total_solvers = (await db.execute(select(func.count(User.id)).where(User.role == "solver"))).scalar() or 0
    total_problems = (await db.execute(select(func.count(Problem.id)))).scalar() or 0
    total_sessions = (await db.execute(select(func.count(Session.id)))).scalar() or 0

    # Total Escrow holdings (all payments in 'In Escrow')
    escrow_stmt = select(func.coalesce(func.sum(PaymentRecord.net), 0.0)).where(PaymentRecord.status == "In Escrow")
    escrow_holdings = float((await db.execute(escrow_stmt)).scalar() or 0.0)

    # Total Platform Revenue (platform fee + gst on all released sessions)
    revenue_stmt = select(func.coalesce(func.sum(PaymentRecord.fee), 0.0)).where(
        PaymentRecord.role == "seeker", PaymentRecord.status.in_(["Released", "Paid"])
    )
    platform_revenue = float((await db.execute(revenue_stmt)).scalar() or 0.0)

    return AdminStatsSchema(
        totalUsers=total_users,
        totalSeekers=total_seekers,
        totalSolvers=total_solvers,
        totalProblems=total_problems,
        totalSessions=total_sessions,
        totalEscrowHoldings=escrow_holdings,
        totalPlatformRevenue=platform_revenue
    )


@router.get("/users", response_model=list[UserSchema])
async def list_admin_users(
    role: str | None = None,
    search: str | None = None,
    current_user: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).options(selectinload(User.seeker_details), selectinload(User.solver_details))
    if role:
        stmt = stmt.where(User.role == role)
    if search:
        s = f"%{search.lower()}%"
        stmt = stmt.where(User.name.ilike(s) | User.email.ilike(s))
    
    res = await db.execute(stmt)
    users = res.scalars().all()
    return [user_to_schema(u) for u in users]


@router.patch("/solvers/{solver_id}/verify", response_model=UserSchema)
async def verify_solver(
    solver_id: str,
    data: AdminVerifySolverSchema,
    current_user: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.solver_details))
        .where(User.id == solver_id, User.role == "solver")
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise EntityNotFoundException("Solver", solver_id)

    if user.solver_details:
        user.solver_details.verified = data.verified
        await db.commit()
        await db.refresh(user)

    return user_to_schema(user)


@router.get("/problems", response_model=list[ProblemResponseSchema])
async def list_admin_problems(
    current_user: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Problem)
        .options(selectinload(Problem.seeker), selectinload(Problem.solver))
        .order_by(Problem.created_at.desc())
    )
    res = await db.execute(stmt)
    problems = res.scalars().all()
    return [problem_to_schema(p) for p in problems]


@router.get("/sessions", response_model=list[SessionResponseSchema])
async def list_admin_sessions(
    current_user: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Session)
        .options(
            selectinload(Session.problem),
            selectinload(Session.seeker),
            selectinload(Session.solver)
        )
        .order_by(Session.created_at.desc())
    )
    res = await db.execute(stmt)
    sessions = res.scalars().all()
    return [session_to_schema(s) for s in sessions]
