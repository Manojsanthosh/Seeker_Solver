
from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRole, UserSchema


class SeekerRegisterSchema(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=30)
    password: str = Field(..., min_length=6, max_length=128)
    city: str | None = None
    profilePhoto: str | None = None


class SolverRegisterSchema(BaseModel):
    # Step 1: Personal info
    fullName: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=30)
    password: str = Field(..., min_length=6, max_length=128)
    city: str | None = "Remote"
    bio: str | None = None
    profilePhoto: str | None = None

    # Step 2: Qualifications & Skills
    highestQualification: str = "Bachelor's"
    fieldOfStudy: str = Field(..., min_length=2)
    institution: str = Field(..., min_length=2)
    completionYear: str = Field(..., min_length=4, max_length=4)
    experienceYears: int = Field(0, ge=0, le=50)
    skills: list[str] = Field(..., min_length=1)
    certifications: list[dict] | None = Field(default_factory=list)
    documents: list[dict] | None = Field(default_factory=list)

    # Step 3: Social & Proof
    linkedIn: str | None = None
    instagram: str | None = None


class LoginSchema(BaseModel):
    emailOrPhone: str
    password: str
    role: UserRole


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserSchema


class RefreshTokenRequest(BaseModel):
    refresh_token: str
