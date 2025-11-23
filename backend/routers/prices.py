from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import models, database
from pydantic import BaseModel
from typing import List
import random

router = APIRouter(
    prefix="/prices",
    tags=["prices"],
)

class PricePoint(BaseModel):
    date: str
    price: float
    is_predicted: bool = False

    class Config:
        from_attributes = True

@router.get("/history", response_model=List[PricePoint])
def get_price_history(db: Session = Depends(database.get_db), days: int = 30):
    """Get historical price data. If no data exists, generate mock data."""
    
    # Try to fetch real data
    historical_data = db.query(models.PriceData).filter(
        models.PriceData.is_predicted == False
    ).order_by(models.PriceData.date.desc()).limit(days).all()
    
    if historical_data and len(historical_data) > 0:
        # Return real data
        return [
            {
                "date": item.date.strftime("%Y-%m-%d"),
                "price": item.price,
                "is_predicted": item.is_predicted
            }
            for item in reversed(historical_data)
        ]
    
    # Generate mock historical data if none exists
    mock_data = []
    base_price = 400
    end_date = datetime.now()
    
    for i in range(days):
        date = end_date - timedelta(days=days - i - 1)
        # Generate realistic price variation
        variation = random.uniform(-30, 30)
        trend = i * 0.5  # Slight upward trend
        price = base_price + variation + trend
        
        mock_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "price": round(price, 2),
            "is_predicted": False
        })
    
    return mock_data
