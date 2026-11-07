
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import EntityNotFoundException
from app.db.models.problem import Problem
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.offer import OfferResponseSchema
from app.schemas.problem import (
    ProblemCreateSchema,
    ProblemResponseSchema,
    ProblemStatusUpdateSchema,
    SolverMatchListResponseSchema,
)
from app.services.matching_service import MatchingService
from app.services.offer_service import OfferService
from app.services.problem_service import ProblemService

router = APIRouter(prefix="/problems", tags=["Problems"])


@router.post("", response_model=ProblemResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_problem(
    data: ProblemCreateSchema,
    current_user: User = Depends(require_roles("seeker")),
    db: AsyncSession = Depends(get_db)
):
    return await ProblemService.create_problem(db, data, current_user)


@router.get("", response_model=list[ProblemResponseSchema])
async def list_problems(
    category: str | None = None,
    budget_min: float | None = None,
    budget_max: float | None = None,
    urgency: str | None = None,
    mode: str | None = None,
    status: str | None = None,
    seeker_id: str | None = None,
    search: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    problems, _ = await ProblemService.list_problems(
        db,
        category=category,
        budget_min=budget_min,
        budget_max=budget_max,
        urgency=urgency,
        mode=mode,
        status=status,
        seeker_id=seeker_id,
        search=search,
        skip=skip,
        limit=limit
    )
    return problems


@router.get("/my", response_model=list[ProblemResponseSchema])
async def get_my_problems(
    current_user: User = Depends(require_roles("seeker")),
    db: AsyncSession = Depends(get_db)
):
    problems, _ = await ProblemService.list_problems(db, seeker_id=current_user.id)
    return problems


@router.get("/{problem_id}", response_model=ProblemResponseSchema)
async def get_problem(
    problem_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await ProblemService.get_problem_by_id(db, problem_id)


@router.patch("/{problem_id}/status", response_model=ProblemResponseSchema)
async def update_problem_status(
    problem_id: str,
    data: ProblemStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await ProblemService.update_problem_status(db, problem_id, data.status, current_user)


@router.get("/{problem_id}/matches", response_model=SolverMatchListResponseSchema)
async def get_solver_matches(
    problem_id: str,
    limit: int = Query(10, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Problem).where(Problem.id == problem_id)
    res = await db.execute(stmt)
    problem = res.scalar_one_or_none()
    if not problem:
        raise EntityNotFoundException("Problem", problem_id)

    matches = await MatchingService.match_solvers_for_problem(db, problem, limit=limit)
    return SolverMatchListResponseSchema(problemId=problem.id, matches=matches)


@router.get("/{problem_id}/offers", response_model=list[OfferResponseSchema])
async def get_problem_offers(
    problem_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_offers_for_problem(db, problem_id)
