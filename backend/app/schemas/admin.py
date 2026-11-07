
from pydantic import BaseModel


class AdminStatsSchema(BaseModel):
    totalUsers: int
    totalSeekers: int
    totalSolvers: int
    totalProblems: int
    totalSessions: int
    totalEscrowHoldings: float
    totalPlatformRevenue: float


class AdminVerifySolverSchema(BaseModel):
    verified: bool
    notes: str | None = None
