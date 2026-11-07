from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.offer import SlotSchema
from app.schemas.problem import SessionMode

SessionStatus = Literal[
    "offered",
    "booked",
    "reschedule_requested",
    "live",
    "completed",
    "cancelled",
    "no_show"
]


class BookSessionSchema(BaseModel):
    offerId: str
    slot: SlotSchema
    paymentMethod: str | None = "upi"
    paymentDetails: dict | None = None


class RescheduleRequestSchema(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)
    newSlot: SlotSchema


class CancelSessionSchema(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


class CompleteSessionSchema(BaseModel):
    problemSolved: bool
    rating: float | None = Field(None, ge=1.0, le=5.0)
    review: str | None = None
    tags: list[str] | None = Field(default_factory=list)


class SaveNotesSchema(BaseModel):
    notes: str


class SessionStatusUpdateSchema(BaseModel):
    status: SessionStatus


class RescheduleDataSchema(BaseModel):
    requestedBy: Literal["seeker", "solver"]
    reason: str
    newSlot: SlotSchema


class SessionResponseSchema(BaseModel):
    id: str
    problemId: str
    problemTitle: str
    problemCategory: str
    seekerId: str
    seekerName: str
    seekerAvatar: str | None = None
    solverId: str
    solverName: str
    solverAvatar: str | None = None
    slot: SlotSchema
    mode: SessionMode
    durationMinutes: int
    fee: float
    totalPaid: float
    status: SessionStatus
    countdownText: str | None = None
    rescheduleData: RescheduleDataSchema | None = None
    cancellationReason: str | None = None
    refundPolicy: str | None = None
    refundAmount: float | None = None
    problemSolved: bool | None = None
    notes: str | None = None
    rating: float | None = None
    review: str | None = None
    reviewTags: list[str] | None = None
    sharedFiles: list[dict] | None = None
    createdAt: str

    model_config = ConfigDict(from_attributes=True)
