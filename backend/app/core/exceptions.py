from typing import Any

from fastapi import HTTPException, status


class SolveMateException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: dict[str, str] | None = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class EntityNotFoundException(SolveMateException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with id '{entity_id}' not found."
        )


class UnauthorizedException(SolveMateException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(SolveMateException):
    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class SlotConflictException(SolveMateException):
    def __init__(self, detail: str = "Requested appointment slot has already been booked or is in conflict"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class EscrowException(SolveMateException):
    def __init__(self, detail: str = "Escrow transaction could not be processed"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
