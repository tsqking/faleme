#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=8000
FRONTEND_PORT=5173

cleanup() {
  echo ""
  echo "正在关闭服务..."
  kill $BACKEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  echo "已停止"
}
trap cleanup EXIT INT TERM

kill_port() {
  local port=$1
  local pid
  pid=$(lsof -ti:"$port" 2>/dev/null) && kill "$pid" 2>/dev/null && echo "释放端口 $port" || true
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

echo "=== 启动后端 (FastAPI) ==="
cd "$SCRIPT_DIR"
.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port $BACKEND_PORT &
BACKEND_PID=$!
sleep 2

echo "=== 启动前端 (Vite) ==="
cd "$SCRIPT_DIR/frontend"
npx vite --host 127.0.0.1 --port $FRONTEND_PORT
