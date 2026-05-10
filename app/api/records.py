from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.financial import CategoryEnum, FinancialRecord, RecordType
from app.models.user import User
from app.roles.interfaces import IRoleInterface
from app.schemas.financial import RecordCreate, RecordResponse, RecordUpdate
from app.services.auth import get_current_user, get_role_interface

router = APIRouter(prefix="/api/records", tags=["Financial Records"])


class RecordController:
    """Class-based financial record endpoints."""

    @staticmethod
    @router.get("/", response_model=list[RecordResponse])
    def list_records(
        type: Optional[RecordType] = Query(None),
        category: Optional[CategoryEnum] = Query(None),
        date_from: Optional[date] = Query(None),
        date_to: Optional[date] = Query(None),
        page: int = Query(1, ge=1),
        size: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> list[RecordResponse]:
        role_if.can_view_records()

        query = db.query(FinancialRecord).filter(FinancialRecord.status != "deleted")

        if type:
            query = query.filter(FinancialRecord.type == type)
        if category:
            query = query.filter(FinancialRecord.category == category)
        if date_from:
            query = query.filter(FinancialRecord.date >= date_from)
        if date_to:
            query = query.filter(FinancialRecord.date <= date_to)
        if search:
            query = query.filter(FinancialRecord.description.ilike(f"%{search}%"))

        offset = (page - 1) * size
        return query.order_by(FinancialRecord.date.desc()).offset(offset).limit(size).all()

    @staticmethod
    @router.get("/{record_id}", response_model=RecordResponse)
    def get_record(
        record_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> RecordResponse:
        role_if.can_view_records()
        record = db.query(FinancialRecord).filter(
            FinancialRecord.id == record_id,
            FinancialRecord.status != "deleted",
        ).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        return record

    @staticmethod
    @router.post("/", response_model=RecordResponse, status_code=201)
    def create_record(
        payload: RecordCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> RecordResponse:
        role_if.can_create_record()

        record = FinancialRecord(
            amount=payload.amount,
            type=payload.type,
            category=payload.category,
            date=payload.date,
            description=payload.description,
            created_by=current_user.id,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    @router.put("/{record_id}", response_model=RecordResponse)
    def update_record(
        record_id: int,
        payload: RecordUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> RecordResponse:
        role_if.can_update_record()

        record = db.query(FinancialRecord).filter(
            FinancialRecord.id == record_id,
            FinancialRecord.status != "deleted",
        ).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)

        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    @router.delete("/{record_id}", status_code=204)
    def delete_record(
        record_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ):
        role_if.can_delete_record()

        record = db.query(FinancialRecord).filter(
            FinancialRecord.id == record_id,
            FinancialRecord.status != "deleted",
        ).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        record.status = "deleted"
        db.commit()
