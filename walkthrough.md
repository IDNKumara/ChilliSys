# Chilli Management System - Walkthrough

I have implemented the Chilli Management System as requested.

## Features Implemented

### 1. Backend (FastAPI + SQLite)
- **Authentication**: JWT-based login and registration.
- **Role-Based Access**: Admin, Supplier, Buyer roles.
- **Inventory Management**: CRUD operations for chilli stocks.
- **Order Management**: Full lifecycle (Place -> Accept -> Complete).
- **Messaging**: Internal messaging system.
- **Price Prediction**: Machine Learning model (Random Forest).
- **API Documentation**: Available at `http://localhost:8000/docs`.

### 2. Frontend (Next.js + Tailwind CSS)
- **Login/Register**: User authentication pages.
- **Dashboard**: Role-based dashboard showing stats.
- **Inventory Page**: Suppliers can add/delete items, Buyers can buy.
- **Orders Page**: Track and manage orders.
- **Messages Page**: Chat with other users.
- **Users Page**: Admin user management.

### 3. Machine Learning
- **Model**: Random Forest Regressor trained on mock data.
- **Prediction API**: Endpoint `/predict` to forecast prices.

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

### 1. Inventory Management
- **Supplier**: Log in, go to Inventory, Add Item, Delete Item.
- **Buyer**: Log in, go to Inventory, Click "Buy".

### 2. Order Management
- **Buyer**: Place an order. Go to Orders to see "Pending" status.
- **Supplier**: Go to Orders. Click "Accept" (Confirmed) -> "Complete".

### 3. Messaging
- **Any User**: Go to Messages. Select a user. Send a message.

### 4. Admin Features
- **Admin**: Log in. Go to Users. View list. Delete a user.
