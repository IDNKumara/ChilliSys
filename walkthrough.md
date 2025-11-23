# Chilli Management System - Walkthrough

I have implemented the Chilli Management System as requested.

## Features Implemented

### 1. Backend (FastAPI + SQLite)
- **Authentication**: JWT-based login and registration.
- **Role-Based Access**: Admin, Supplier, Buyer roles.
- **Inventory Management**: CRUD operations for chilli stocks.
- **Price Prediction**: Machine Learning model (Random Forest) to predict prices.
- **API Documentation**: Available at `http://localhost:8000/docs`.

### 2. Frontend (Next.js + Tailwind CSS)
- **Login/Register**: User authentication pages.
- **Dashboard**: Role-based dashboard showing stats.
- **Inventory Page**: Suppliers can add items, everyone can view.
- **UI Components**: Reusable components (Button, Input, Layout).

### 3. Machine Learning
- **Model**: Random Forest Regressor trained on mock data.
- **Prediction API**: Endpoint `/predict` to forecast prices based on supply/demand.

## How to Run

### Backend
1. Navigate to the root directory.
2. Activate virtual environment: `.\venv\Scripts\activate`
3. Run the server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

### Frontend
1. Navigate to `frontend` directory.
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Verification
- **Login**: Try registering a new user and logging in.
- **Inventory**: Go to Dashboard -> Inventory to see items.
- **API**: Visit `http://localhost:8000/docs` to test endpoints directly.
