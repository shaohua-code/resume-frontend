#!/bin/bash
# 加载nvm环境，解决自动化找不到npm
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH=$PATH:$NVM_DIR/versions/node/lts/bin

# 前端日志单独区分
LOG="/www/wwwroot/deploy_front_log.txt"
echo -e "\n==================== 前端部署开始 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG

# 真实前端目录（宝塔截图路径）
TARGET_DIR="/var/www/resume-frontend"
cd $TARGET_DIR || {
  echo "【错误】目录 $TARGET_DIR 不存在！" >> $LOG
  exit 1
}

# 1. 拉取前端代码
echo "[1] git pull origin main" >> $LOG
git pull origin main >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】git pull 代码拉取失败" >> $LOG
  exit 1
fi

# 2. 安装依赖
echo "[2] npm install" >> $LOG
npm install >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】npm install 依赖安装失败" >> $LOG
  exit 1
fi

# 3. Vue/Vite打包
echo "[3] npm run build" >> $LOG
npm run build >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "【错误】前端打包 build 失败" >> $LOG
  exit 1
fi

# 4. （可选）复制dist到nginx静态目录，自行修改路径
# rm -rf /www/wwwroot/frontend-static/*
# cp -r dist/* /www/wwwroot/frontend-static/

echo "==================== 前端部署完成 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG
exit 0