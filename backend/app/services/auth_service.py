from datetime import datetime, timezone, timedelta

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import SolveMateException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from app.db.models.availability import SolverAvailability
from app.db.models.user import RefreshToken, SeekerDetails, SolverDetails, User
from app.schemas.auth import (
    LoginSchema,
    SeekerRegisterSchema,
    SolverRegisterSchema,
    TokenSchema,
)
from app.schemas.user import SeekerDetailsSchema, SolverDetailsSchema, UserSchema


def user_to_schema(user: User) -> UserSchema:
    seeker_details = None
    if user.seeker_details:
        sd = user.seeker_details
        seeker_details = SeekerDetailsSchema(
            totalSpent=sd.total_spent,
            postedProblemsCount=sd.posted_problems_count,
            inProgressCount=sd.in_progress_count,
            resolvedCount=sd.resolved_count,
            upcomingSessionsCount=sd.upcoming_sessions_count,
        )

    solver_details = None
    if user.solver_details:
        sv = user.solver_details
        solver_details = SolverDetailsSchema(
            highestQualification=sv.highest_qualification,
            fieldOfStudy=sv.field_of_study,
            institution=sv.institution,
            completionYear=sv.completion_year,
            experienceYears=sv.experience_years,
            skills=sv.skills or [],
            certifications=sv.certifications or [],
            documents=sv.documents or [],
            linkedIn=sv.linked_in,
            instagram=sv.instagram,
            verified=sv.verified,
            rating=sv.rating,
            completedJobsCount=sv.completed_jobs_count,
            activeJobsCount=sv.active_jobs_count,
            totalEarnings=sv.total_earnings,
            hourlyRate=sv.hourly_rate,
        )

    return UserSchema(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        city=user.city,
        bio=user.bio,
        avatarUrl=user.avatar_url,
        createdAt=user.created_at.isoformat(),
        seekerDetails=seeker_details,
        solverDetails=solver_details,
    )


