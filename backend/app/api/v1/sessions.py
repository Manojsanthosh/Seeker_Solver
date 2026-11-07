
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_roles
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.session import (
    BookSessionSchema,
    CancelSessionSchema,
    CompleteSessionSchema,
    RescheduleRequestSchema,
    SaveNotesSchema,
    SessionResponseSchema,
    SessionStatusUpdateSchema,
)
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["Sessions & Bookings"])


@router.post("/book", response_model=SessionResponseSchema, status_code=status.HTTP_201_CREATED)
async def book_session(
    data: BookSessionSchema,
    current_user: User = Depends(require_roles("seeker")),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.book_session(db, data, current_user)


@router.get("", response_model=list[SessionResponseSchema])
async def list_sessions(
    status: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.list_sessions(db, current_user, status=status)


@router.get("/{session_id}", response_model=SessionResponseSchema)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.get_session_by_id(db, session_id, current_user)


@router.get("/{session_id}/room-state")
async def get_room_state(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = await SessionService.get_session_by_id(db, session_id, current_user)
    # Return WebRTC / room tokens and session context
    return {
        "session": session,
        "roomToken": f"token_{session.id}_{current_user.id}",
        "canJoin": session.status in ["booked", "live"],
        "userRole": "seeker" if current_user.id == session.seekerId else "solver",
    }


@router.patch("/{session_id}/status", response_model=SessionResponseSchema)
async def update_session_status(
    session_id: str,
    data: SessionStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.update_session_status(db, session_id, data.status, current_user)


@router.post("/{session_id}/reschedule", response_model=SessionResponseSchema)
async def reschedule_session(
    session_id: str,
    data: RescheduleRequestSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.reschedule_session(db, session_id, data, current_user)


@router.post("/{session_id}/accept-reschedule", response_model=SessionResponseSchema)
async def accept_reschedule(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.accept_reschedule(db, session_id, current_user)


@router.post("/{session_id}/cancel", response_model=SessionResponseSchema)
async def cancel_session(
    session_id: str,
    data: CancelSessionSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.cancel_session(db, session_id, data, current_user)


@router.post("/{session_id}/complete", response_model=SessionResponseSchema)
async def complete_session(
    session_id: str,
    data: CompleteSessionSchema,
    current_user: User = Depends(require_roles("seeker")),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.complete_session(db, session_id, data, current_user)


@router.post("/{session_id}/notes", response_model=SessionResponseSchema)
async def save_notes(
    session_id: str,
    data: SaveNotesSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await SessionService.save_notes(db, session_id, data.notes, current_user)
