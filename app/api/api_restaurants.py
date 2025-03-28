from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import Optional

from config import TEMPLATE_DIR
from utils.token_auth import verify_token, check_token_data
from database import get_db
from models import User, Restaurant, Review, RoleEnum, Category
from schemas import ReviewCreate


router = APIRouter()


@router.get("/")
async def get_restaurants(
    db: Session = Depends(get_db),
    # token_data: dict = Depends(verify_token),
    search: Optional[str] = Query(None, description="Search term for restaurant name"),
):
    # user_id, username, role = check_token_data(token_data, [RoleEnum.owner, RoleEnum.user])
    # if user_id is None:
    #     raise HTTPException(status_code=403, detail="Forbidden")

    stmt = select(
        Restaurant.restaurant_id,
        Restaurant.name,
        Restaurant.description,
        Restaurant.category_id,
        Restaurant.picture_url,
        Restaurant.average_rating
    ).order_by(Restaurant.average_rating.desc())

    if search:
        stmt = stmt.where(Restaurant.name.ilike(f"%{search}%"))

    stmt = stmt.add_columns(select(func.count(Review.review_id)).where(Review.restaurant_id == Restaurant.restaurant_id).scalar_subquery().label("review_count"))
    stmt = stmt.add_columns(select(Category.name).where(Category.category_id == Restaurant.category_id).scalar_subquery().label("category"))


    results = db.execute(stmt).mappings().all()
    return results


@router.get("/{restaurant_id}")
async def get_restaurant_details(
    restaurant_id: int, 
    db: Session = Depends(get_db),
    # token_data: dict = Depends(verify_token)
):
    # user_id, username, role = check_token_data(token_data, [RoleEnum.owner, RoleEnum.user])
    # if user_id is None:
    #     raise HTTPException(status_code=403, detail="Forbidden")

    restaurant = db.query(Restaurant).filter(Restaurant.restaurant_id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.get("/{restaurant_id}/reviews")
async def get_restaurant_reviews(
    restaurant_id: int, 
    db: Session = Depends(get_db),
    # token_data: dict = Depends(verify_token)
):
    # user_id, username, role = check_token_data(token_data, [RoleEnum.owner, RoleEnum.user])
    # if user_id is None:
    #     raise HTTPException(status_code=403, detail="Forbidden")

    reviews = (
        db.query(Review, User.username)
        .join(User, Review.user_id == User.user_id)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.create_at.desc())
        .all()
    )

    reviews = [
        {
            "username": username,
            "restaurant_id": restaurant_id,
            "review_id": review.review_id,
            "rating": review.rating,
            "comment": review.comment,
            "create_at": review.create_at,
        }
        for review, username in reviews
    ]
    
    return reviews


# Protected Route
@router.post("/{restaurant_id}/reviews", status_code=status.HTTP_201_CREATED)   
async def create_review(
    restaurant_id: int, 
    review: ReviewCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.owner, RoleEnum.user])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_restaurant = db.query(Restaurant).filter(Restaurant.restaurant_id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    new_review = Review(
        user_id=user_id,
        restaurant_id=restaurant_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review
