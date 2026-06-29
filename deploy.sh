#!/bin/bash
# 腾讯云CentOS - 修复Yarn缓存/依赖解压失败的部署脚本
# 适配gitee仓库 + 腾讯云npm镜像 + 缓存清理

# ===================== 配置项（根据实际情况修改）=====================
PROJECT_DIR="/var/www/resume-frontend"  # 修正为实际项目目录
NGINX_HTML_DIR="/usr/share/nginx/html" 
GIT_BRANCH="master"                  
YARN_CACHE_DIR="/usr/local/share/.cache/yarn"     # Yarn缓存目录（报错路径）
# ====================================================================

# 定义颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log() {
    local LEVEL=$1
    local MESSAGE=$2
    local TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "[$TIMESTAMP] [$LEVEL] $MESSAGE"
}

# 错误退出
error_exit() {
    log "${RED}ERROR${NC}" "$1"
    exit 1
}

# 检查命令状态
check_status() {
    if [ $? -ne 0 ]; then
        error_exit "$1"
    fi
}

# 核心修复：清理损坏的Yarn缓存 + 修复权限
fix_yarn_cache() {
    log "${YELLOW}INFO${NC}" "==== 清理损坏的Yarn缓存 ===="
    # 1. 停止所有Yarn进程（防止缓存占用）
    pkill -f yarn >/dev/null 2>&1 || true
    
    # 2. 彻底删除Yarn缓存目录（核心解决解压报错）
    if [ -d "$YARN_CACHE_DIR" ]; then
        rm -rf "$YARN_CACHE_DIR"
        log "${GREEN}SUCCESS${NC}" "已删除损坏的Yarn缓存: $YARN_CACHE_DIR"
    fi
    
    # 3. 修复目录权限（解决EEXIST/EACCES错误）
    mkdir -p "$(dirname $YARN_CACHE_DIR)"
    chmod -R 775 "$(dirname $YARN_CACHE_DIR)"
    chown -R root:root "$(dirname $YARN_CACHE_DIR)"  # 腾讯云建议root权限
    
    # 4. 切换Yarn镜像源（避免腾讯云镜像源异常）
    yarn config set registry https://registry.npm.taobao.org >/dev/null 2>&1
    log "${GREEN}SUCCESS${NC}" "Yarn镜像源已切换为淘宝源（避开腾讯云镜像异常）"
}

# 前置检查
pre_check() {
    log "${YELLOW}INFO${NC}" "==== 前置检查 ===="
    # 检查root权限
    if [ "$(id -u)" != "0" ]; then
        error_exit "请用root执行：sudo ./deploy.sh"
    fi
    # 检查项目目录
    if [ ! -d "$PROJECT_DIR" ]; then
        error_exit "项目目录不存在: $PROJECT_DIR"
    fi
    # 检查核心命令
    command -v git >/dev/null 2>&1 || error_exit "未安装git，请执行：yum install -y git"
    command -v yarn >/dev/null 2>&1 || error_exit "未安装yarn，请执行：npm install -g yarn"
    log "${GREEN}SUCCESS${NC}" "前置检查完成"
}

# 主部署流程
main() {
    log "${YELLOW}INFO${NC}" "==== 自动部署开始 ===="

    # 1. 前置检查
    pre_check

    # 2. 修复Yarn缓存（核心步骤）
    fix_yarn_cache

    # 3. 进入项目目录
    log "${YELLOW}INFO${NC}" "1. 进入项目目录: $PROJECT_DIR"
    cd "$PROJECT_DIR" || error_exit "进入项目目录失败"

    # 4. 拉取最新代码
    log "${YELLOW}INFO${NC}" "2. 拉取最新代码（master分支）"
    git reset --hard
    check_status "git reset失败"
    git pull origin "$GIT_BRANCH"
    check_status "git pull失败（检查gitee仓库权限/网络）"

    # 5. 清理锁文件冲突
    log "${YELLOW}INFO${NC}" "3. 清理依赖锁文件"
    rm -f package-lock.json pnpm-lock.yaml yarn.lock
    log "${GREEN}SUCCESS${NC}" "已删除冲突锁文件"

    # 6. 安装依赖（重新生成缓存）
    log "${YELLOW}INFO${NC}" "4. 安装依赖（重新生成Yarn缓存）"
    yarn install --force --network-timeout 100000  # 延长超时（解决网络问题）
    check_status "yarn install失败（依赖下载/解压异常）"

    # 7. 构建项目
    log "${YELLOW}INFO${NC}" "5. 构建项目"
    yarn run build
    check_status "yarn build失败"
    # 检查dist目录
    if [ ! -d "./dist" ] || [ -z "$(ls -A ./dist)" ]; then
        error_exit "dist目录为空或不存在"
    fi

    # 8. 部署到Nginx
    log "${YELLOW}INFO${NC}" "6. 覆盖到Nginx目录"
    rm -rf "$NGINX_HTML_DIR"/*
    check_status "清空Nginx目录失败"
    cp -r dist/* "$NGINX_HTML_DIR/"
    check_status "复制dist文件失败"

    # 9. 修复Nginx权限
    chown -R nginx:nginx "$NGINX_HTML_DIR"
    systemctl restart nginx >/dev/null 2>&1 || service nginx restart >/dev/null 2>&1

    log "${GREEN}SUCCESS${NC}" "==== 部署完成 ===="
}

# 启动主流程
main   
