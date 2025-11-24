# ChilliSys - Smart Chilli Management & Price Prediction System

## Overview
ChilliSys is a comprehensive management platform designed to bridge the gap between chilli farmers (suppliers) and buyers. It integrates advanced AI-powered price prediction to help stakeholders make informed decisions about buying and selling, alongside inventory management features.

## Key Features
- **AI Price Prediction:** 7-day price forecast using machine learning based on supply, demand, and historical trends.
- **Inventory Management:** Suppliers can list their stock, and buyers can browse available produce.
- **Role-Based Access:** Tailored dashboards and features for Suppliers and Buyers.
- **Interactive Charts:** Visual analysis of price trends and predictions.

## User Roles & Capabilities

### 1. Supplier (Farmers/Distributors)
Suppliers are the backbone of the system, providing the produce.
*   **Manage Inventory:** Exclusive ability to add new chili stocks (Type, Quantity, Price) to the marketplace.
*   **Price Intelligence:** Use the prediction tool to decide the best time to sell for maximum profit.
*   **Dashboard:** View personal inventory and system insights.

### 2. Buyer (Retailers/Shops)
Buyers use the system to source produce and plan purchases.
*   **Marketplace Access:** Browse real-time inventory listed by various suppliers.
*   **Price Intelligence:** Use the prediction tool to anticipate price drops and plan bulk purchases.
*   **Dashboard:** Track market trends and available stock.

## Technology Stack
*   **Frontend:** Next.js (React), Tailwind CSS, Recharts
*   **Backend:** FastAPI (Python), SQLAlchemy
*   **Database:** SQLite
*   **Machine Learning:** Scikit-learn (Random Forest Regressor)

## Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.8+

### One-Click Setup (Windows)
The easiest way to get started is using the automated setup script.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/IDNKumara/ChilliSys.git
    cd ChilliSys
    ```

2.  **Run the Setup Script**
    Double-click `setup_and_run.bat` or run it from the terminal:
    ```powershell
    .\setup_and_run.bat
    ```
    This will automatically:
    *   Set up the Python backend (virtual environment, dependencies)
    *   Install Node.js frontend dependencies
    *   Start both the backend (port 8000) and frontend (port 3000) servers

---

### Manual Installation

If you prefer to set up manually:

1.  **Backend Setup**
    ```bash
    cd backend
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Next.js Startup Error (Windows)
If you encounter an error like `Attempted to load @next/swc-win32-x64-msvc, but an error occurred: ... is not a valid Win32 application`, it indicates a corrupted installation or cache issue. Follow these steps to fix it:

1.  **Navigate to the frontend directory:**
    ```powershell
    cd frontend
    ```

2.  **Clean the environment:**
    Remove existing node modules and cache.
    ```powershell
    rm -Recurse -Force node_modules, .next, package-lock.json
    npm cache clean --force
    ```

3.  **Reinstall dependencies:**
    ```powershell
    npm install
    ```

4.  **Restart the server:**
    ```powershell
    npm run dev
    ```

## Project Structure
*   `/backend`: API, Database models, and ML prediction logic.
*   `/frontend`: Next.js web application and UI components.
*   `/backend/ml_models`: Trained machine learning models.
