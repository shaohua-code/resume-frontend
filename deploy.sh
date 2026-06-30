#!/bin/bash
LOG="/www/wwwroot/deploy_log.txt"
echo "==== 部署开始 $(date) ====" >> $LOG

# 进入项目目录
cd /www/wwwroot/resume-backend-node || echo "目录不存在" >> $LOG && exit 1

# 拉取代码
echo "拉取代码" >> $LOG
git pull origin main >> $LOG 2>&1
[ $? -ne 0 ] && echo "git拉取失败，终止部署" >> $LOG && exit 1

# 安装依赖
echo "安装依赖" >> $LOG
npm install >> $LOG 2>&1

# pm2重启/启动
echo "重启服务" >> $LOG
pm2 describe resume-api >/dev/null && pm2 restart resume-api || pm2 start app.js --name resume-api >> $LOG 2>&1

echo "==== 部署完成 $(date) ====" >> $LOG