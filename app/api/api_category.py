from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional

from config import TEMPLATE_DIR
from utils.token_auth import verify_token, check_token_data
from database import get_db
from models import Category


router = APIRouter()


@router.get("/")
async def get_owner_restaurants(
    db: Session = Depends(get_db),
):
    stmt = select(Category).order_by(Category.name)
    results = db.execute(stmt).scalars().all()
    return results

