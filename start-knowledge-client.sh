#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/smarphin-knowledge-backend"
FRONTEND_DIR="$SCRIPT_DIR/smarphin-knowledge-web"
BACKEND_PORT=""
FRONTEND_PORT=""
BACKEND_PID=""
FRONTEND_PID=""

log() {
  printf '[知序 Client] %s\n' "$1"
}

fail() {
  printf '[知序 Client] 启动失败：%s\n' "$1" >&2
  exit 1
}

read_env_value() {
  local key="$1"
  local file="$2"
  awk -F= -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "$file"
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
[[ -x "$BACKEND_DIR/.venv/bin/uvicorn" ]] || fail "缺少后端虚拟环境，请先在后端目录安装 requirements.txt"
[[ -x "$FRONTEND_DIR/node_modules/.bin/next" ]] || fail "缺少前端依赖，请先在前端目录执行 npm install"
[[ -x "$FRONTEND_DIR/node_modules/.bin/velite" ]] || fail "前端依赖中缺少 Velite，请重新执行 npm install"

BACKEND_PORT="$(read_env_value APP_PORT "$BACKEND_DIR/.env")"
FRONTEND_PORT="$(read_env_value PORT "$FRONTEND_DIR/.env")"
[[ "$BACKEND_PORT" == "19093" ]] || fail "后端 APP_PORT 必须固定为 19093"
[[ "$FRONTEND_PORT" == "19092" ]] || fail "前端 PORT 必须固定为 19092"

log "正在生成客户端内容索引…"
(cd "$FRONTEND_DIR" && node_modules/.bin/velite build)

log "启动 Public API：http://localhost:$BACKEND_PORT"
(
  cd "$BACKEND_DIR"
  exec .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

log "启动 Client Web：http://localhost:$FRONTEND_PORT"
(
  cd "$FRONTEND_DIR"
  exec node_modules/.bin/next dev --hostname 0.0.0.0 --port "$FRONTEND_PORT"
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
