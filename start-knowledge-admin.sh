#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/smarphin-knowledge-admin-backend"
FRONTEND_DIR="$SCRIPT_DIR/smarphin-knowledge-admin-web"
BACKEND_PORT="19090"
FRONTEND_PORT="19091"
BACKEND_PID=""
FRONTEND_PID=""

log() {
  printf '[知序 Admin] %s\n' "$1"
}

fail() {
  printf '[知序 Admin] 启动失败：%s\n' "$1" >&2
  exit 1
}

cleanup() {
  trap - INT TERM EXIT
  log "正在停止前后端服务…"
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  log "服务已停止"
}

trap cleanup INT TERM EXIT

[[ -f "$BACKEND_DIR/.env" ]] || fail "缺少 $BACKEND_DIR/.env"
[[ -f "$FRONTEND_DIR/.env" ]] || fail "缺少 $FRONTEND_DIR/.env"
[[ -x "$BACKEND_DIR/.venv/bin/python" ]] || fail "缺少后端虚拟环境，请先在后端目录安装 requirements.txt"
[[ -x "$BACKEND_DIR/.venv/bin/alembic" ]] || fail "后端虚拟环境中未安装 Alembic"
[[ -x "$BACKEND_DIR/.venv/bin/uvicorn" ]] || fail "后端虚拟环境中未安装 Uvicorn"
[[ -d "$FRONTEND_DIR/node_modules" ]] || fail "缺少前端依赖，请先在前端目录执行 npm install"
command -v npm >/dev/null 2>&1 || fail "未找到 npm"

if [[ "${ADMIN_SKIP_MIGRATIONS:-0}" != "1" ]]; then
  log "正在检查并升级数据库结构…"
  (cd "$BACKEND_DIR" && .venv/bin/alembic upgrade head)
fi

log "启动 Admin API：http://localhost:$BACKEND_PORT"
(
  cd "$BACKEND_DIR"
  exec .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

log "启动 Admin Web：http://localhost:$FRONTEND_PORT"
(
  cd "$FRONTEND_DIR"
  exec npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

log "前后端已启动，按 Ctrl+C 一起停止"

while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    wait "$BACKEND_PID" 2>/dev/null || true
    break
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID" 2>/dev/null || true
    break
  fi
  sleep 1
done

fail "有一个服务意外退出，请检查上方日志"
