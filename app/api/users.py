from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.roles.interfaces import IRoleInterface
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import get_current_user, get_role_interface

router = APIRouter(prefix="/api/users", tags=["Users"])


class UserController:
    """Class-based user management endpoints."""

    @staticmethod
    @router.get("/me", response_model=UserResponse)
    def me(current_user: User = Depends(get_current_user)) -> UserResponse:
        return current_user

    @staticmethod
    @router.get("/", response_model=list[UserResponse])
    def list_users(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> list[UserResponse]:
        role_if.can_manage_users()
        return db.query(User).all()

    @staticmethod
    @router.get("/{user_id}", response_model=UserResponse)
    def get_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> UserResponse:
        role_if.can_manage_users()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    @router.patch("/{user_id}", response_model=UserResponse)
    def update_user(
        user_id: int,
        payload: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ) -> UserResponse:
        role_if.can_manage_users()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    @router.delete("/{user_id}", status_code=204)
    def deactivate_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        role_if: IRoleInterface = Depends(get_role_interface),
    ):
        role_if.can_manage_users()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = False
        db.commit()
