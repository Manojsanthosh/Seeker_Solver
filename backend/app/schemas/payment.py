from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PaymentRecordSchema(BaseModel):
    id: str
    date: str
    title: str
    amount: float
    fee: float
    net: float
    status: Literal["Paid", "In Escrow", "Released", "Refunded"]
    invoiceId: str | None = None

    model_config = ConfigDict(from_attributes=True)


class WithdrawRequestSchema(BaseModel):
    amount: float = Field(..., ge=100)
    method: Literal["upi", "bank"]
    destination: str = Field(..., min_length=3, max_length=100)


class SolverEarningsSummarySchema(BaseModel):
    payouts: list[PaymentRecordSchema]
    totalEarnings: float
    availableBalance: float
    inEscrow: float
