USE lims_db;

-- 数据复核记录表
CREATE TABLE IF NOT EXISTS data_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_result_id INT NOT NULL COMMENT '检验结果ID',
    reviewer_id INT NOT NULL COMMENT '复核人ID',
    review_type ENUM('review', 'approval') DEFAULT 'review' COMMENT '复核类型：复核/批准',
    review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '复核状态',
    review_comment TEXT COMMENT '复核意见',
    reviewed_at TIMESTAMP NULL COMMENT '复核时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_result_id) REFERENCES inspection_results(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
) COMMENT = '数据复核记录表';

-- 修改检验结果表，添加状态字段（兼容方式）
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'lims_db' 
                   AND TABLE_NAME = 'inspection_results' 
                   AND COLUMN_NAME = 'status');

SET @sql = IF(@col_exists = 0, 
             'ALTER TABLE inspection_results ADD COLUMN status ENUM(''pending'', ''reviewing'', ''reviewed'', ''approved'') DEFAULT ''pending'' COMMENT ''状态''',
             'SELECT ''Column already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
