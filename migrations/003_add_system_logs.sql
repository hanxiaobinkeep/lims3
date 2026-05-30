USE lims_db;

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_type VARCHAR(50) NOT NULL COMMENT '日志类型：login, logout, create, update, delete, error',
    module VARCHAR(100) COMMENT '功能模块',
    operation VARCHAR(255) COMMENT '操作描述',
    user_id INT COMMENT '操作人ID',
    user_name VARCHAR(100) COMMENT '操作人姓名',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    request_method VARCHAR(10) COMMENT '请求方法：GET, POST, PUT, DELETE',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_code INT COMMENT '响应状态码',
    error_message TEXT COMMENT '错误信息',
    execution_time INT COMMENT '执行时间(ms)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_log_type (log_type),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_module (module)
) COMMENT = '系统操作日志表';
