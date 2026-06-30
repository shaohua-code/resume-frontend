#!/bin/bash


echo "===== 部署开始 $(date) ====="
# 项目路径 ****重点
PROJECT_PATH="/www/wwwroot/120.25.234.199"

# 新增：解决git dubious ownership 报错
git config --global --add safe.directory "$PROJECT_PATH"




# 非交互式拉取，关闭git分页输出避免阻塞

echo "执行 git pull origin main --ff-only"
git pull --no-progress origin main --ff-only

echo "执行 npm install"
npm install

echo "执行 npm run build"
npm run build

echo "===== 部署完成 $(date) ====="