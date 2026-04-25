#!/bin/bash

echo "=== PoliSwipe Startup ==="

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded .env"
else
  echo "Warning: No .env file found -- backend AI features will fail"
fi

# Kill any existing Expo and backend processes
echo "Cleaning up old processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "uvicorn backend" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Clear Expo cache
echo "Clearing Expo cache..."
rm -rf .expo

# Start backend
echo "Starting backend on :8000..."
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 2

# Check backend health
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "Backend is healthy"
else
  echo "Warning: Backend may not have started correctly"
fi

# Start Expo
echo "Starting Expo on :8081..."
npx expo start --clear &
EXPO_PID=$!

echo ""
echo "=== Running ==="
echo "Expo:    http://localhost:8081  (PID $EXPO_PID)"
echo "Backend: http://localhost:8000  (PID $BACKEND_PID)"
echo ""
echo "Scan the QR code with Expo Go on your iPhone."
echo "Press Ctrl+C to stop everything."

# Trap Ctrl+C to kill both
trap "echo 'Shutting down...'; kill $BACKEND_PID $EXPO_PID 2>/dev/null; exit" INT TERM
wait
