import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Generate mock data
np.random.seed(42)
n_samples = 1000

data = {
    'day_of_year': np.random.randint(1, 366, n_samples),
    'supply_kg': np.random.uniform(100, 5000, n_samples),
    'demand_index': np.random.uniform(0.5, 2.0, n_samples),
    'prev_price': np.random.uniform(200, 1000, n_samples),
}

df = pd.DataFrame(data)

# Price formula (mock): Base + Demand * Factor - Supply * Factor + Noise
df['price'] = df['prev_price'] * 0.8 + df['demand_index'] * 100 - df['supply_kg'] * 0.05 + np.random.normal(0, 20, n_samples)
df['price'] = df['price'].clip(lower=100) # Minimum price

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