class AuthService:
    @staticmethod
    async def register_seeker(db: AsyncSession, data: SeekerRegisterSchema) -> TokenSchema:
        # Check if email or phone already exists
        clean_email = data.email.strip().lower()
        stmt = select(User).where(or_(User.email == clean_email, User.phone == data.phone))
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise SolveMateException(status_code=400, detail="User with this email or phone already exists")

        # Create user
        user = User(
            name=data.fullName.strip(),
            email=clean_email,
            phone=data.phone.strip(),
            hashed_password=get_password_hash(data.password),
            role="seeker",
            city=data.city or "Remote",
            avatar_url=data.profilePhoto or f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.fullName}",
        )
        db.add(user)
        await db.flush()

        seeker_details = SeekerDetails(user_id=user.id)
        db.add(seeker_details)
        await db.commit()

        # Re-fetch user with relations
        stmt_full = (
            select(User)
            .options(selectinload(User.seeker_details), selectinload(User.solver_details))
            .where(User.id == user.id)
        )
        user_full = (await db.execute(stmt_full)).scalar_one()

        access_token = create_access_token(user_full.id, role=user_full.role)
        refresh_token = create_refresh_token(user_full.id, role=user_full.role)

        # Store refresh token
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        rtk = RefreshToken(user_id=user_full.id, token=refresh_token, expires_at=expires_at)
        db.add(rtk)
        await db.commit()

        return TokenSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_to_schema(user_full),
        )

    @staticmethod
    async def register_solver(db: AsyncSession, data: SolverRegisterSchema) -> TokenSchema:
        clean_email = data.email.strip().lower()
        stmt = select(User).where(or_(User.email == clean_email, User.phone == data.phone))
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise SolveMateException(status_code=400, detail="User with this email or phone already exists")

        user = User(
            name=data.fullName.strip(),
            email=clean_email,
            phone=data.phone.strip(),
            hashed_password=get_password_hash(data.password),
            role="solver",
            city=data.city or "Remote",
            bio=data.bio,
            avatar_url=data.profilePhoto or f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.fullName}",
        )
        db.add(user)
        await db.flush()

        solver_details = SolverDetails(
            user_id=user.id,
            highest_qualification=data.highestQualification,
            field_of_study=data.fieldOfStudy,
            institution=data.institution,
            completion_year=data.completionYear,
            experience_years=data.experienceYears,
            skills=data.skills,
            certifications=data.certifications or [],
            documents=data.documents or [],
            linked_in=data.linkedIn,
            instagram=data.instagram,
            verified=False,
            rating=5.0,
            hourly_rate=1500.0,
        )
        db.add(solver_details)

        # Create default solver weekly availability
        default_schedule = [
            {"day": "Monday", "enabled": True, "slots": [{"start": "10:00 AM", "end": "01:00 PM"}, {"start": "02:00 PM", "end": "06:00 PM"}]},
            {"day": "Tuesday", "enabled": True, "slots": [{"start": "10:00 AM", "end": "01:00 PM"}, {"start": "02:00 PM", "end": "06:00 PM"}]},
            {"day": "Wednesday", "enabled": True, "slots": [{"start": "10:00 AM", "end": "01:00 PM"}, {"start": "02:00 PM", "end": "06:00 PM"}]},
            {"day": "Thursday", "enabled": True, "slots": [{"start": "10:00 AM", "end": "01:00 PM"}, {"start": "02:00 PM", "end": "06:00 PM"}]},
            {"day": "Friday", "enabled": True, "slots": [{"start": "10:00 AM", "end": "01:00 PM"}, {"start": "02:00 PM", "end": "05:00 PM"}]},
            {"day": "Saturday", "enabled": True, "slots": [{"start": "11:00 AM", "end": "03:00 PM"}]},
            {"day": "Sunday", "enabled": False, "slots": []},
        ]
        availability = SolverAvailability(
            solver_id=user.id,
            weekly_schedule=default_schedule,
            blocked_dates=[],
            default_fee_per_30_min=1500.0,
            preferred_modes=["video", "audio", "chat"],
        )
        db.add(availability)
        await db.commit()

        stmt_full = (
            select(User)
            .options(selectinload(User.seeker_details), selectinload(User.solver_details))
            .where(User.id == user.id)
        )
        user_full = (await db.execute(stmt_full)).scalar_one()

        access_token = create_access_token(user_full.id, role=user_full.role)
        refresh_token = create_refresh_token(user_full.id, role=user_full.role)

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        rtk = RefreshToken(user_id=user_full.id, token=refresh_token, expires_at=expires_at)
        db.add(rtk)
        await db.commit()

        return TokenSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_to_schema(user_full),
        )

    @staticmethod
    async def login(db: AsyncSession, creds: LoginSchema) -> TokenSchema:
        clean_input = creds.emailOrPhone.strip().lower()
        stmt = (
            select(User)
            .options(selectinload(User.seeker_details), selectinload(User.solver_details))
            .where(
                or_(
                    User.email.ilike(clean_input),
                    User.phone == creds.emailOrPhone.strip(),
                )
            )
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not verify_password(creds.password, user.hashed_password):
            raise UnauthorizedException("Invalid email, phone, or password.")

        if not user.is_active:
            raise UnauthorizedException("User account is inactive. Please contact support.")

        # Check role compatibility: Admin can log in as any role; normal users must match role
        if user.role != creds.role and user.role != "admin":
            raise UnauthorizedException(f"Account exists but is registered as '{user.role}', not '{creds.role}'.")

        access_token = create_access_token(user.id, role=user.role)
        refresh_token = create_refresh_token(user.id, role=user.role)

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        rtk = RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at)
        db.add(rtk)
        await db.commit()

        return TokenSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_to_schema(user),
        )

    @staticmethod
    async def refresh(db: AsyncSession, refresh_token_str: str) -> TokenSchema:
        try:
            payload = decode_refresh_token(refresh_token_str)
            user_id = payload.get("sub")
        except Exception:
            raise UnauthorizedException("Invalid or expired refresh token.")

        stmt = select(RefreshToken).where(
            RefreshToken.token == refresh_token_str,
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False,
        )
        res = await db.execute(stmt)
        db_rtk = res.scalar_one_or_none()
        if not db_rtk:
            raise UnauthorizedException("Refresh token revoked or not found.")

        # Check expiration
        if db_rtk.expires_at < datetime.now(timezone.utc):
            db_rtk.revoked = True
            await db.commit()
            raise UnauthorizedException("Refresh token expired.")

        # Revoke old refresh token (rotation)
        db_rtk.revoked = True

        stmt_user = (
            select(User)
            .options(selectinload(User.seeker_details), selectinload(User.solver_details))
            .where(User.id == user_id)
        )
        user = (await db.execute(stmt_user)).scalar_one_or_none()
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive.")

        new_access = create_access_token(user.id, role=user.role)
        new_refresh = create_refresh_token(user.id, role=user.role)

        new_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        new_db_rtk = RefreshToken(user_id=user.id, token=new_refresh, expires_at=new_expires_at)
        db.add(new_db_rtk)
        await db.commit()

        return TokenSchema(
            access_token=new_access,
            refresh_token=new_refresh,
            user=user_to_schema(user),
        )

    @staticmethod
    async def logout(db: AsyncSession, user_id: str, refresh_token_str: str | None = None) -> None:
        if refresh_token_str:
            stmt = select(RefreshToken).where(
                RefreshToken.token == refresh_token_str,
                RefreshToken.user_id == user_id,
            )
            res = await db.execute(stmt)
            rtk = res.scalar_one_or_none()
            if rtk:
                rtk.revoked = True
                await db.commit()
        else:
            # Revoke all active refresh tokens for user
            stmt = select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked == False,
            )
            res = await db.execute(stmt)
            tokens = res.scalars().all()
            for t in tokens:
                t.revoked = True
            await db.commit()
