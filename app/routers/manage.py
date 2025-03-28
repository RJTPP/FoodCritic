from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, RedirectResponse

from config import TEMPLATE_DIR

router = APIRouter()
templates = Jinja2Templates(directory=TEMPLATE_DIR)

@router.get("/")
async def manage(request: Request):
    return templates.TemplateResponse("manage.html", {"request": request, "title": "Manage"})

@router.get("/create")
async def create(request: Request):
    return templates.TemplateResponse("create.html", {"request": request, "title": "Create"})

@router.get("/{id}")
async def manage(request: Request, id: str):
    return templates.TemplateResponse("manageDetails.html", {"request": request, "title": "Manage"})