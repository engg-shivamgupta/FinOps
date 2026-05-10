from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.roles.registry import RoleRegistrar
from app.schemas.user import LoginRequest, Token, UserCreate, UserResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class AuthController:
    """Class-based auth endpoints."""

    @staticmethod
    @router.post("/register", response_model=UserResponse, status_code=201)
    def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
        if db.query(User).filter(User.username == payload.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            username=payload.username,
            email=payload.email,
            hashed_password=AuthService.hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    @router.post("/login", response_model=Token)
    def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
        user = db.query(User).filter(User.username == payload.username).first()
        if not user or not AuthService.verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is inactive")

        token = AuthService.create_access_token({"sub": str(user.id), "role": user.role.value})
        interface_map = RoleRegistrar.get_interface_map(user.role)

        return Token(
            access_token=token,
            role=user.role.value,
            interface=interface_map,
        )
