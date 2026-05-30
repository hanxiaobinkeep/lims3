@echo off
echo ========================================
echo LIMS3 系统启动脚本
echo ========================================
echo.

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo [1/4] 检查 Node.js... OK
node --version

REM 检查依赖
if not exist "node_modules" (
    echo.
    echo [2/4] 安装依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [2/4] 依赖已存在，跳过安装
)

REM 检查 .env 文件
if not exist ".env" (
    echo.
    echo [3/4] 复制环境变量配置...
    copy .env.example .env
    echo [提示] 请根据需要修改 .env 文件中的配置
) else (
    echo [3/4] 环境变量配置已存在
)

echo.
echo [4/4] 启动服务...
echo.
echo ========================================
echo 服务启动中...
echo - 前端地址: http://localhost:5175
echo - 后端地址: http://localhost:3002
echo ========================================
echo.

call npm run dev

pause
