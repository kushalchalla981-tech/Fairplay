#!/bin/bash
# Start FastAPI backend and React frontend

echo "Starting Fairplay..."

# Start FastAPI
cd /home/kuro/Fairplay
.venv/bin/uvicorn api:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend running at http://localhost:8000 (PID $BACKEND_PID)"

# Start React dev server
cd /home/kuro/Fairplay/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend running at http://localhost:5173 (PID $FRONTEND_PID)"

echo ""
echo "Open http://localhost:5173"
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
