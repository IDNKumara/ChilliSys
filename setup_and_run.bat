@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo      ChilliSys Project Setup & Start
echo ==========================================

:: Store root dir
set "PROJECT_ROOT=%CD%"

:: --- Backend Setup ---
echo.
echo [1/2] Setting up Backend...
cd "%PROJECT_ROOT%\backend"

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b 1
)

:: Create venv if missing
if not exist "venv" (
    echo    - Creating virtual environment...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo Error: Failed to create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo    - Virtual environment found.
)

:: Activate venv and install deps
echo    - Installing/Updating dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install python dependencies.
    pause
    exit /b 1
)

:: Start Backend in new window
echo    - Starting Backend Server...
start "ChilliSys Backend" cmd /k "cd /d "%PROJECT_ROOT%" && backend\venv\Scripts\activate.bat && uvicorn backend.main:app --reload --port 8000"


:: --- Frontend Setup ---
echo.
echo [2/2] Setting up Frontend...
cd "%PROJECT_ROOT%\frontend"

:: Check for Node
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js/npm is not installed or not in PATH.
    pause
    exit /b 1
)

:: Install deps
if not exist "node_modules" (
    echo    - Installing node modules...
    call npm install
    if !errorlevel! neq 0 (
        echo Error: Failed to install node modules.
        pause
        exit /b 1
    )
) else (
    echo    - node_modules found. Skipping install.
)

:: Start Frontend
echo.
echo ==========================================
echo    Project is starting!
echo    Backend running on port 8000
echo    Frontend starting on port 3000...
echo ==========================================
echo.

npm run dev
pause
