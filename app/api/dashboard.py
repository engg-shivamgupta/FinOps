from fastapi import APIRouter, Depends
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.financial import FinancialRecord, RecordType
from app.models.user import User
from app.roles.interfaces import IRoleInterface
from app.roles.registry import RoleRegistrar
from app.schemas.financial import DashboardSummary, RecordResponse
from app.services.auth import get_current_user, get_role_interface

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class DashboardController:
    """Class-based dashboard summary endpoints."""

    @staticmethod
    @router.get("/summary", response_model=DashboardSummary)
    def summary(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> DashboardSummary:
        role_if.can_view_dashboard()

        base = db.query(FinancialRecord).filter(FinancialRecord.status != "deleted")

        total_income = (
            base.filter(FinancialRecord.type == RecordType.INCOME)
            .with_entities(func.coalesce(func.sum(FinancialRecord.amount), 0))
            .scalar()
        )
        total_expenses = (
            base.filter(FinancialRecord.type == RecordType.EXPENSE)
            .with_entities(func.coalesce(func.sum(FinancialRecord.amount), 0))
            .scalar()
        )

        # Category-wise totals
        cat_rows = (
            base.with_entities(FinancialRecord.category, func.sum(FinancialRecord.amount))
            .group_by(FinancialRecord.category)
            .all()
        )
        category_totals = {cat: float(total) for cat, total in cat_rows}

        # Recent 10 records
        recent = base.order_by(FinancialRecord.date.desc()).limit(10).all()

        # Monthly trends (last 12 months)
        monthly = (
            base.with_entities(
                extract("year", FinancialRecord.date).label("year"),
                extract("month", FinancialRecord.date).label("month"),
                FinancialRecord.type,
                func.sum(FinancialRecord.amount).label("total"),
            )
            .group_by("year", "month", FinancialRecord.type)
            .order_by("year", "month")
            .all()
        )

        trends: dict[str, dict] = {}
        for year, month, rec_type, total in monthly:
            key = f"{int(year)}-{int(month):02d}"
            if key not in trends:
                trends[key] = {"month": key, "income": 0.0, "expense": 0.0}
            trends[key][rec_type.value] = float(total)

        trend_list = list(trends.values())[-12:]

        return DashboardSummary(
            total_income=float(total_income),
            total_expenses=float(total_expenses),
            net_balance=float(total_income) - float(total_expenses),
            category_totals=category_totals,
            recent_activity=[RecordResponse.model_validate(r) for r in recent],
            monthly_trends=trend_list,
        )

    @staticmethod
    @router.get("/insights")
    def insights(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ):
        role_if.can_view_insights()

        base = db.query(FinancialRecord).filter(FinancialRecord.status != "deleted")

        # Top spending categories
        top_expenses = (
            base.filter(FinancialRecord.type == RecordType.EXPENSE)
            .with_entities(FinancialRecord.category, func.sum(FinancialRecord.amount).label("total"))
            .group_by(FinancialRecord.category)
            .order_by(func.sum(FinancialRecord.amount).desc())
            .limit(5)
            .all()
        )

        # Top income sources
        top_income = (
            base.filter(FinancialRecord.type == RecordType.INCOME)
            .with_entities(FinancialRecord.category, func.sum(FinancialRecord.amount).label("total"))
            .group_by(FinancialRecord.category)
            .order_by(func.sum(FinancialRecord.amount).desc())
            .limit(5)
            .all()
        )

        record_count = base.count()

        return {
            "top_expense_categories": [{"category": c, "total": float(t)} for c, t in top_expenses],
            "top_income_sources": [{"category": c, "total": float(t)} for c, t in top_income],
            "total_records": record_count,
        }

    @staticmethod
    @router.get("/roles")
    def roles():
        """Public endpoint: returns the registrar's role-to-interface map."""
        return RoleRegistrar.all_roles()
