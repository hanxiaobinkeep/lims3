import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initReviewDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    multipleStatements: true
  });

  try {
    console.log('开始执行数据复核表创建...');
    
    // 执行第一个表创建
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lims_db.data_reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inspection_result_id INT NOT NULL COMMENT '检验结果ID',
        reviewer_id INT NOT NULL COMMENT '复核人ID',
        review_type ENUM('review', 'approval') DEFAULT 'review' COMMENT '复核类型：复核/批准',
        review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '复核状态',
        review_comment TEXT COMMENT '复核意见',
        reviewed_at TIMESTAMP NULL COMMENT '复核时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_result_id (inspection_result_id),
        INDEX idx_reviewer_id (reviewer_id)
      ) COMMENT = '数据复核记录表'
    `);
    
    // 检查并添加状态列
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM lims_db.inspection_results LIKE 'status'`
    );
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE lims_db.inspection_results 
        ADD COLUMN status ENUM('pending', 'reviewing', 'reviewed', 'approved') 
        DEFAULT 'pending' COMMENT '状态'
      `);
    }

    console.log('✅ 数据复核表创建完成！');
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

initReviewDb();
