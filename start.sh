#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# ---- 颜色输出 ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  $1"; }

# ---- 清理函数 ----
cleanup() {
  log_warn "收到退出信号，正在停止前端和后端..."
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  log_info "前端和后端已停止（Docker 容器继续运行）"
  exit 0
}

trap cleanup SIGINT SIGTERM

# ---- 1. 启动 Docker 服务 ----
log_step "检查 Docker 基础设施..."

if ! docker compose ps --format '{{.Names}}' 2>/dev/null | grep -q 'note-mark'; then
  log_info "启动 Docker 容器（MySQL + MongoDB + MinIO）..."
  docker compose up -d
else
  log_info "Docker 容器已在运行"
fi

# 等待 MySQL healthy（最长 30s）
log_info "等待 MySQL healthy..."
for i in $(seq 1 30); do
  if docker inspect note-mark-mysql --format '{{.State.Health.Status}}' 2>/dev/null | grep -q 'healthy'; then
    log_info "MySQL healthy ✓"
    break
  fi
  sleep 1
done

# ---- 2. 启动后端 (note-mark) ----
log_step "启动后端 NestJS (note-mark) → http://localhost:6090"

cd "$ROOT_DIR/note-mark"
if [ ! -d "node_modules" ]; then
  log_info "安装后端依赖..."
  pnpm install
fi

NODE_ENV=local pnpm start:dev &
BACKEND_PID=$!

# 等待后端就绪（最长 60s）
log_info "等待后端就绪..."
for i in $(seq 1 60); do
  if curl -s http://localhost:6090/ > /dev/null 2>&1; then
    log_info "后端就绪 ✓  → http://localhost:6090"
    break
  fi
  sleep 1
done

# ---- 3. 启动前端 (note-web) ----
log_step "启动前端 Vite (note-web) → http://localhost:5174"

cd "$ROOT_DIR/note-web"
if [ ! -d "node_modules" ]; then
  log_info "安装前端依赖..."
  pnpm install
fi

pnpm dev &
FRONTEND_PID=$!

# 等待前端就绪（最长 30s）
log_info "等待前端就绪..."
for i in $(seq 1 30); do
  if curl -s http://localhost:5174/ > /dev/null 2>&1; then
    log_info "前端就绪 ✓  → http://localhost:5174"
    break
  fi
  sleep 1
done

# ---- 4. 汇总 ----
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  项目已启动${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  前端页面:    ${CYAN}http://localhost:5174/#/red${NC}"
echo -e "  Swagger 文档: ${CYAN}http://localhost:6090/api-docs${NC}"
echo -e "  MinIO 面板:   ${CYAN}http://localhost:9001${NC}"
echo ""
echo -e "  按 ${YELLOW}Ctrl+C${NC} 停止前端和后端"
echo ""

wait
