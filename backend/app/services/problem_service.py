
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import EntityNotFoundException, ForbiddenException
from app.db.models.problem import Problem
from app.db.models.user import SeekerDetails, User
from app.schemas.problem import (
    PreferredWindowSchema,
    ProblemCreateSchema,
    ProblemResponseSchema,
)


def problem_to_schema(prob: Problem) -> ProblemResponseSchema:
    pref_avail = [
        PreferredWindowSchema(
            date=w.get("date", ""),
            timeWindow=w.get("timeWindow", "morning"),
            customStart=w.get("customStart"),
            customEnd=w.get("customEnd")
        )
        for w in (prob.preferred_availability or [])
    ]
    
    return ProblemResponseSchema(
        id=prob.id,
        title=prob.title,
        category=prob.category,
        description=prob.description,
        budgetType=prob.budget_type,
        budgetMin=prob.budget_min,
        budgetMax=prob.budget_max,
        budget=prob.budget,
        preferredMode=prob.preferred_mode,
        estimatedDuration=prob.estimated_duration,
        preferredAvailability=pref_avail,
        urgency=prob.urgency,
        deadline=prob.deadline or "",
        status=prob.status,
        seekerId=prob.seeker_id,
        seekerName=prob.seeker.name if prob.seeker else "Seeker",
        seekerAvatar=prob.seeker.avatar_url if prob.seeker else None,
        solverId=prob.solver_id,
        solverName=prob.solver.name if prob.solver else None,
        solverAvatar=prob.solver.avatar_url if prob.solver else None,
        attachments=prob.attachments or [],
        createdAt=prob.created_at.isoformat(),
        offersCount=prob.offers_count,
        location=prob.location or "Remote (IST)"
    )


class ProblemService:
    @staticmethod
    async def create_problem(
        db: AsyncSession,
        data: ProblemCreateSchema,
        seeker: User
    ) -> ProblemResponseSchema:
        pref_avail_dicts = [w.model_dump() for w in data.preferredAvailability]
        
        prob = Problem(
            seeker_id=seeker.id,
            title=data.title,
            category=data.category,
            description=data.description,
            budget_type=data.budgetType,
            budget=data.budget,
            budget_min=data.budgetMin,
            budget_max=data.budgetMax,
            preferred_mode=data.preferredMode,
            estimated_duration=data.estimatedDuration,
            preferred_availability=pref_avail_dicts,
            urgency=data.urgency,
            deadline=data.deadline or "",
            location=data.location or "Remote (IST)",
            attachments=data.attachments or [],
            status="open",
            offers_count=0
        )
        db.add(prob)
        
        # Increment seeker posted problems count
        stmt = select(SeekerDetails).where(SeekerDetails.user_id == seeker.id)
        res = await db.execute(stmt)
        sd = res.scalar_one_or_none()
        if sd:
            sd.posted_problems_count += 1
            
        await db.commit()
        
        # Load relationships
        return await ProblemService.get_problem_by_id(db, prob.id)

    @staticmethod
    async def get_problem_by_id(db: AsyncSession, problem_id: str) -> ProblemResponseSchema:
        stmt = (
            select(Problem)
            .options(selectinload(Problem.seeker), selectinload(Problem.solver))
            .where(Problem.id == problem_id)
        )
        res = await db.execute(stmt)
        prob = res.scalar_one_or_none()
        if not prob:
            raise EntityNotFoundException("Problem", problem_id)
        return problem_to_schema(prob)

    @staticmethod
    async def list_problems(
        db: AsyncSession,
        category: str | None = None,
        budget_min: float | None = None,
        budget_max: float | None = None,
        urgency: str | None = None,
        mode: str | None = None,
        status: str | None = None,
        seeker_id: str | None = None,
        search: str | None = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[list[ProblemResponseSchema], int]:
        stmt = select(Problem).options(selectinload(Problem.seeker), selectinload(Problem.solver))
        conditions = []

        if category and category != "all":
            conditions.append(Problem.category.ilike(f"%{category}%"))
        if budget_min is not None:
            conditions.append(Problem.budget >= budget_min)
        if budget_max is not None:
            conditions.append(Problem.budget <= budget_max)
        if urgency and urgency != "all":
            conditions.append(Problem.urgency == urgency)
        if mode and mode != "all":
            conditions.append(Problem.preferred_mode == mode)
        if status and status != "all":
            conditions.append(Problem.status == status)
        if seeker_id:
            conditions.append(Problem.seeker_id == seeker_id)
        if search:
            s_term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    Problem.title.ilike(s_term),
                    Problem.description.ilike(s_term),
                    Problem.category.ilike(s_term)
                )
            )

        if conditions:
            stmt = stmt.where(and_(*conditions))

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Order and paginate
        stmt = stmt.order_by(Problem.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        problems = result.scalars().all()

        return [problem_to_schema(p) for p in problems], total

    @staticmethod
    async def update_problem_status(
        db: AsyncSession,
        problem_id: str,
        new_status: str,
        current_user: User
    ) -> ProblemResponseSchema:
        stmt = select(Problem).options(selectinload(Problem.seeker), selectinload(Problem.solver)).where(Problem.id == problem_id)
        res = await db.execute(stmt)
        prob = res.scalar_one_or_none()
        if not prob:
            raise EntityNotFoundException("Problem", problem_id)

        # Check permission: Seeker owner, assigned solver, or admin
        if current_user.role != "admin" and prob.seeker_id != current_user.id and prob.solver_id != current_user.id:
            raise ForbiddenException("Only the problem owner or admin can update status")

        prob.status = new_status
        await db.commit()
        return problem_to_schema(prob)
