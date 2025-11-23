from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

router = APIRouter(
    prefix="/predict",
    tags=["predict"],
)

class PredictionRequest(BaseModel):
    day_of_year: int
    supply_kg: float
    demand_index: float
    prev_price: float

class PredictionResponse(BaseModel):
    predicted_price: float

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml_models", "price_predictor.joblib")
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@router.post("/", response_model=PredictionResponse)
def predict_price(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    input_data = pd.DataFrame([request.dict()])
    prediction = model.predict(input_data)[0]
    return {"predicted_price": prediction}

class ForecastRequest(BaseModel):
    day_of_year: int
    supply_kg: float
    demand_index: float
    prev_price: float
    days: int = 7

class ForecastPoint(BaseModel):
    day: int
    predicted_price: float

class ForecastResponse(BaseModel):
    forecast: list[ForecastPoint]

@router.post("/forecast", response_model=ForecastResponse)
def forecast_prices(request: ForecastRequest):
    """Generate multi-day price forecast"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    forecast = []
    current_price = request.prev_price
    current_day = request.day_of_year
    
    for i in range(request.days):
        # Prepare input for prediction
        input_data = pd.DataFrame([{
            'day_of_year': (current_day + i) % 365 + 1,  # Wrap around at 365
            'supply_kg': request.supply_kg,
            'demand_index': request.demand_index,
            'prev_price': current_price
        }])
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        
        forecast.append({
            'day': i + 1,
            'predicted_price': float(prediction)
        })
        
        # Use this prediction as the previous price for next day
        current_price = prediction
    
    return {"forecast": forecast}

