from pydantic import BaseModel, ConfigDict, Field


class ReviewCreateSchema(BaseModel):
    targetUserId: str
    sessionId: str
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: str = Field(..., min_length=5, max_length=1000)


class ReviewResponseSchema(BaseModel):
    id: str
    authorName: str
    authorRole: str
    avatarUrl: str
    rating: float
    comment: str
    date: str

    model_config = ConfigDict(from_attributes=True)
