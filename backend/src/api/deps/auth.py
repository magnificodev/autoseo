import os

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from src.database.models import User
from src.database.session import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = "HS256"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
        return user_id
    except JWTError:
        return None


def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực",
        headers={"WWW-Authenticate": "Bearer"},
    )
    raw_token = token
    if not raw_token:
        raw_token = request.cookies.get("token")
    if not raw_token:
        raise credentials_exception
    user_id = _decode_token(raw_token)
    if not user_id:
        raise credentials_exception
    user = db.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    return user
