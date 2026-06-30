#!/bin/bash
# 前端极简部署脚本 适配非root用户admin
PROJECT_DIR="/var/www/resume-frontend"
NGINX_HTML_DIR="/usr/share/nginx/html"
GIT_BRANCH="master"
YARN_CACHE_DIR="/usr/local/share/.cache/yarn"

# 清理yarn缓存
clean_yarn(){
    pkill -f yarn >/dev/null 2>&1 || true
    [ -d "$YARN_CACHE_DIR" ] && rm -rf "$YARN_CACHE_DIR"
    mkdir -p "$(dirname $YARN_CACHE_DIR)"
    yarn config set registry https://registry.npmmirror.com >/dev/null 2>&1
}

# 主部署流程
clean_yarn
# 进入前端项目目录
cd "$PROJECT_DIR" || exit 1
# 解决git可疑目录报错
git config --global --add safe.directory "$PROJECT_DIR"
# 拉取代码
git reset --hard
git pull origin "$GIT_BRANCH"
# 清理锁文件
rm -f package-lock.json pnpm-lock.yaml yarn.lock
# 安装依赖打包
yarn install --force --network-timeout 100000
yarn run build

# 部署静态文件到nginx
rm -rf "$NGINX_HTML_DIR"/*
cp -r dist/* "$NGINX_HTML_DIR/"

# 非root无法修改nginx目录归属，注释chown，只重启nginx（需sudo免密）
sudo systemctl restart nginx >/dev/null 2>&1

echo "前端部署完成"