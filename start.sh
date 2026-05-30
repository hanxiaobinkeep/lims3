#!/bin/bash

echo "========================================"
echo "LIMS3 系统启动脚本"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "[1/4] 检查 Node.js... OK"
node --version

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo ""
    echo "[2/4] 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
else
    echo "[2/4] 依赖已存在，跳过安装"
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo ""
    echo "[3/4] 复制环境变量配置..."
    cp .env.example .env
    echo "[提示] 请根据需要修改 .env 文件中的配置"
else
    echo "[3/4] 环境变量配置已存在"
fi

echo ""
echo "[4/4] 启动服务..."
echo ""
echo "========================================"
echo "服务启动中..."
echo "- 前端地址: http://localhost:5175"
echo "- 后端地址: http://localhost:3002"
echo "========================================"
echo ""

npm run dev
