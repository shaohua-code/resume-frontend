#!/bin/bash
set -euo pipefail

PROJECT_PATH="/www/wwwroot/120.25.234.199"
cd "$PROJECT_PATH" || exit 1

LOG_FILE="/www/wwwroot/deploy_log.txt"
exec >> $LOG_FILE 2>&1

echo "===== 部署开始 $(date) ====="
echo "当前工作目录：$(pwd)"

git config --global --add safe.directory "$PROJECT_PATH"
[ -f .git/index.lock ] && rm -f .git/index.lock

# 新增：自动暂存本地变更，防止pull冲突
echo "储藏本地临时修改..."
git stash push -m "auto stash before deploy"

export GIT_PAGER=cat
echo "执行 git pull origin main --ff-only"
git pull --no-progress origin main --ff-only

# 拉完恢复本地修改（可选，不需要就注释这行）
# git stash pop

echo "执行 npm install"
npm install

echo "执行 npm run build"
npm run build

echo "===== 部署完成 $(date) ====="