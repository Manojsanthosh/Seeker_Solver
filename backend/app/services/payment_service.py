from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import SolveMateException
from app.db.models.payment import PaymentRecord
from app.db.models.user import SolverDetails, User
from app.schemas.payment import (
    PaymentRecordSchema,
    SolverEarningsSummarySchema,
    WithdrawRequestSchema,
)


def payment_to_schema(p: PaymentRecord) -> PaymentRecordSchema:
    date_str = p.created_at.strftime("%d %b %Y")
    return PaymentRecordSchema(
        id=p.id,
        date=date_str,
        title=p.title,
        amount=p.amount,
        fee=p.fee,
        net=p.net,
        status=p.status,
        invoiceId=p.invoice_id or f"INV-{p.id[-6:]}"
    )


class PaymentService:
    @staticmethod
    async def get_seeker_payments(db: AsyncSession, seeker_id: str) -> list[PaymentRecordSchema]:
        stmt = (
            select(PaymentRecord)
            .where(PaymentRecord.user_id == seeker_id, PaymentRecord.role == "seeker")
            .order_by(PaymentRecord.created_at.desc())
        )
        res = await db.execute(stmt)
        records = res.scalars().all()
        return [payment_to_schema(r) for r in records]

    @staticmethod
    async def get_solver_earnings(db: AsyncSession, solver_id: str) -> SolverEarningsSummarySchema:
        # Payout records
        stmt = (
            select(PaymentRecord)
            .where(PaymentRecord.user_id == solver_id, PaymentRecord.role == "solver")
            .order_by(PaymentRecord.created_at.desc())
        )
        res = await db.execute(stmt)
        records = res.scalars().all()

        # In escrow for solver: find sessions with status 'booked' / 'live' for this solver
        # whose payment is 'In Escrow'
        from app.db.models.session import Session
        escrow_stmt = select(func.coalesce(func.sum(Session.fee), 0.0)).where(
            Session.solver_id == solver_id,
            Session.status.in_(["booked", "live", "reschedule_requested"])
        )
        escrow_res = await db.execute(escrow_stmt)
        in_escrow = float(escrow_res.scalar() or 0.0)

        # Solver details
        sv_stmt = select(SolverDetails).where(SolverDetails.user_id == solver_id)
        sv_res = await db.execute(sv_stmt)
        svd = sv_res.scalar_one_or_none()
        total_earnings = svd.total_earnings if svd else 0.0

        # Available balance = total paid earnings minus withdrawals
        withdrawals = sum(r.net for r in records if r.title.startswith("Withdrawal"))
        paid_payouts = sum(r.net for r in records if not r.title.startswith("Withdrawal") and r.status == "Paid")
        available_balance = max(0.0, paid_payouts - withdrawals)

        return SolverEarningsSummarySchema(
            payouts=[payment_to_schema(r) for r in records],
            totalEarnings=total_earnings,
            availableBalance=available_balance,
            inEscrow=in_escrow
        )

    @staticmethod
    async def withdraw(
        db: AsyncSession,
        solver: User,
        data: WithdrawRequestSchema
    ) -> PaymentRecordSchema:
        summary = await PaymentService.get_solver_earnings(db, solver.id)
        if data.amount > summary.availableBalance:
            raise SolveMateException(
                status_code=400,
                detail=f"Withdrawal amount ₹{data.amount} exceeds available balance ₹{summary.availableBalance}."
            )

        invoice_id = f"WD-{int(datetime.now(timezone.utc).timestamp())}"
        record = PaymentRecord(
            user_id=solver.id,
            role="solver",
            title=f"Withdrawal via {data.method.upper()} ({data.destination})",
            amount=data.amount,
            fee=0.0,
            net=data.amount,
            status="Paid",
            invoice_id=invoice_id,
            payment_method=data.method,
            destination=data.destination
        )
        db.add(record)
        await db.commit()
        return payment_to_schema(record)
