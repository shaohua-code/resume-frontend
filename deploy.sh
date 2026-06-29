#!/bin/bash
# 加载nvm环境，自动化执行能识别npm/pnpm
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH=$PATH:$NVM_DIR/versions/node/lts/bin

LOG="/www/wwwroot/deploy_front_log.txt"
echo -e "\n==================== 前端部署开始 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG

# 前端项目真实目录
TARGET_DIR="/var/www/resume-frontend"
cd $TARGET_DIR || {
  echo "错误：前端目录 $TARGET_DIR 不存在！" >> $LOG
  exit 1
}

# 拉取前端代码
echo "步骤1：git pull 拉取前端代码" >> $LOG
git pull origin main >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "错误：前端git pull失败" >> $LOG
  exit 1
fi

# 安装依赖
echo "步骤2：npm install" >> $LOG
npm install >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "错误：前端依赖安装失败" >> $LOG
  exit 1
fi

# 打包生产dist
echo "步骤3：npm run build 打包静态文件" >> $LOG
npm run build >> $LOG 2>&1
if [ $? -ne 0 ]; then
  echo "错误：前端打包失败" >> $LOG
  exit 1
fi

# 将dist复制到nginx静态目录（根据你的nginx路径修改）
# 示例：cp -r dist/* /www/wwwroot/frontend-static/
# cp -r dist/* /你的nginx静态目录

echo "==================== 前端部署完成 $(date '+%Y-%m-%d %H:%M:%S') ====================" >> $LOG