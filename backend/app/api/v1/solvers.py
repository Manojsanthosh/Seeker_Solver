
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import require_roles
from app.core.exceptions import EntityNotFoundException
from app.db.models.availability import SolverAvailability
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.availability import (
    SolverAvailabilitySchema,
    SolverAvailabilityUpdateSchema,
    TimeIntervalSchema,
    WeeklyDayScheduleSchema,
)
from app.schemas.user import UserSchema
from app.services.auth_service import user_to_schema

router = APIRouter(prefix="/solvers", tags=["Solvers"])


def availability_to_schema(av: SolverAvailability | None) -> SolverAvailabilitySchema:
    if not av:
        return SolverAvailabilitySchema(
            weeklySchedule=[],
            blockedDates=[],
            defaultFeePer30Min=1500.0,
            preferredModes=["video", "audio", "chat"]
        )

    schedule = []
    for item in (av.weekly_schedule or []):
        schedule.append(
            WeeklyDayScheduleSchema(
                day=item.get("day", "Monday"),
                enabled=item.get("enabled", False),
                slots=[
                    TimeIntervalSchema(start=s.get("start", ""), end=s.get("end", ""))
                    for s in item.get("slots", [])
                ]
            )
        )

    return SolverAvailabilitySchema(
        weeklySchedule=schedule,
        blockedDates=av.blocked_dates or [],
        defaultFeePer30Min=av.default_fee_per_30_min,
        preferredModes=av.preferred_modes or ["video", "audio", "chat"]
    )


@router.get("", response_model=list[UserSchema])
async def list_solvers(
    search: str | None = None,
    category: str | None = None,
    skill: str | None = None,
    min_rating: float | None = None,
    verified_only: bool | None = False,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.solver_details))
        .where(User.role == "solver", User.is_active == True)
    )
    res = await db.execute(stmt)
    solvers = res.scalars().all()

    filtered = []
    for s in solvers:
        sd = s.solver_details
        if not sd:
            continue
        if search:
            s_low = search.lower()
            name_match = s_low in s.name.lower()
            field_match = s_low in (sd.field_of_study or "").lower()
            skill_match = any(s_low in sk.lower() for sk in (sd.skills or []))
            if not (name_match or field_match or skill_match):
                continue
        if skill:
            sk_low = skill.lower()
            if not any(sk_low in sk.lower() for sk in (sd.skills or [])):
                continue
        if min_rating and (sd.rating or 5.0) < min_rating:
            continue
        if verified_only and not sd.verified:
            continue

        filtered.append(user_to_schema(s))

    return filtered


@router.get("/me/availability", response_model=SolverAvailabilitySchema)
async def get_my_availability(
    current_user: User = Depends(require_roles("solver")),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SolverAvailability).where(SolverAvailability.solver_id == current_user.id)
    res = await db.execute(stmt)
    av = res.scalar_one_or_none()
    return availability_to_schema(av)


@router.put("/me/availability", response_model=SolverAvailabilitySchema)
async def update_my_availability(
    data: SolverAvailabilityUpdateSchema,
    current_user: User = Depends(require_roles("solver")),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SolverAvailability).where(SolverAvailability.solver_id == current_user.id)
    res = await db.execute(stmt)
    av = res.scalar_one_or_none()
    
    weekly_dict = [w.model_dump() for w in data.weeklySchedule]

    if not av:
        av = SolverAvailability(
            solver_id=current_user.id,
            weekly_schedule=weekly_dict,
            blocked_dates=data.blockedDates,
            default_fee_per_30_min=data.defaultFeePer30Min,
            preferred_modes=data.preferredModes
        )
        db.add(av)
    else:
        av.weekly_schedule = weekly_dict
        av.blocked_dates = data.blockedDates
        av.default_fee_per_30_min = data.defaultFeePer30Min
        av.preferred_modes = data.preferredModes

    await db.commit()
    await db.refresh(av)
    return availability_to_schema(av)


@router.get("/{solver_id}", response_model=UserSchema)
async def get_solver_profile(
    solver_id: str,
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
    return user_to_schema(user)


@router.get("/{solver_id}/availability", response_model=SolverAvailabilitySchema)
async def get_solver_availability(
    solver_id: str,
    db: AsyncSession = Depends(get_db)
):
    # If empty or not set, return default
    if not solver_id:
        return availability_to_schema(None)
    stmt = select(SolverAvailability).where(SolverAvailability.solver_id == solver_id)
    res = await db.execute(stmt)
    av = res.scalar_one_or_none()
    return availability_to_schema(av)
