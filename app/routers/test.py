from fastapi import FastAPI, Request, HTTPException, APIRouter, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, RedirectResponse

from datetime import timedelta

from config import TEMPLATE_DIR
import database
from utils import token_auth

router = APIRouter()
templates = Jinja2Templates(directory=TEMPLATE_DIR)

@router.get("/db")
async def explore(request: Request):
    return {"db_connection": database.test_db_connection(raise_exception=True)}

@router.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    fake_users_db = {"test": {"username": "test", "password": "1234"}}
    user = fake_users_db.get(form_data.username)
    if not user or form_data.password != "1234":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = token_auth.create_access_token({"sub": user["username"]}, timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/api/verify")
async def verify(token_data: dict = Depends(token_auth.verify_token)):
    return {"status": "valid", "user": token_data}


@router.get("/api/verify/{token}")
async def verify(token: str):
    token_data = token_auth.verify_token(token)
    return {"status": "valid", "user": token_data}

@router.get("/signin")
async def signin(request: Request):
    return templates.TemplateResponse("signin.html", {"request": request, "title": "Sign In"})