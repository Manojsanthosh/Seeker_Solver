from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.problem import SessionMode

DayOfWeek = Literal[
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]


class TimeIntervalSchema(BaseModel):
    start: str  # e.g., "10:00 AM"
    end: str    # e.g., "01:00 PM"


class WeeklyDayScheduleSchema(BaseModel):
    day: DayOfWeek
    enabled: bool
    slots: list[TimeIntervalSchema] = Field(default_factory=list)


class SolverAvailabilitySchema(BaseModel):
    weeklySchedule: list[WeeklyDayScheduleSchema]
    blockedDates: list[str] = Field(default_factory=list)
    defaultFeePer30Min: float = 1500.0
    preferredModes: list[SessionMode] = Field(default_factory=lambda: ["video", "audio", "chat"])

    model_config = ConfigDict(from_attributes=True)


class SolverAvailabilityUpdateSchema(BaseModel):
    weeklySchedule: list[WeeklyDayScheduleSchema]
    blockedDates: list[str] = Field(default_factory=list)
    defaultFeePer30Min: float = 1500.0
    preferredModes: list[SessionMode] = Field(default_factory=lambda: ["video", "audio", "chat"])
