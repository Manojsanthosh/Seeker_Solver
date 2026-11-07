from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserSchema

SessionMode = Literal["chat", "audio", "video"]
SessionUrgency = Literal["today", "this_week", "flexible"]
TimeWindow = Literal["morning", "afternoon", "evening", "custom"]
ProblemStatus = Literal["open", "in_progress", "resolved", "closed"]


class PreferredWindowSchema(BaseModel):
    date: str  # YYYY-MM-DD
    timeWindow: TimeWindow
    customStart: str | None = None
    customEnd: str | None = None


class ProblemCreateSchema(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    category: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    budgetType: Literal["range", "fixed"] = "fixed"
    budget: float = Field(..., ge=100)
    budgetMin: float | None = None
    budgetMax: float | None = None
    preferredMode: SessionMode = "video"
    estimatedDuration: Literal[15, 30, 45, 60, 90] = 30
    preferredAvailability: list[PreferredWindowSchema] = Field(default_factory=list)
    urgency: SessionUrgency = "flexible"
    deadline: str = ""
    location: str | None = "Remote (IST)"
    attachments: list[dict] | None = Field(default_factory=list)


class ProblemStatusUpdateSchema(BaseModel):
    status: ProblemStatus


class ProblemResponseSchema(BaseModel):
    id: str
    title: str
    category: str
    description: str
    budgetType: Literal["range", "fixed"]
    budgetMin: float | None = None
    budgetMax: float | None = None
    budget: float
    preferredMode: SessionMode
    estimatedDuration: int
    preferredAvailability: list[PreferredWindowSchema]
    urgency: SessionUrgency
    deadline: str
    status: ProblemStatus
    seekerId: str
    seekerName: str
    seekerAvatar: str | None = None
    solverId: str | None = None
    solverName: str | None = None
    solverAvatar: str | None = None
    attachments: list[dict] | None = None
    createdAt: str
    offersCount: int
    location: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SolverMatchItemSchema(BaseModel):
    solver: UserSchema
    matchScore: float
    matchReasons: list[str]
    availabilityOverlap: bool


class SolverMatchListResponseSchema(BaseModel):
    problemId: str
    matches: list[SolverMatchItemSchema]
