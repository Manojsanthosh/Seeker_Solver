from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

QualificationLevel = Literal[
    "High School",
    "Diploma",
    "Bachelor's",
    "Master's",
    "PhD",
    "Other"
]

UserRole = Literal["seeker", "solver", "admin"]


class CertificationSchema(BaseModel):
    id: str
    name: str
    issuer: str
    year: str


class UploadedFileSchema(BaseModel):
    id: str
    name: str
    size: int
    type: str
    url: str | None = None


class SeekerDetailsSchema(BaseModel):
    totalSpent: float = 0.0
    postedProblemsCount: int = 0
    inProgressCount: int = 0
    resolvedCount: int = 0
    upcomingSessionsCount: int | None = 0


class SolverDetailsSchema(BaseModel):
    highestQualification: str = "Bachelor's"
    fieldOfStudy: str = "General"
    institution: str = ""
    completionYear: str = ""
    experienceYears: int = 0
    skills: list[str] = Field(default_factory=list)
    certifications: list[dict] = Field(default_factory=list)
    documents: list[dict] = Field(default_factory=list)
    linkedIn: str | None = None
    instagram: str | None = None
    verified: bool = False
    rating: float = 5.0
    completedJobsCount: int = 0
    activeJobsCount: int = 0
    totalEarnings: float = 0.0
    hourlyRate: float | None = None


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    city: str | None = None
    bio: str | None = None
    avatarUrl: str | None = None


class UserSchema(UserBase):
    id: str
    createdAt: str
    seekerDetails: SeekerDetailsSchema | None = None
    solverDetails: SolverDetailsSchema | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdateSchema(BaseModel):
    name: str | None = None
    phone: str | None = None
    city: str | None = None
    bio: str | None = None
    avatarUrl: str | None = None
