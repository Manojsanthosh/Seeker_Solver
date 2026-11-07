from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.messages import router as messages_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.offers import router as offers_router
from app.api.v1.payments import router as payments_router
from app.api.v1.problems import router as problems_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.solvers import router as solvers_router
from app.api.v1.users import router as users_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(solvers_router)
api_router.include_router(categories_router)
api_router.include_router(problems_router)
api_router.include_router(offers_router)
api_router.include_router(sessions_router)
api_router.include_router(payments_router)
api_router.include_router(messages_router)
api_router.include_router(notifications_router)
api_router.include_router(reviews_router)
api_router.include_router(admin_router)
