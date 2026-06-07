# 第一阶段：构建
FROM node:22.12-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm@9.12.2

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 配置 npm 镜像源并安装依赖
RUN pnpm config set registry https://registry.npmmirror.com && \
    pnpm install

# 复制项目文件
COPY . .

# 构建项目（设置 NODE_OPTIONS 增加内存限制）
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

# 第二阶段：使用 nginx 部署
FROM nginx:alpine

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
RUN echo 'server { \
    listen 8043; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location = /favicon.ico { \
        root /usr/share/nginx/html; \
        access_log off; \
        log_not_found off; \
    } \
    location /api/ { \
        proxy_pass http://host.docker.internal:6090/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 8043

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
