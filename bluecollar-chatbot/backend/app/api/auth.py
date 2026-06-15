"""
Auth API — JWT login, register, and user info
Default admin: admin / sahayak2024
Fix: uses bcrypt directly (passlib 1.7.4 crashes on Python 3.12)
"""
import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt as _bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.database import get_db
from app.models.db_models import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)
settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ── Password helpers (bcrypt direct — passlib broken on Py3.12) ───────────────
def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.jwt_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        username: str = payload.get("sub")
        if not username:
            return None
    except JWTError:
        return None
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def require_admin(user: Optional[User] = Depends(get_current_user)):
    if not user or user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ── Schemas ───────────────────────────────────────────────────────────────────
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "employer"


class GoogleLoginRequest(BaseModel):
    email: str
    name: str
    role: str = "worker"


class MobileLoginRequest(BaseModel):
    mobile: str
    otp: str
    role: str = "worker"


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login and return JWT token. Auto-creates admin on first run."""
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    # Auto-create default admin if DB is empty
    if not user and form_data.username == "admin":
        logger.info("Creating default admin user...")
        user = User(
            username="admin",
            email="admin@sahayak.ai",
            hashed_password=hash_password("sahayak2024"),
            role=UserRole.admin,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.last_login = datetime.utcnow()
    await db.commit()

    token = create_access_token({"sub": user.username, "role": user.role.value})
    logger.info(f"Login successful: {user.username}")
    return LoginResponse(
        access_token=token,
        user={
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
        },
    )


@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    result2 = await db.execute(select(User).where(User.email == data.email))
    if result2.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        role = UserRole(data.role)
    except ValueError:
        role = UserRole.employer

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    logger.info(f"New user registered: {data.username}")
    return {"message": "Account created successfully", "username": data.username}


@router.post("/google-login", response_model=LoginResponse)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Simulated Google Login"""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user:
        try:
            role = UserRole(data.role)
        except ValueError:
            role = UserRole.employer
            
        username = data.email.split('@')[0]
        # Ensure username uniqueness
        res = await db.execute(select(User).where(User.username == username))
        if res.scalar_one_or_none():
            import random
            username = f"{username}{random.randint(100, 9999)}"

        user = User(
            username=username,
            email=data.email,
            hashed_password=hash_password("google_auth_placeholder"),
            role=role,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    user.last_login = datetime.utcnow()
    await db.commit()

    token = create_access_token({"sub": user.username, "role": user.role.value})
    logger.info(f"Google login successful: {user.username}")
    return LoginResponse(
        access_token=token,
        user={
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
        },
    )


@router.post("/mobile-login", response_model=LoginResponse)
async def mobile_login(data: MobileLoginRequest, db: AsyncSession = Depends(get_db)):
    """Simulated Mobile OTP Login"""
    if data.otp != "1234":
        raise HTTPException(status_code=400, detail="Invalid OTP. Use 1234 for demo.")

    email = f"{data.mobile}@mobile.sahayak.ai"
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        try:
            role = UserRole(data.role)
        except ValueError:
            role = UserRole.employer

        user = User(
            username=f"user_{data.mobile}",
            email=email,
            hashed_password=hash_password("mobile_auth_placeholder"),
            role=role,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    user.last_login = datetime.utcnow()
    await db.commit()

    token = create_access_token({"sub": user.username, "role": user.role.value})
    logger.info(f"Mobile login successful: {user.username}")
    return LoginResponse(
        access_token=token,
        user={
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
        },
    )


@router.get("/me")
async def get_me(user: Optional[User] = Depends(get_current_user)):
    """Get current logged-in user info."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }
