from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from typing import Optional, Tuple

from config import TOKEN_SECRET, TOKEN_ALGORITHM, TOKEN_EXPIRE_MINUTES
from models import RoleEnum

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme (expects Bearer Token in Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/signin")
oauth2_scheme_allow_none = OAuth2PasswordBearer(tokenUrl="/api/auth/signin", auto_error=False)


def create_access_token(user_id: str | int, user: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates an access token with user details."""
    user_id = str(user_id)  # Ensure user_id is always a string
    to_encode = {
        "sub": user_id,
        "username": user,
        "role": role
    }
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, TOKEN_SECRET, algorithm=TOKEN_ALGORITHM)


def verify_token_allow_none(token: Optional[str] = Depends(oauth2_scheme_allow_none)) -> Optional[dict]:
    """Verifies JWT but allows missing tokens (for guest access)."""
    if token is None:
        return None

    try:
        payload = jwt.decode(token, TOKEN_SECRET, algorithms=[TOKEN_ALGORITHM])
        user_id = payload.get("sub")
        username = payload.get("username")
        role = payload.get("role")

        if user_id is None or username is None or role is None:
            return None  # Invalid token data

        return {"sub": user_id, "username": username, "role": role}
    except JWTError:
        return None  # Invalid or expired token


def verify_token(token_data: Optional[dict] = Depends(verify_token_allow_none)) -> dict:
    """Strictly verifies JWT, rejecting invalid tokens."""
    if token_data is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token_data


def check_token_data(
    decoded_token: Optional[dict], required_role: Optional[list[RoleEnum]] = None, allow_none: bool = False) -> Optional[Tuple[str, str, str]]:
    """Validates token and checks role-based access control."""
    if decoded_token is None:
        if allow_none:
            return None
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = decoded_token.get("sub")
    username = decoded_token.get("username")
    role = decoded_token.get("role")

    if user_id is None or username is None or role is None:
        if allow_none:
            return None
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # Convert RoleEnum values to strings for comparison
    required_role_strs = [r.value if isinstance(r, RoleEnum) else r for r in required_role] if required_role else None

    if required_role_strs and role not in required_role_strs:
        if allow_none:
            return None
        raise HTTPException(status_code=403, detail="Forbidden")

    return (user_id, username, role)