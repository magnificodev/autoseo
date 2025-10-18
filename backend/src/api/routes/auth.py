import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from src.api.deps.auth import get_current_user
from src.database.models import Base, User, Role
from src.database.session import SessionLocal, engine
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = "HS256"
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "60"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRE_MIN))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)
    return encoded_jwt


@router.post("/register")
def register(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Đảm bảo bảng tồn tại trong trường hợp startup hook chưa chạy
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    
    # Email validation
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email không hợp lệ")
    
    # Password strength check
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Mật khẩu phải có ít nhất 6 ký tự")
    
    # Check if email already exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    
    try:
        # Get default viewer role
        viewer_role = db.query(Role).filter(Role.name == "viewer").first()
        if not viewer_role:
            # Create default roles if they don't exist
            admin_role = Role(name="admin", max_users=1, permissions='["*"]')
            manager_role = Role(name="manager", max_users=5, permissions='["dashboard.view", "sites.*", "keywords.*", "content.*", "audit_logs.view"]')
            viewer_role = Role(name="viewer", max_users=-1, permissions='["dashboard.view", "audit_logs.view"]')
            db.add_all([admin_role, manager_role, viewer_role])
            db.commit()
            db.refresh(viewer_role)
        
        # Create user with viewer role
        user = User(
            email=email,
            password_hash=hash_password(password),
            role_id=viewer_role.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"id": user.id, "email": user.email, "role": "viewer"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"register_failed: {e}")


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Sai thông tin đăng nhập"
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


class CreateAdminRequest(BaseModel):
    email: str
    password: str


@router.get("/check-db")
def check_database(db: Session = Depends(get_db)):
    """Check database schema and tables"""
    try:
        # Check if tables exist
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        
        # Check if users table exists and has data
        users_count = 0
        roles_count = 0
        try:
            users_count = db.query(User).count()
        except Exception as e:
            users_count = f"Error: {str(e)}"
        
        try:
            roles_count = db.query(Role).count()
        except Exception as e:
            roles_count = f"Error: {str(e)}"
        
        return {
            "tables": tables,
            "users_count": users_count,
            "roles_count": roles_count,
            "database_url": str(db.bind.url).replace(db.bind.url.password or "", "***") if db.bind.url.password else str(db.bind.url)
        }
    except Exception as e:
        return {"error": str(e)}


def init_roles(db: Session = Depends(get_db)):
    """Initialize default roles if they don't exist"""
    # Check if any roles exist
    existing_roles = db.query(Role).count()
    if existing_roles > 0:
        return {"message": "Roles already exist", "count": existing_roles}
    
    # Create default roles
    roles = [
        Role(name="admin"),
        Role(name="editor"),
        Role(name="viewer")
    ]
    
    for role in roles:
        db.add(role)
    
    db.commit()
    
    return {"message": "Default roles created successfully", "roles": [r.name for r in roles]}


@router.get("/list-roles")
def list_roles(db: Session = Depends(get_db)):
    """List all roles and their IDs"""
    roles = db.query(Role).all()
    return [{"id": role.id, "name": role.name} for role in roles]


class UpdateUserRoleRequest(BaseModel):
    email: str
    role_name: str


@router.post("/update-user-role")
def update_user_role(request: UpdateUserRoleRequest, db: Session = Depends(get_db)):
    """Update a user's role"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    role = db.query(Role).filter(Role.name == request.role_name).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    user.role_id = role.id
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": f"User {user.email} role updated to {role.name}"}


@router.post("/create-admin")
def create_admin_user(request: CreateAdminRequest, db: Session = Depends(get_db)):
    """Create the first admin user if no users exist"""
    # Check if any users exist
    existing_users = db.query(User).count()
    if existing_users > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Create admin role if it doesn't exist
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        admin_role = Role(name="admin")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)
    
    # Create admin user
    password_hash = pwd_context.hash(request.password)
    admin_user = User(
        email=request.email,
        password_hash=password_hash,
        role_id=admin_role.id,
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return {"message": "Admin user created successfully", "user_id": admin_user.id}


@router.post("/login-cookie")
def login_cookie(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Sai thông tin đăng nhập"
        )
    token = create_access_token({"sub": str(user.id)})
    from fastapi import Response

    resp = Response(content="ok", media_type="text/plain")
    cookie_secure = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    resp.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=cookie_secure,
        samesite="lax",
        max_age=JWT_EXPIRE_MIN * 60,
        path="/",
    )
    return resp


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.email.split("@")[0],  # Use email prefix as name
        "is_active": current_user.is_active,
        "role": {
            "id": current_user.role.id if current_user.role else None,
            "name": current_user.role.name if current_user.role else "unknown"
        }
    }


@router.post("/logout")
def logout():
    from fastapi import Response

    resp = Response(content="ok", media_type="text/plain")
    resp.delete_cookie("token", path="/")
    return resp
