#!/bin/bash
set -euo pipefail
LOG_FILE="/www/wwwroot/deploy_log.txt"
exec >> $LOG_FILE 2>&1

echo "===== 部署开始 $(date) ====="
PROJECT_PATH="/www/wwwroot/120.25.234.199"

# 强制切换项目目录，失败直接退出
cd "$PROJECT_PATH" || exit 1

# 解决git目录权限警告
git config --global --add safe.directory "$PROJECT_PATH"
# 清理git锁
[ -f .git/index.lock ] && rm -f .git/index.lock

# 核心三步
git pull --no-progress origin main --ff-only
npm install
npm run build

echo "===== 部署完成 $(date) ====="