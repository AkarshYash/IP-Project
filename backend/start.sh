#!/bin/bash
# Render.com startup script

echo "Starting Sahayak API Server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
