from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import (
    EntityNotFoundException,
    ForbiddenException,
    SolveMateException,
)
from app.db.models.notification import AppNotification
from app.db.models.offer import Offer, OfferSlot
from app.db.models.problem import Problem
from app.db.models.user import User
from app.schemas.offer import OfferCreateSchema, OfferResponseSchema, SlotSchema


def offer_to_schema(offer: Offer) -> OfferResponseSchema:
    slots_schema = [
        SlotSchema(
            id=s.id,
            date=s.date,
            startTime=s.start_time,
            endTime=s.end_time,
            isBestMatch=s.is_best_match,
            isBooked=s.is_booked
        )
        for s in (offer.slots or [])
    ]

    solver = offer.solver
    solver_details = solver.solver_details if solver else None
    
    qual = ""
    skills = []
    rating = 5.0
    verified = False
    if solver_details:
        qual = f"{solver_details.highest_qualification} {solver_details.institution}".strip()
        skills = (solver_details.skills or [])[:4]
        rating = solver_details.rating or 5.0
        verified = solver_details.verified

    return OfferResponseSchema(
        id=offer.id,
        problemId=offer.problem_id,
        problemTitle=offer.problem.title if offer.problem else "Problem",
        solverId=offer.solver_id,
        solverName=solver.name if solver else "Solver",
        solverAvatar=solver.avatar_url if solver else None,
        solverRating=rating,
        solverVerified=verified,
        solverQualification=qual or "Master's Degree",
        solverSkills=skills or ["Problem Solving"],
        slots=slots_schema,
        mode=offer.mode,
        durationMinutes=offer.duration_minutes,
        sessionFee=offer.session_fee,
        platformFee=offer.platform_fee,
        gst=offer.gst,
        totalPayable=offer.total_payable,
        note=offer.note,
        status=offer.status,
        createdAt=offer.created_at.isoformat()
    )


class OfferService:
    @staticmethod
    async def create_offer(
        db: AsyncSession,
        data: OfferCreateSchema,
        solver: User
    ) -> OfferResponseSchema:
        # Check problem
        stmt_prob = select(Problem).options(selectinload(Problem.seeker)).where(Problem.id == data.problemId)
        res_prob = await db.execute(stmt_prob)
        problem = res_prob.scalar_one_or_none()
        if not problem:
            raise EntityNotFoundException("Problem", data.problemId)

        if problem.status not in ["open", "in_progress"]:
            raise SolveMateException(status_code=400, detail="Cannot send offer to a resolved or closed problem.")

        # Financial Calculations (strictly in ₹ INR)
        session_fee = float(data.sessionFee)
        platform_fee = round(session_fee * settings.PLATFORM_FEE_PERCENTAGE)
        gst = round(platform_fee * settings.GST_PERCENTAGE)
        total_payable = session_fee + platform_fee + gst

        new_offer = Offer(
            problem_id=problem.id,
            solver_id=solver.id,
            mode=data.mode,
            duration_minutes=data.durationMinutes,
            session_fee=session_fee,
            platform_fee=platform_fee,
            gst=gst,
            total_payable=total_payable,
            note=data.note,
            status="sent"
        )
        db.add(new_offer)
        await db.flush()

        # Add slots
        for s in data.slots:
            slot = OfferSlot(
                offer_id=new_offer.id,
                date=s.date,
                start_time=s.startTime,
                end_time=s.endTime,
                is_best_match=s.isBestMatch or False,
                is_booked=False
            )
            db.add(slot)

        # Increment problem offers count
        problem.offers_count += 1

        # Notify Seeker
        notif = AppNotification(
            user_id=problem.seeker_id,
            title="New Appointment Offer Received",
            message=f"{solver.name} offered {len(data.slots)} slots for '{problem.title}'.",
            time_text="Just now",
            unread=True,
            type="offer",
            link="/app/seeker/problems"
        )
        db.add(notif)

        await db.commit()

        # Reload full offer
        return await OfferService.get_offer_by_id(db, new_offer.id)

    @staticmethod
    async def get_offer_by_id(db: AsyncSession, offer_id: str) -> OfferResponseSchema:
        stmt = (
            select(Offer)
            .options(
                selectinload(Offer.problem),
                selectinload(Offer.solver).selectinload(User.solver_details),
                selectinload(Offer.slots)
            )
            .where(Offer.id == offer_id)
        )
        res = await db.execute(stmt)
        offer = res.scalar_one_or_none()
        if not offer:
            raise EntityNotFoundException("Offer", offer_id)
        return offer_to_schema(offer)

    @staticmethod
    async def get_offers_for_problem(db: AsyncSession, problem_id: str) -> list[OfferResponseSchema]:
        stmt = (
            select(Offer)
            .options(
                selectinload(Offer.problem),
                selectinload(Offer.solver).selectinload(User.solver_details),
                selectinload(Offer.slots)
            )
            .where(Offer.problem_id == problem_id)
            .order_by(Offer.created_at.desc())
        )
        res = await db.execute(stmt)
        offers = res.scalars().all()
        return [offer_to_schema(o) for o in offers]

    @staticmethod
    async def get_solver_offers(db: AsyncSession, solver_id: str) -> list[OfferResponseSchema]:
        stmt = (
            select(Offer)
            .options(
                selectinload(Offer.problem),
                selectinload(Offer.solver).selectinload(User.solver_details),
                selectinload(Offer.slots)
            )
            .where(Offer.solver_id == solver_id)
            .order_by(Offer.created_at.desc())
        )
        res = await db.execute(stmt)
        offers = res.scalars().all()
        return [offer_to_schema(o) for o in offers]

    @staticmethod
    async def update_offer_status(
        db: AsyncSession,
        offer_id: str,
        new_status: str,
        current_user: User
    ) -> OfferResponseSchema:
        stmt = (
            select(Offer)
            .options(
                selectinload(Offer.problem),
                selectinload(Offer.solver).selectinload(User.solver_details),
                selectinload(Offer.slots)
            )
            .where(Offer.id == offer_id)
        )
        res = await db.execute(stmt)
        offer = res.scalar_one_or_none()
        if not offer:
            raise EntityNotFoundException("Offer", offer_id)

        # Seeker or Solver or Admin
        if current_user.role != "admin" and offer.solver_id != current_user.id and offer.problem.seeker_id != current_user.id:
            raise ForbiddenException("Unauthorized to change offer status")

        offer.status = new_status
        await db.commit()
        return offer_to_schema(offer)
