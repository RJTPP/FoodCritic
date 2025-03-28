from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, RedirectResponse
from passlib.context import CryptContext

from sqlalchemy.orm import Session

from datetime import timedelta
import asyncio
import random

from config import TEMPLATE_DIR, TOKEN_EXPIRE_MINUTES
from utils.token_auth import verify_token, check_token_data, create_access_token
from database import get_db
from models import User, RoleEnum
from schemas.user import UserCreate, UserLogin

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/signin")


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def sign_up(user: UserCreate, db: Session = Depends(get_db)):
    # Check if the username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash the user's password
    hashed_password = pwd_context.hash(user.password)
    
    # Create a new user instance
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        phone=user.phone,
        role=user.role
    )
    
    # Insert into DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Get new_user.user_id after commit
    
    # Generate access token using new_user.user_id
    access_token = create_access_token(str(new_user.user_id), new_user.username, new_user.role) 
    
    return  {"message": "User created successfully", "access_token": access_token, "token_type": "bearer"}


@router.post("/signin")
async def sign_in(user: UserLogin, db: Session = Depends(get_db)):
    sleep_time = random.uniform(0.75, 1.5)
    # Authenticate user
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        await asyncio.sleep(sleep_time)  # Delay for 1 second if password is incorrect
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not pwd_context.verify(user.password, db_user.password_hash):
        await asyncio.sleep(sleep_time)  # Delay for 1 second if password is incorrect
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Create a new JWT token
    access_token = create_access_token(str(db_user.user_id), db_user.username, db_user.role)

    return {"message": "Sign in successful", "access_token": access_token, "token_type": "bearer"}


@router.get("/verify")
async def verify(
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, None)
    db_user = db.query(User).filter(User.user_id == user_id, User.username == username, User.role == role).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": username, "role": role}


@router.get("/redirect")
async def default_redirect(
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    redirect_url = {
        RoleEnum.user: "/restaurants",
        RoleEnum.owner: "/manage",
        RoleEnum.admin: "/restaurants"
    }

    user_id, username, role = check_token_data(token_data, None)

    db_user = db.query(User).filter(User.user_id == user_id, User.username == username, User.role == role).first()
    if not db_user:
        return RedirectResponse("/logout", status_code=302)

    return RedirectResponse(redirect_url.get(role, "/logout"))