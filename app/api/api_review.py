from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional

from utils.token_auth import verify_token, check_token_data
from database import get_db
from models import User, Restaurant, Review, RoleEnum, Report
from schemas import ReviewUpdate, ReportCreate

router = APIRouter()

@router.get("/{review_id}")
async def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    # token_data: dict = Depends(verify_token)
):
    # user_id, username, role = check_token_data(token_data, [RoleEnum.owner, RoleEnum.user])
    # if user_id is None:
    #     raise HTTPException(status_code=403, detail="Forbidden")

    db_review = db.query(Review).filter(
        Review.review_id == review_id,
    ).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review


# Protected Route
@router.put("/{review_id}")
async def update_review(
    review_id: int,
    review: ReviewUpdate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.owner, RoleEnum.user])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_review = db.query(Review).filter(
        Review.review_id == review_id,
        Review.user_id == user_id,
    ).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found or unauthorized")
    db_review.rating = review.rating
    db_review.comment = review.comment
    db.commit()
    db.refresh(db_review)

    return db_review  # For testing purposes
    # return {"detail": "Review updated successfully"}


# Protected Route
@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.admin, RoleEnum.owner, RoleEnum.user])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_review = db.query(Review).filter(
        Review.review_id == review_id,
        Review.user_id == user_id,
    ).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found or unauthorized")
    db.delete(db_review)
    db.commit()

    return {"detail": "Review deleted successfully"}


@router.get("/{review_id}/reports")
async def get_report_review(
    review_id: int,
    db: Session = Depends(get_db),
    # token_data: dict = Depends(verify_token)
):
    stmt = select(Report).filter(
        Report.review_id == review_id
    ).order_by(Report.create_at.desc()
    )
    reports = db.execute(stmt).scalars().all()
    if not reports:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return reports

# Protected Route
@router.post("/{review_id}/reports")
async def create_report_review(
    review_id: int,
    report: ReportCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.admin, RoleEnum.owner, RoleEnum.user])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_report = Report(
        user_id=user_id,
        review_id=review_id,
        report_reason=report.report_reason
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report  # For testing purposes
    # return {"detail": "Report created successfully"}