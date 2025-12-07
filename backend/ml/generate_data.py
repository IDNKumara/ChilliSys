import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_data():
    # Setup dates
    start_date = datetime(2025, 1, 1)
    today = datetime.now()
    last_week = today - timedelta(days=7)
    
    data_rows = []
    
    current_date = start_date
    prev_price = 500.0 # Starting price assumption
    
    while current_date <= today:
        # Determine if we are in the "historical" (stable) phase or "recent" (random/volatile) phase
        is_recent = current_date > last_week
        
        day_of_year = current_date.timetuple().tm_yday
        
        # Base logic similar to original train_model.py but iterative
        # supply: more supply in middle of year? random for now but smoother
        # trend: let's add some seasonality
        
        if is_recent:
            # "generate few random data" - higher variance
            supply_kg = np.random.uniform(100, 5000)
            demand_index = np.random.uniform(0.5, 2.5) # Wider range
            noise = np.random.normal(0, 50) # Higher noise
        else:
            # Historical - smoother
            supply_kg = np.random.uniform(200, 4000)
            demand_index = np.random.uniform(0.8, 1.5)
            noise = np.random.normal(0, 15)
            
        # Price calculation
        # price = prev_price * 0.8 + demand * 100 - supply * 0.05 + noise
        # This formula relies heavily on prev_price.
        # We need to ensure we have a 'prev_price' for the features.
        
        # In the training data, 'prev_price' is a feature. 
        # For a time series, the 'prev_price' of today is the 'price' of yesterday.
        
        price = prev_price * 0.8 + demand_index * 100 - supply_kg * 0.05 + noise
        price = max(100, price) # Clip lower
        
        data_rows.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'day_of_year': day_of_year,
            'supply_kg': round(supply_kg, 2),
            'demand_index': round(demand_index, 2),
            'prev_price': round(prev_price, 2),
            'price': round(price, 2)
        })
        
        # Update prev_price for next day
        prev_price = price
        current_date += timedelta(days=1)

    df = pd.DataFrame(data_rows)
    
    # Save to CSV
    output_dir = 'backend/ml/data'
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'chilli_price_history.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows of data from {start_date.date()} to {today.date()}")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    generate_data()
