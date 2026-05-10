from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.financial import CategoryEnum, RecordType


class RecordCreate(BaseModel):
    amount: float = Field(..., gt=0)
    type: RecordType
    category: CategoryEnum
    date: date
    description: Optional[str] = None


class RecordUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[RecordType] = None
    category: Optional[CategoryEnum] = None
    date: Optional[date] = None
    description: Optional[str] = None


class RecordResponse(BaseModel):
    id: int
    amount: float
    type: RecordType
    category: CategoryEnum
    date: date
    description: Optional[str]
    created_by: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecordFilter(BaseModel):
    type: Optional[RecordType] = None
    category: Optional[CategoryEnum] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    category_totals: dict[str, float]
    recent_activity: list[RecordResponse]
    monthly_trends: list[dict]
