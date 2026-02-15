"""
VendMieux — Auth helpers (JWT + bcrypt)
"""

import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Request

from database import get_user_by_id

JWT_SECRET = os.environ.get("JWT_SECRET", "vendmieux-dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def _extract_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


async def get_current_user(request: Request) -> dict:
    """FastAPI dependency — requires valid JWT. Raises 401 if missing/invalid."""
    token = _extract_token(request)
    if not token:
        raise HTTPException(401, "Token manquant")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Token invalide ou expiré")
    user = await get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(401, "Utilisateur introuvable")
    return user


async def get_optional_user(request: Request) -> dict | None:
    """FastAPI dependency — returns user if valid JWT, None otherwise."""
    token = _extract_token(request)
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    return await get_user_by_id(payload["sub"])
