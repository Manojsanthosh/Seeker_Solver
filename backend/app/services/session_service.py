from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import (
    EntityNotFoundException,
    ForbiddenException,
    SlotConflictException,
    SolveMateException,
)
from app.db.models.notification import AppNotification
from app.db.models.offer import Offer
from app.db.models.payment import PaymentRecord
from app.db.models.review import Review
from app.db.models.session import Session
from app.db.models.user import SeekerDetails, SolverDetails, User
from app.schemas.offer import SlotSchema
from app.schemas.session import (
    BookSessionSchema,
    CancelSessionSchema,
    CompleteSessionSchema,
    RescheduleDataSchema,
    RescheduleRequestSchema,
    SessionResponseSchema,
)


def session_to_schema(s: Session) -> SessionResponseSchema:
    slot_schema = SlotSchema(
        id=s.slot_id or f"slot_{s.id}",
        date=s.slot_date,
        startTime=s.slot_start_time,
        endTime=s.slot_end_time,
        isBooked=True
    )

    reschedule_data = None
    if s.reschedule_requested_by and s.reschedule_new_date:
        reschedule_data = RescheduleDataSchema(
            requestedBy=s.reschedule_requested_by,
            reason=s.reschedule_reason or "",
            newSlot=SlotSchema(
                date=s.reschedule_new_date,
                startTime=s.reschedule_new_start_time or "",
                endTime=s.reschedule_new_end_time or "",
                isBooked=False
            )
        )

    return SessionResponseSchema(
        id=s.id,
        problemId=s.problem_id,
        problemTitle=s.problem.title if s.problem else "Problem Session",
        problemCategory=s.problem.category if s.problem else "General",
        seekerId=s.seeker_id,
        seekerName=s.seeker.name if s.seeker else "Seeker",
        seekerAvatar=s.seeker.avatar_url if s.seeker else None,
        solverId=s.solver_id,
        solverName=s.solver.name if s.solver else "Solver",
        solverAvatar=s.solver.avatar_url if s.solver else None,
        slot=slot_schema,
        mode=s.mode,
        durationMinutes=s.duration_minutes,
        fee=s.fee,
        totalPaid=s.total_paid,
        status=s.status,
        countdownText=s.countdown_text or f"Scheduled for {s.slot_date} at {s.slot_start_time}",
        rescheduleData=reschedule_data,
        cancellationReason=s.cancellation_reason,
        refundPolicy=s.refund_policy,
        refundAmount=s.refund_amount,
        problemSolved=s.problem_solved,
        notes=s.notes,
        rating=s.rating,
        review=s.review,
        reviewTags=s.review_tags or [],
        sharedFiles=s.shared_files or [],
        createdAt=s.created_at.isoformat()
    )


