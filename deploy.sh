#!/bin/bash
# 加载nvm环境变量，自动化识别npm
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH=$PATH:$NVM_DIR/versions/node/lts/bin

# 日志改到当前前端项目内，www用户有权限读写
LOG="/var/www/resume-frontend/deploy_front_log.txt"
echo -e "\n==================== 前端部署开始 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG

TARGET_DIR="/var/www/resume-frontend"
cd $TARGET_DIR || {
  echo "【错误】目录 $TARGET_DIR 不存在！" >> $LOG
  exit 1
}

echo "[1] git pull origin main" >> $LOG
git pull origin main >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】git pull 代码拉取失败" >> $LOG
  exit 1
fi

echo "[2] npm install" >> $LOG
npm install >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】npm install 依赖安装失败" >> $LOG
  exit 1
fi

echo "[3] npm run build" >> $LOG
npm run build >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】前端打包 build 失败" >> $LOG
  exit 1
fi

echo "==================== 前端部署完成 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG
exit 0