from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.problem import SessionMode


class SlotSchema(BaseModel):
    id: str | None = None
    date: str  # YYYY-MM-DD
    startTime: str  # e.g., "10:30 AM"
    endTime: str  # e.g., "11:00 AM"
    isBestMatch: bool | None = False
    isBooked: bool | None = False


class OfferCreateSchema(BaseModel):
    problemId: str
    slots: list[SlotSchema] = Field(..., min_length=1, max_length=5)
    mode: SessionMode = "video"
    durationMinutes: int = 30
    sessionFee: float = Field(..., ge=100)
    note: str | None = Field(None, max_length=200)


class OfferStatusUpdateSchema(BaseModel):
    status: Literal["sent", "accepted", "declined", "rescheduled"]


class OfferResponseSchema(BaseModel):
    id: str
    problemId: str
    problemTitle: str
    solverId: str
    solverName: str
    solverAvatar: str | None = None
    solverRating: float = 5.0
    solverVerified: bool = False
    solverQualification: str = ""
    solverSkills: list[str] = Field(default_factory=list)
    slots: list[SlotSchema]
    mode: SessionMode
    durationMinutes: int
    sessionFee: float
    platformFee: float
    gst: float
    totalPayable: float
    note: str | None = None
    status: Literal["sent", "accepted", "declined", "rescheduled"]
    createdAt: str

    model_config = ConfigDict(from_attributes=True)
