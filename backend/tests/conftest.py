import pytest
import pytest_asyncio
import os
import sys
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.models.user import User, SeekerDetails, SolverDetails
from app.db.models.availability import SolverAvailability
from app.core.security import create_access_token, get_password_hash

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_solvemate.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    future=True
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed base test users
    async with TestingSessionLocal() as session:
        pwd_hash = get_password_hash("Demo@123")
        admin_pwd_hash = get_password_hash("Admin@123")

        seeker = User(
            id="usr_seeker_001",
            name="Ananya Sharma",
            email="seeker@demo.com",
            phone="+91 98765 43210",
            hashed_password=pwd_hash,
            role="seeker",
            is_active=True
        )
        session.add(seeker)
        await session.flush()
        session.add(SeekerDetails(user_id=seeker.id))

        solver = User(
            id="usr_solver_001",
            name="Dr. Rajesh Raman",
            email="solver@demo.com",
            phone="+91 98450 12345",
            hashed_password=pwd_hash,
            role="solver",
            is_active=True
        )
        session.add(solver)
        await session.flush()
        session.add(SolverDetails(
            user_id=solver.id,
            highest_qualification="Master's",
            field_of_study="Computer Science",
            institution="IIT Madras",
            experience_years=8,
            skills=["PostgreSQL", "React & TypeScript", "Cloud & AWS"],
            rating=4.96,
            verified=True
        ))
        session.add(SolverAvailability(
            solver_id=solver.id,
            weekly_schedule=[{"day": "Monday", "enabled": True, "slots": [{"start": "10:00 AM", "end": "01:00 PM"}]}],
            preferred_modes=["video", "audio", "chat"]
        ))

        admin = User(
            id="usr_admin_001",
            name="Administrator",
            email="admin@solvemate.com",
            phone="+91 99999 00000",
            hashed_password=admin_pwd_hash,
            role="admin",
            is_active=True
        )
        session.add(admin)

        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
    if os.path.exists("./test_solvemate.db"):
        try:
            os.remove("./test_solvemate.db")
        except Exception:
            pass


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def seeker_token() -> str:
    return create_access_token(subject="usr_seeker_001", role="seeker")


@pytest.fixture
def solver_token() -> str:
    return create_access_token(subject="usr_solver_001", role="solver")


@pytest.fixture
def admin_token() -> str:
    return create_access_token(subject="usr_admin_001", role="admin")
