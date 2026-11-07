
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.review import Review
from app.db.session import get_db
from app.schemas.review import ReviewResponseSchema

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/solver/{solver_id}", response_model=list[ReviewResponseSchema])
async def get_solver_reviews(
    solver_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Review)
        .options(selectinload(Review.author))
        .where(Review.target_user_id == solver_id)
        .order_by(Review.created_at.desc())
    )
    res = await db.execute(stmt)
    reviews = res.scalars().all()
    return [
        ReviewResponseSchema(
            id=r.id,
            authorName=r.author.name if r.author else "Seeker",
            authorRole=r.author_role,
            avatarUrl=r.author.avatar_url if r.author else "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            rating=r.rating,
            comment=r.comment,
            date=r.created_at.strftime("%d %b %Y")
        )
        for r in reviews
    ]
