
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.category import Category
from app.db.session import get_db
from app.schemas.category import CategorySchema

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    stmt = select(Category).order_by(Category.name.asc())
    res = await db.execute(stmt)
    categories = res.scalars().all()
    return [
        CategorySchema(
            id=c.id,
            name=c.name,
            slug=c.slug,
            icon=c.icon,
            problemCount=c.problem_count,
            description=c.description
        )
        for c in categories
    ]
