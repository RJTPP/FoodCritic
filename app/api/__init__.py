from fastapi import APIRouter
from api import (
    api_auth, 
    api_manage, 
    api_restaurants, 
    api_review, 
    api_report,
    api_category
)

router = APIRouter()

# TODO: Include all sub api routers

router.include_router(api_auth.router, prefix="/auth", tags=["API-Auth"])
router.include_router(api_manage.router, prefix="/manage", tags=["API-Manage"])
router.include_router(api_restaurants.router, prefix="/restaurants", tags=["API-Restaurant"])
router.include_router(api_review.router, prefix="/reviews", tags=["API-Review"])
router.include_router(api_report.router, prefix="/reports", tags=["API-Report"])
router.include_router(api_category.router, prefix="/categories", tags=["API-Category"])