from fastapi import APIRouter
from routers import (
    test,
    signin,
    signup,
    logout,
    restaurants,
    manage
)

router = APIRouter()

# For testing
router.include_router(test.router, prefix="/test", tags=["Testing"])

# Routers
router.include_router(signin.router, prefix="/signin", tags=["Page-Auth"])
router.include_router(signup.router, prefix="/signup", tags=["Page-Auth"])
router.include_router(logout.router, prefix="/logout", tags=["Page-Auth"])
router.include_router(restaurants.router, prefix="/restaurants", tags=["Page-Restaurants"])
router.include_router(manage.router, prefix="/manage", tags=["Page-Manage"])
