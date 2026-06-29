#!/bin/bash

# ===================== NVM =====================
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH=$PATH:$NVM_DIR/versions/node/lts/bin

# ===================== LOG（已修复） =====================
LOG_DIR="/var/www/resume-frontend/logs"
LOG="$LOG_DIR/deploy.log"

mkdir -p $LOG_DIR
touch $LOG

# ===================== 开始日志 =====================
echo -e "\n==================== 前端部署开始 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG

# ===================== 项目目录 =====================
TARGET_DIR="/var/www/resume-frontend"
cd $TARGET_DIR || {
  echo "【错误】目录 $TARGET_DIR 不存在！" >> $LOG
  exit 1
}

# ===================== git pull =====================
echo "[1] git pull origin main" >> $LOG
git pull origin main >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】git pull 代码拉取失败" >> $LOG
  exit 1
fi

# ===================== npm install =====================
echo "[2] npm install" >> $LOG
npm install >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】npm install 依赖失败" >> $LOG
  exit 1
fi

# ===================== build =====================
echo "[3] npm run build" >> $LOG
npm run build >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】npm run build 失败" >> $LOG
  exit 1
fi

# ===================== 完成 =====================
echo "==================== 前端部署完成 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG

exit 0