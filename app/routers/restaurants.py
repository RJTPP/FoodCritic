from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, RedirectResponse

from config import TEMPLATE_DIR

router = APIRouter()
templates = Jinja2Templates(directory=TEMPLATE_DIR)

@router.get("/")
async def explore(request: Request):
    return templates.TemplateResponse("restaurants.html", {"request": request, "title": "Restaurants"})

@router.get("/{id}")
async def explore(request: Request):
    return templates.TemplateResponse("restaurantDetails.html", {"request": request, "title": "Restaurants"})