from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database, auth
from typing import Dict

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    stats = {
        "inventory_count": 0,
        "active_orders": 0,
        "market_price": 0.0
    }

    # 1. Inventory Count
    if current_user.role == models.UserRole.SUPPLIER:
        # Count only supplier's items
        stats["inventory_count"] = db.query(models.Inventory).filter(
            models.Inventory.supplier_id == current_user.id
        ).count()
    else:
        # Buyers/Admin see total market inventory
        stats["inventory_count"] = db.query(models.Inventory).count()

    # 2. Active Orders
    if current_user.role == models.UserRole.SUPPLIER:
        # Orders received by supplier
        stats["active_orders"] = db.query(models.Transaction).filter(
            models.Transaction.supplier_id == current_user.id,
            models.Transaction.status == "pending"
        ).count()
    elif current_user.role == models.UserRole.BUYER:
        # Orders placed by buyer
        stats["active_orders"] = db.query(models.Transaction).filter(
            models.Transaction.buyer_id == current_user.id,
            models.Transaction.status == "pending"
        ).count()
    else:
        # Admin sees all pending orders
        stats["active_orders"] = db.query(models.Transaction).filter(
            models.Transaction.status == "pending"
        ).count()

    # 3. Market Price (Avg of last 7 days or most recent)
    # Get the most recent date in price data
    latest_date_query = db.query(func.max(models.PriceData.date)).filter(models.PriceData.is_predicted == False).scalar()
    
    if latest_date_query:
        # Get average price for that date
        avg_price = db.query(func.avg(models.PriceData.price)).filter(
            models.PriceData.date == latest_date_query,
            models.PriceData.is_predicted == False
        ).scalar()
        stats["market_price"] = round(avg_price, 2) if avg_price else 0.0
    else:
        # Fallback if no data
        stats["market_price"] = 0.0

    return stats
