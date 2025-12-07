import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Load data from CSV
data_path = os.path.join(os.path.dirname(__file__), 'data', 'chilli_price_history.csv')
if not os.path.exists(data_path):
    raise FileNotFoundError(f"Data file not found at {data_path}. Please run generate_data.py first.")

df = pd.read_csv(data_path)

X = df[['day_of_year', 'supply_kg', 'demand_index', 'prev_price']]
y = df['price']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print(f"Model Score: {model.score(X_test, y_test)}")

# Save model
os.makedirs('../ml_models', exist_ok=True)
joblib.dump(model, '../ml_models/price_predictor.joblib')
print("Model saved to ../ml_models/price_predictor.joblib")
