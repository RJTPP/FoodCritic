from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import Optional

from config import TEMPLATE_DIR
from utils.token_auth import verify_token, check_token_data
from database import get_db
from models import User, Restaurant, Review, RoleEnum, Category
from schemas import RestaurantCreate, RestaurantUpdate, ReviewCreate, ReviewUpdate


router = APIRouter()


@router.get("/")
async def get_owner_restaurants(
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token),
    search: Optional[str] = Query(None, description="Search term for restaurant name"),
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.owner])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    stmt = select(
        Restaurant.restaurant_id,
        Restaurant.name,
        Restaurant.description,
        Restaurant.category_id,
        Restaurant.picture_url,
        Restaurant.average_rating
    ).where(Restaurant.owner_id == user_id).order_by(Restaurant.average_rating.desc())

    if search:
        stmt = stmt.where(Restaurant.name.ilike(f"%{search}%"))

    stmt = stmt.add_columns(select(func.count(Review.review_id)).where(Review.restaurant_id == Restaurant.restaurant_id).scalar_subquery().label("review_count"))
    stmt = stmt.add_columns(select(Category.name).where(Category.category_id == Restaurant.category_id).scalar_subquery().label("category"))


    results = db.execute(stmt).mappings().all()
    return results


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db), user_data: dict = Depends(verify_token)):
    user_id, username, role = check_token_data(user_data, [RoleEnum.owner])

    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    owner_id = user_id

    
    new_restaurant = Restaurant(
        name=restaurant.name,
        address=restaurant.address,
        category_id=restaurant.category_id,
        description=restaurant.description,
        owner_id=owner_id,
        picture_url=restaurant.picture_url  # Ensure your RestaurantCreate schema includes picture_url.
    )
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant


@router.get("/{restaurant_id}")
async def get_owner_restaurant_details(restaurant_id: int, db: Session = Depends(get_db), user_data: dict = Depends(verify_token)):
    user_id, username, role = check_token_data(user_data, [RoleEnum.owner])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    restaurant = db.query(Restaurant).filter(Restaurant.restaurant_id == restaurant_id, Restaurant.owner_id == user_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return {
        "restaurant_id": restaurant.restaurant_id,
        "name": restaurant.name,
        "address": restaurant.address,
        "category_id": restaurant.category_id,
        "description": restaurant.description,
        "picture_url": restaurant.picture_url,
        "owner_id": restaurant.owner_id,
    }


@router.put("/{restaurant_id}")
async def update_restaurant(restaurant_id: int, restaurant: RestaurantUpdate, db: Session = Depends(get_db), user_data: dict = Depends(verify_token)):
    user_id, username, role = check_token_data(user_data, [RoleEnum.owner])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_restaurant = db.query(Restaurant).filter(Restaurant.restaurant_id == restaurant_id, Restaurant.owner_id == user_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db_restaurant.name = restaurant.name
    db_restaurant.address = restaurant.address
    db_restaurant.category_id = restaurant.category_id
    db_restaurant.description = restaurant.description
    db_restaurant.picture_url = restaurant.picture_url

    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db), user_data: dict = Depends(verify_token)):
    user_id, username, role = check_token_data(user_data, [RoleEnum.owner])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_restaurant = db.query(Restaurant).filter(Restaurant.restaurant_id == restaurant_id, Restaurant.owner_id == user_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db.delete(db_restaurant)
    db.commit()
    return {"detail": "Restaurant deleted successfully"}