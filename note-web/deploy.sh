#!/bin/bash

# 自动化部署脚本
# 用途：构建 Docker 镜像并上传到云服务器

set -e  # 遇到错误立即退出

# 配置变量
SERVER_IP="114.132.243.37"
SERVER_USER="root"
IMAGE_NAME="note-web"
IMAGE_TAG="latest"
TAR_FILE="note-web.tar.gz"
CONTAINER_NAME="note-web"
PORT="8043"

echo "========================================"
echo "开始构建 Docker 镜像..."
echo "========================================"

# 1. 构建镜像（针对 AMD64 架构）
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} .

echo ""
echo "========================================"
echo "保存镜像为压缩文件..."
echo "========================================"

# 2. 保存镜像为压缩文件
docker save ${IMAGE_NAME}:${IMAGE_TAG} | gzip > ${TAR_FILE}

echo ""
echo "镜像文件大小："
ls -lh ${TAR_FILE}

echo ""
echo "========================================"
echo "上传镜像到云服务器..."
echo "========================================"

# 3. 上传到云服务器
scp ${TAR_FILE} ${SERVER_USER}@${SERVER_IP}:./

echo ""
echo "========================================"
echo "在云服务器上部署..."
echo "========================================"

# 4. SSH 到云服务器执行部署命令
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
echo "停止并删除旧容器..."
docker stop note-web 2>/dev/null || true
docker rm note-web 2>/dev/null || true

echo "删除旧镜像..."
docker rmi note-web:latest 2>/dev/null || true

echo "加载新镜像..."
gunzip -c note-web.tar.gz | docker load

echo "启动新容器..."
docker run -d \
  --name note-web \
  -p 8043:8043 \
  --add-host host.docker.internal:host-gateway \
  --restart unless-stopped \
  note-web:latest

echo "清理镜像文件..."
rm -f note-web.tar.gz

echo "容器状态："
docker ps | grep note-web

echo "查看日志（最后 20 行）："
docker logs --tail 20 note-web
ENDSSH

echo ""
echo "========================================"
echo "部署完成！"
echo "访问地址: http://${SERVER_IP}:${PORT}"
echo "========================================"

# 5. 清理本地临时文件
echo ""
read -p "是否删除本地的镜像压缩文件？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f ${TAR_FILE}
    echo "已删除本地镜像文件"
fi

echo ""
echo "全部完成！"
