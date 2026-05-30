# LIMS3 系统部署指南

## 项目架构

- **前端**：React 18 + TypeScript + Vite
- **后端**：Node.js + Express + TypeScript
- **数据库**：MySQL 8.0+
- **端口配置**：
  - 前端：5175（开发）/ 静态文件（生产）
  - 后端：3002
  - 数据库：3307（可修改为3306）

---

## 一、本地开发环境启动

### 前置要求

- Node.js 18+
- npm 或 yarn
- MySQL 8.0+

### 1. 安装依赖

```bash
cd f:\trae\lims3
npm install
```

### 2. 配置数据库

修改 [api/config/database.ts](file:///f:/trae/lims3/api/config/database.ts#L3-L12)：

```typescript
const pool = mysql.createPool({
  host: 'localhost',      // 你的数据库地址
  port: 3306,             // 默认3306，根据实际修改
  user: 'root',           // 数据库用户名
  password: 'your_password',  // 数据库密码
  database: 'lims_db',    // 数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### 3. 初始化数据库

按顺序执行 migrations 目录下的 SQL 文件：

```bash
# 先创建数据库
mysql -u root -p
CREATE DATABASE lims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 执行迁移脚本
node run_migration.cjs
```

### 4. 启动服务

**方式一：同时启动前后端**

```bash
npm run dev
```

**方式二：分别启动**

打开终端1 - 启动后端：
```bash
npm run server:dev
```

打开终端2 - 启动前端：
```bash
npm run client:dev
```

### 5. 访问系统

打开浏览器访问：http://localhost:5175

---

## 二、生产环境部署（Docker + Docker Compose）

### 1. 创建 Docker 配置文件

在项目根目录创建以下文件：

#### `Dockerfile.backend`
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "server:dev"]
```

#### `Dockerfile.frontend`
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: lims-mysql
    environment:
      MYSQL_ROOT_PASSWORD: lvba123456
      MYSQL_DATABASE: lims_db
    ports:
      - "3307:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./migrations:/docker-entrypoint-initdb.d
    command: --default-authentication-plugin=mysql_native_password

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: lims-backend
    ports:
      - "3002:3002"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: lvba123456
      DB_NAME: lims_db

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: lims-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql-data:
```

#### `nginx.conf`
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3002;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 2. 使用 Docker Compose 启动

```bash
cd f:\trae\lims3
docker-compose up -d
```

### 3. 查看服务状态

```bash
docker-compose ps
docker-compose logs -f
```

---

## 三、传统服务器部署（Linux）

### 1. 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MySQL
sudo apt install -y mysql-server

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2 (进程管理)
sudo npm install -g pm2
```

### 2. 上传代码

```bash
# 在服务器上克隆或上传代码
cd /opt
git clone https://github.com/hanxiaobinkeep/lims3.git
cd lims3
npm install --production
```

### 3. 配置数据库

```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE lims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lims_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON lims_db.* TO 'lims_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入数据库
mysql -u lims_user -p lims_db < migrations/001_init.sql
# 依次导入其他迁移文件...
```

### 4. 构建前端

```bash
cd /opt/lims3
npm run build
```

### 5. 配置 Nginx

创建 `/etc/nginx/sites-available/lims`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/lims3/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/lims /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 使用 PM2 启动后端

```bash
cd /opt/lims3
pm2 start api/server.ts --name lims-backend
pm2 save
pm2 startup
```

### 7. 配置防火墙

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 四、环境变量配置

创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=lvba123456
DB_NAME=lims_db

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here

# 服务器端口
PORT=3002

# 环境
NODE_ENV=production
```

---

## 五、故障排查

### 后端无法连接数据库

检查：
1. MySQL 服务是否启动
2. 数据库配置是否正确
3. 防火墙是否开放端口

```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 测试连接
mysql -h localhost -P 3306 -u root -p
```

### 前端白屏

检查：
1. 浏览器控制台错误
2. Nginx 配置是否正确
3. 后端 API 是否可访问

```bash
# 测试后端
curl http://localhost:3002/api/health
```

### PM2 服务停止

```bash
# 查看日志
pm2 logs lims-backend

# 重启服务
pm2 restart lims-backend
```

---

## 六、备份与恢复

### 数据库备份

```bash
mysqldump -u root -p lims_db > backup_$(date +%Y%m%d).sql
```

### 数据库恢复

```bash
mysql -u root -p lims_db < backup_20240101.sql
```

---

## 七、更新部署

### Docker 方式

```bash
cd /opt/lims3
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### 传统方式

```bash
cd /opt/lims3
git pull
npm install
npm run build
pm2 restart lims-backend
```

