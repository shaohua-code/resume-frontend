#!/bin/bash
# 前端极简部署脚本，无日志文件、无后端残留代码
PROJECT_DIR="/var/www/resume-frontend"
NGINX_HTML_DIR="/usr/share/nginx/html"
GIT_BRANCH="master"
YARN_CACHE_DIR="/usr/local/share/.cache/yarn"

# 清理yarn缓存
clean_yarn(){
    pkill -f yarn >/dev/null 2>&1
    [ -d "$YARN_CACHE_DIR" ] && rm -rf "$YARN_CACHE_DIR"
    mkdir -p "$(dirname $YARN_CACHE_DIR)"
    chmod -R 775 "$(dirname $YARN_CACHE_DIR)"
    chown -R root:root "$(dirname $YARN_CACHE_DIR)"
    yarn config set registry https://registry.npm.taobao.org >/dev/null 2>&1
}

# 主流程
clean_yarn
cd $PROJECT_DIR || exit 1
# 解决git仓库权限报错
git config --global --add safe.directory "$PROJECT_DIR"
git reset --hard
git pull origin $GIT_BRANCH
rm -f package-lock.json pnpm-lock.yaml yarn.lock
yarn install --force --network-timeout 100000
yarn run build

# 静态文件发布到Nginx
rm -rf $NGINX_HTML_DIR/*
cp -r dist/* $NGINX_HTML_DIR/
chown -R nginx:nginx $NGINX_HTML_DIR
systemctl restart nginx >/dev/null 2>&1

echo "前端部署执行完毕"