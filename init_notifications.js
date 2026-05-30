import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initNotifications() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    multipleStatements: true
  });

  try {
    console.log('开始创建通知表...');
    
    // 执行通知表创建
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lims_db.notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '接收用户ID',
        title VARCHAR(255) NOT NULL COMMENT '通知标题',
        content TEXT COMMENT '通知内容',
        type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info' COMMENT '通知类型',
        related_module VARCHAR(100) COMMENT '相关模块',
        related_id INT COMMENT '相关记录ID',
        is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '优先级',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL COMMENT '阅读时间',
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) COMMENT = '系统通知表'
    `);
    
    // 执行任务提醒表创建
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lims_db.task_reminders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        task_id INT COMMENT '任务ID',
        reminder_type ENUM('due_date', 'overtime', 'oos') DEFAULT 'due_date' COMMENT '提醒类型',
        title VARCHAR(255) NOT NULL COMMENT '提醒标题',
        message TEXT COMMENT '提醒消息',
        is_sent TINYINT DEFAULT 0 COMMENT '是否已发送',
        scheduled_at TIMESTAMP COMMENT '计划发送时间',
        sent_at TIMESTAMP NULL COMMENT '实际发送时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_scheduled_at (scheduled_at)
      ) COMMENT = '任务提醒表'
    `);

    console.log('✅ 通知表创建完成！');
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

initNotifications();
