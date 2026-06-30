#!/bin/bash
set -euo pipefail
LOG_FILE="/www/wwwroot/deploy_log.txt"
exec >> $LOG_FILE 2>&1

echo "===== 部署开始 $(date) ====="
PROJECT_PATH="/www/wwwroot/120.25.234.199"

# 1. 强制进入项目目录，失败直接退出
cd "$PROJECT_PATH" || {
    echo "致命错误：无法进入项目目录 $PROJECT_PATH"
    exit 1
}
echo "当前执行目录：$(pwd)"

# 解决git可疑目录权限报错
git config --global --add safe.directory "$PROJECT_PATH"

# 清理git锁文件
if [ -f .git/index.lock ]; then
    echo "发现git锁文件，清理..."
    rm -f .git/index.lock
fi

# 校验是否为git仓库
if [ ! -d .git ]; then
    echo "致命错误：当前目录不是git仓库"
    exit 1
fi

# 非交互式拉取代码
export GIT_PAGER=cat
echo "执行 git pull origin main --ff-only"
git pull --no-progress origin main --ff-only

# 校验package.json存在
if [ ! -f package.json ]; then
    echo "致命错误：目录缺少package.json"
    exit 1
fi

echo "执行 npm install"
npm install

echo "执行 npm run build"
npm run build

echo "===== 部署完成 $(date) ====="