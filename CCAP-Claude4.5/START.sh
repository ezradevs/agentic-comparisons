#!/bin/bash

echo "╔═══════════════════════════════════════════╗"
echo "║   Chess Club Administrator Portal         ║"
echo "║   Starting Application...                 ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "Starting backend server on http://localhost:3001..."
cd backend && npm run dev &
BACKEND_PID=$!

sleep 5

echo "Starting frontend on http://localhost:3000..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║   Application Started Successfully!       ║"
echo "║                                           ║"
echo "║   Frontend: http://localhost:3000         ║"
echo "║   Backend:  http://localhost:3001         ║"
echo "║                                           ║"
echo "║   Default Login:                          ║"
echo "║   Username: admin                         ║"
echo "║   Password: admin123                      ║"
echo "║                                           ║"
echo "║   Press Ctrl+C to stop both servers       ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Function to handle Ctrl+C
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

trap cleanup INT

# Wait for both processes
wait
