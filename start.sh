#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=8000
FRONTEND_PORT=5173

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    UVICORN=".venv/Scripts/uvicorn"
    OS="windows"
    ;;
  *)
    UVICORN=".venv/bin/uvicorn"
    OS="unix"
    ;;
esac

kill_port() {
  local port=$1
  if [ "$OS" = "windows" ]; then
    python -c "
import subprocess, sys
r = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
for line in r.stdout.splitlines():
  if ':$port' in line and 'LISTENING' in line:
    pid = line.strip().split()[-1]
    subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
" 2>/dev/null || true
  else
    pid=$(lsof -ti:"$port" 2>/dev/null) && kill "$pid" 2>/dev/null || true
  fi
}

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  echo "Stopped."
}
trap cleanup EXIT INT TERM

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

echo "=== Starting Backend (FastAPI) ==="
cd "$SCRIPT_DIR"
$UVICORN backend.main:app --host 127.0.0.1 --port $BACKEND_PORT &
BACKEND_PID=$!
sleep 2

echo "=== Starting Frontend (Vite) ==="
cd "$SCRIPT_DIR/frontend"
pnpm vite --host 127.0.0.1 --port $FRONTEND_PORT
