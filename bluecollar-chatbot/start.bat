@echo off
title Sahayak — BlueCollar AI v2
color 0A

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║     Sahayak — BlueCollar AI Platform v2.0       ║
echo  ╚══════════════════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

echo [1/3] Activating virtual environment...
call venv\Scripts\activate.bat

echo [2/3] Starting server...
echo.
echo  URL:      http://localhost:8000
echo  Login:    http://localhost:8000/login.html
echo  API Docs: http://localhost:8000/docs
echo  Creds:    admin / sahayak2024
echo.

echo [3/3] Opening browser...
start http://localhost:8000/login.html

python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

pause
