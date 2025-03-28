from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, RedirectResponse

from config import TEMPLATE_DIR
from utils.token_auth import verify_token_allow_none, check_token_data
from models import RoleEnum
import routers
import api

app = FastAPI()
templates = Jinja2Templates(directory=TEMPLATE_DIR)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register HTML routers
app.include_router(routers.router)

# Register API routers
app.include_router(api.router, prefix="/api")


@app.get("/")
async def index(request: Request):
    return RedirectResponse(url="/home")


@app.get("/home")
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request, "title": "Home"})


@app.get("/about")
async def about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request, "title": "About"})

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    return templates.TemplateResponse("404.html", { "request": request, "title": "404 - Not Found"})
