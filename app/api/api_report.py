from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional


from config import TEMPLATE_DIR
from utils.token_auth import verify_token, check_token_data
from database import get_db
from models import User, RoleEnum, Report
from schemas import ReportUpdate


router = APIRouter()


# For Admins only


# Protected Route
@router.get("/{report_id}")
async def get_report_review(
    report_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.admin])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_report = db.query(Report).filter(
        Report.report_id == report_id,
    ).first()

    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found or unauthorized")
    return db_report
    

# Protected Route
@router.put("/{report_id}")
async def update_report_review(
    report_id: int,
    report: ReportUpdate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(verify_token)
):
    user_id, username, role = check_token_data(token_data, [RoleEnum.admin])
    if user_id is None:
        raise HTTPException(status_code=403, detail="Forbidden")

    db_report = db.query(Report).filter(
        Report.report_id == report_id,
    ).first()

    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found or unauthorized")
    
    db_report.report_status = report.report_status
    db.commit()
    db.refresh(db_report)
    return {"detail": "Report updated successfully"}