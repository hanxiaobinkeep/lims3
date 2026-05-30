const mysql = require('mysql2/promise');

async function fix() {
  const c = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    await c.execute('DROP TABLE IF EXISTS system_logs');
    console.log('Dropped old table');
  } catch(e) {}

  const sql = `CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_type VARCHAR(50) COMMENT '日志类型',
    module VARCHAR(100) COMMENT '功能模块',
    operation VARCHAR(255) COMMENT '操作描述',
    user_id INT COMMENT '操作人ID',
    user_name VARCHAR(100) COMMENT '操作人姓名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_code INT COMMENT '响应状态码',
    error_message TEXT COMMENT '错误信息',
    execution_time INT COMMENT '执行时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_type (log_type),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_module (module)
  ) COMMENT='系统操作日志表'`;

  await c.execute(sql);
  console.log('Created new system_logs table');
  await c.end();
}

fix().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
