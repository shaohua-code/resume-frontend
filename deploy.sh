#!/bin/bash
set -euo pipefail
LOG_FILE="/www/wwwroot/deploy_log.txt"
exec >> $LOG_FILE 2>&1

echo "===== 部署开始 $(date) ====="
PROJECT_PATH="/www/wwwroot/120.25.234.199"

# 新增：解决git dubious ownership 报错
git config --global --add safe.directory "$PROJECT_PATH"

# 目录校验
if [ ! -d "$PROJECT_PATH" ]; then
    echo "错误：目录不存在 $PROJECT_PATH"
    exit 1
fi
cd "$PROJECT_PATH"
echo "当前工作目录：$(pwd)"

# 清理git残留锁（解决上次中断导致卡住）
if [ -f .git/index.lock ]; then
    echo "发现git锁文件，清理..."
    rm -f .git/index.lock
fi

# 非交互式拉取，关闭git分页输出避免阻塞
export GIT_PAGER=cat
echo "执行 git pull origin main --ff-only"
git pull --no-progress origin main --ff-only

echo "执行 npm install"
npm install

echo "执行 npm run build"
npm run build

echo "===== 部署完成 $(date) ====="