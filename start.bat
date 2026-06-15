@echo off
title Sahayak BlueCollar AI Platform
color 0A
echo.
echo ════════════════════════════════════════════════════════════════
echo   🚀 SAHAYAK — BlueCollar AI Platform v2.0
echo ════════════════════════════════════════════════════════════════
echo.
echo Starting backend server...
echo Backend will run at: http://localhost:8000
echo.
echo To stop the server, press Ctrl+C in this window
echo ════════════════════════════════════════════════════════════════
echo.

cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