class SessionService:
    @staticmethod
    async def book_session(
        db: AsyncSession,
        data: BookSessionSchema,
        seeker: User
    ) -> SessionResponseSchema:
        # 1. Fetch offer
        stmt = (
            select(Offer)
            .options(
                selectinload(Offer.problem),
                selectinload(Offer.solver).selectinload(User.solver_details),
                selectinload(Offer.slots)
            )
            .where(Offer.id == data.offerId)
        )
        res = await db.execute(stmt)
        offer = res.scalar_one_or_none()
        if not offer:
            raise EntityNotFoundException("Offer", data.offerId)

        # 2. Check ownership: Only the seeker who posted the problem can book
        if offer.problem.seeker_id != seeker.id and seeker.role != "admin":
            raise ForbiddenException("You can only book offers on your own problems.")

        # 3. Slot Conflict Prevention
        slot_date = data.slot.date
        slot_start = data.slot.startTime
        slot_end = data.slot.endTime

        conflict_stmt = select(Session).where(
            Session.solver_id == offer.solver_id,
            Session.slot_date == slot_date,
            Session.slot_start_time == slot_start,
            Session.status.in_(["booked", "live", "reschedule_requested"])
        )
        existing_booking = (await db.execute(conflict_stmt)).scalar_one_or_none()
        if existing_booking:
            raise SlotConflictException(
                f"Solver already has a booked session on {slot_date} at {slot_start}."
            )

        # 4. Create Session
        session = Session(
            problem_id=offer.problem_id,
            seeker_id=seeker.id,
            solver_id=offer.solver_id,
            offer_id=offer.id,
            slot_id=data.slot.id,
            slot_date=slot_date,
            slot_start_time=slot_start,
            slot_end_time=slot_end,
            mode=offer.mode,
            duration_minutes=offer.duration_minutes,
            fee=offer.session_fee,
            total_paid=offer.total_payable,
            status="booked",
            countdown_text=f"Scheduled for {slot_date} at {slot_start}"
        )
        db.add(session)
        await db.flush()

        # 5. Mark offer as accepted, slots as booked
        offer.status = "accepted"
        for s in offer.slots:
            if s.date == slot_date and s.start_time == slot_start:
                s.is_booked = True

        # 6. Update problem status to in_progress & set solver
        offer.problem.status = "in_progress"
        offer.problem.solver_id = offer.solver_id

        # 7. Create Payment Record (In Escrow)
        invoice_id = f"INV-{int(datetime.now(timezone.utc).timestamp())}"
        payment = PaymentRecord(
            user_id=seeker.id,
            role="seeker",
            session_id=session.id,
            title=f"Escrow: {offer.problem.title}",
            amount=offer.session_fee,
            fee=offer.platform_fee + offer.gst,
            net=offer.total_payable,
            status="In Escrow",
            invoice_id=invoice_id,
            payment_method=data.paymentMethod or "upi"
        )
        db.add(payment)

        # 8. Update counters
        seeker_stmt = select(SeekerDetails).where(SeekerDetails.user_id == seeker.id)
        sd = (await db.execute(seeker_stmt)).scalar_one_or_none()
        if sd:
            sd.in_progress_count += 1
            sd.upcoming_sessions_count = (sd.upcoming_sessions_count or 0) + 1
            sd.total_spent += offer.total_payable

        solver_stmt = select(SolverDetails).where(SolverDetails.user_id == offer.solver_id)
        svd = (await db.execute(solver_stmt)).scalar_one_or_none()
        if svd:
            svd.active_jobs_count += 1

        # 9. Create Notifications
        notif_seeker = AppNotification(
            user_id=seeker.id,
            title="Appointment Slot Confirmed",
            message=f"Session booked with {offer.solver.name} for {slot_date} at {slot_start} IST. ₹{offer.total_payable} held in escrow.",
            time_text="Just now",
            unread=True,
            type="booking",
            link="/app/sessions"
        )
        notif_solver = AppNotification(
            user_id=offer.solver_id,
            title="New Session Booked!",
            message=f"{seeker.name} confirmed your offer for '{offer.problem.title}' on {slot_date} at {slot_start} IST.",
            time_text="Just now",
            unread=True,
            type="booking",
            link="/app/sessions"
        )
        db.add_all([notif_seeker, notif_solver])

        await db.commit()
        return await SessionService.get_session_by_id(db, session.id, seeker)

    @staticmethod
    async def get_session_by_id(db: AsyncSession, session_id: str, current_user: User) -> SessionResponseSchema:
        stmt = (
            select(Session)
            .options(
                selectinload(Session.problem),
                selectinload(Session.seeker),
                selectinload(Session.solver)
            )
            .where(Session.id == session_id)
        )
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise EntityNotFoundException("Session", session_id)

        if current_user.role != "admin" and session.seeker_id != current_user.id and session.solver_id != current_user.id:
            raise ForbiddenException("Unauthorized to view this session.")

        return session_to_schema(session)

    @staticmethod
    async def list_sessions(
        db: AsyncSession,
        current_user: User,
        status: str | None = None
    ) -> list[SessionResponseSchema]:
        stmt = (
            select(Session)
            .options(
                selectinload(Session.problem),
                selectinload(Session.seeker),
                selectinload(Session.solver)
            )
        )
        if current_user.role == "seeker":
            stmt = stmt.where(Session.seeker_id == current_user.id)
        elif current_user.role == "solver":
            stmt = stmt.where(Session.solver_id == current_user.id)

        if status and status != "all":
            if status == "upcoming":
                stmt = stmt.where(Session.status.in_(["booked", "reschedule_requested"]))
            elif status == "live":
                stmt = stmt.where(Session.status == "live")
            elif status == "completed":
                stmt = stmt.where(Session.status == "completed")
            elif status == "cancelled":
                stmt = stmt.where(Session.status.in_(["cancelled", "no_show"]))
            else:
                stmt = stmt.where(Session.status == status)

        stmt = stmt.order_by(Session.created_at.desc())
        res = await db.execute(stmt)
        sessions = res.scalars().all()
        return [session_to_schema(s) for s in sessions]

    @staticmethod
    async def update_session_status(
        db: AsyncSession,
        session_id: str,
        new_status: str,
        current_user: User
    ) -> SessionResponseSchema:
        stmt = select(Session).options(selectinload(Session.problem), selectinload(Session.seeker), selectinload(Session.solver)).where(Session.id == session_id)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise EntityNotFoundException("Session", session_id)

        if current_user.role != "admin" and session.seeker_id != current_user.id and session.solver_id != current_user.id:
            raise ForbiddenException("Unauthorized to modify this session.")

        session.status = new_status
        await db.commit()
        return session_to_schema(session)

    @staticmethod
    async def reschedule_session(
        db: AsyncSession,
        session_id: str,
        data: RescheduleRequestSchema,
        current_user: User
    ) -> SessionResponseSchema:
        stmt = select(Session).options(selectinload(Session.problem), selectinload(Session.seeker), selectinload(Session.solver)).where(Session.id == session_id)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise EntityNotFoundException("Session", session_id)

        if current_user.role != "admin" and session.seeker_id != current_user.id and session.solver_id != current_user.id:
            raise ForbiddenException("Unauthorized to reschedule this session.")

        requested_by = "seeker" if current_user.id == session.seeker_id else "solver"
        session.status = "reschedule_requested"
        session.reschedule_requested_by = requested_by
        session.reschedule_reason = data.reason
        session.reschedule_new_date = data.newSlot.date
        session.reschedule_new_start_time = data.newSlot.startTime
        session.reschedule_new_end_time = data.newSlot.endTime

        # Notify counterpart
        counterpart_id = session.solver_id if requested_by == "seeker" else session.seeker_id
        notif = AppNotification(
            user_id=counterpart_id,
            title="Session Reschedule Requested",
            message=f"{current_user.name} requested to reschedule session to {data.newSlot.date} {data.newSlot.startTime}.",
            time_text="Just now",
            unread=True,
            type="reschedule",
            link="/app/sessions"
        )
        db.add(notif)
        await db.commit()
        return session_to_schema(session)

    @staticmethod
    async def accept_reschedule(
        db: AsyncSession,
        session_id: str,
        current_user: User
    ) -> SessionResponseSchema:
        stmt = select(Session).options(selectinload(Session.problem), selectinload(Session.seeker), selectinload(Session.solver)).where(Session.id == session_id)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session or not session.reschedule_new_date:
            raise SolveMateException(status_code=400, detail="No active reschedule request found.")

        # Acceptor must be counterpart or admin
        requester_id = session.seeker_id if session.reschedule_requested_by == "seeker" else session.solver_id
        if current_user.id == requester_id and current_user.role != "admin":
            raise ForbiddenException("You cannot accept your own reschedule request.")

        session.slot_date = session.reschedule_new_date
        session.slot_start_time = session.reschedule_new_start_time
        session.slot_end_time = session.reschedule_new_end_time
        session.status = "booked"
        session.countdown_text = f"Rescheduled to {session.slot_date} at {session.slot_start_time}"
        session.reschedule_requested_by = None
        session.reschedule_reason = None
        session.reschedule_new_date = None

        notif = AppNotification(
            user_id=requester_id,
            title="Reschedule Accepted",
            message=f"{current_user.name} accepted your reschedule request for {session.slot_date} at {session.slot_start_time}.",
            time_text="Just now",
            unread=True,
            type="reschedule",
            link="/app/sessions"
        )
        db.add(notif)
        await db.commit()
        return session_to_schema(session)

    @staticmethod
    async def cancel_session(
        db: AsyncSession,
        session_id: str,
        data: CancelSessionSchema,
        current_user: User
    ) -> SessionResponseSchema:
        stmt = select(Session).options(selectinload(Session.problem), selectinload(Session.seeker), selectinload(Session.solver)).where(Session.id == session_id)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise EntityNotFoundException("Session", session_id)

        if current_user.role != "admin" and session.seeker_id != current_user.id and session.solver_id != current_user.id:
            raise ForbiddenException("Unauthorized to cancel this session.")

        # Cancellation & Refund Calculation
        session.status = "cancelled"
        session.cancellation_reason = data.reason
        session.refund_amount = session.total_paid
        session.refund_policy = "100% full refund processed for cancellation requested prior to scheduled session."

        # Update escrow payment
        stmt_pay = select(PaymentRecord).where(PaymentRecord.session_id == session.id, PaymentRecord.status == "In Escrow")
        pay_res = await db.execute(stmt_pay)
        payment = pay_res.scalar_one_or_none()
        if payment:
            payment.status = "Refunded"

        await db.commit()
        return session_to_schema(session)

    @staticmethod
    async def complete_session(
        db: AsyncSession,
        session_id: str,
        data: CompleteSessionSchema,
        current_user: User
    ) -> SessionResponseSchema:
        stmt = (
            select(Session)
            .options(
                selectinload(Session.problem),
                selectinload(Session.seeker).selectinload(User.seeker_details),
                selectinload(Session.solver).selectinload(User.solver_details)
            )
            .where(Session.id == session_id)
        )
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise EntityNotFoundException("Session", session_id)

        # Seeker completes or Admin
        if current_user.role != "admin" and session.seeker_id != current_user.id:
            raise ForbiddenException("Only the seeker can complete the session and submit reviews.")

        session.status = "completed"
        session.problem_solved = data.problemSolved
        session.rating = data.rating
        session.review = data.review
        session.review_tags = data.tags or []

        # 1. Release Payment from Escrow
        stmt_pay = select(PaymentRecord).where(PaymentRecord.session_id == session.id, PaymentRecord.status == "In Escrow")
        pay_res = await db.execute(stmt_pay)
        seeker_payment = pay_res.scalar_one_or_none()
        if seeker_payment:
            seeker_payment.status = "Released"

        # 2. Add Solver Payout Record (net = 90% of session fee)
        net_payout = round(session.fee * (1.0 - settings.PLATFORM_FEE_PERCENTAGE))
        payout = PaymentRecord(
            user_id=session.solver_id,
            role="solver",
            session_id=session.id,
            title=f"Completed Session: {session.problem.title} ({session.seeker.name})",
            amount=session.fee,
            fee=round(session.fee * settings.PLATFORM_FEE_PERCENTAGE),
            net=net_payout,
            status="Paid",
            invoice_id=f"PAY-{int(datetime.now(timezone.utc).timestamp())}"
        )
        db.add(payout)

        # 3. Update Solver Stats & Rating
        svd = session.solver.solver_details
        if svd:
            svd.total_earnings += net_payout
            svd.completed_jobs_count += 1
            if svd.active_jobs_count > 0:
                svd.active_jobs_count -= 1
            if data.rating:
                prev_rating = svd.rating or 5.0
                prev_count = max(1, svd.completed_jobs_count - 1)
                new_rating = round(((prev_rating * prev_count) + data.rating) / (prev_count + 1), 2)
                svd.rating = min(5.0, max(1.0, new_rating))

        # 4. Save Review
        if data.rating and data.review:
            rev = Review(
                author_id=session.seeker_id,
                target_user_id=session.solver_id,
                session_id=session.id,
                author_role="Seeker",
                rating=data.rating,
                comment=data.review
            )
            db.add(rev)

        # 5. Update Problem to resolved
        if session.problem:
            session.problem.status = "resolved"

        # 6. Update Seeker Stats
        skd = session.seeker.seeker_details
        if skd:
            skd.resolved_count += 1
            if skd.in_progress_count > 0:
                skd.in_progress_count -= 1
            if skd.upcoming_sessions_count and skd.upcoming_sessions_count > 0:
                skd.upcoming_sessions_count -= 1

        # 7. Notify Solver
        notif = AppNotification(
            user_id=session.solver_id,
            title="Payment Released to Solver",
            message=f"₹{net_payout} has been released from escrow to your balance for '{session.problem.title}'.",
            time_text="Just now",
            unread=True,
            type="payment_released",
            link="/app/solver/earnings"
        )
        db.add(notif)

        await db.commit()
        return session_to_schema(session)

    @staticmethod
    async def save_notes(
        db: AsyncSession,
        session_id: str,
        notes: str,
        current_user: User
    ) -> SessionResponseSchema:
        stmt = select(Session).options(selectinload(Session.problem), selectinload(Session.seeker), selectinload(Session.solver)).where(Session.id == session_id)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise EntityNotFoundException("Session", session_id)

        if current_user.role != "admin" and session.seeker_id != current_user.id and session.solver_id != current_user.id:
            raise ForbiddenException("Unauthorized.")

        session.notes = notes
        await db.commit()
        return session_to_schema(session)
