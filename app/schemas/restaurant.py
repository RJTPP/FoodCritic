from pydantic import BaseModel, Field
from typing import Optional
from models.sql_models import ReportStatusEnum

class RestaurantCreate(BaseModel):
    name: str
    address: str
    category_id: int
    description: Optional[str] = None
    picture_url: Optional[str] = None

class RestaurantUpdate(BaseModel):
    name: str
    picture_url: Optional[str] = None
    address: str
    category_id: int
    description: Optional[str] = None

class ReviewCreate(BaseModel):
    # user_id: int
    # restaurant_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = None

class ReportCreate(BaseModel):
    report_reason: str = Field(..., description="Reason for reporting the review")

class ReportUpdate(BaseModel):
    report_status: Optional[ReportStatusEnum] = None