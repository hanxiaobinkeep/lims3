-- 文件管理体系相关表
-- 创建时间: 2026-05-29

-- 文件分类表
CREATE TABLE IF NOT EXISTS document_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
  category_name VARCHAR(200) NOT NULL COMMENT '分类名称',
  parent_id INT DEFAULT 0 COMMENT '父分类ID',
  level INT DEFAULT 1 COMMENT '层级',
  sort_order INT DEFAULT 0 COMMENT '排序',
  description TEXT COMMENT '描述',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_parent_id (parent_id),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件分类表';

-- 文件信息表
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_code VARCHAR(100) NOT NULL UNIQUE COMMENT '文件编号',
  document_name VARCHAR(500) NOT NULL COMMENT '文件名称',
  category_id INT COMMENT '分类ID',
  document_type VARCHAR(50) COMMENT '文件类型',
  version VARCHAR(20) DEFAULT '1.0' COMMENT '版本号',
  status VARCHAR(50) DEFAULT 'draft' COMMENT '状态',
  content TEXT COMMENT '文件内容',
  file_path VARCHAR(500) COMMENT '文件路径',
  file_size BIGINT COMMENT '文件大小',
  file_format VARCHAR(50) COMMENT '文件格式',
  author INT COMMENT '编制人',
  author_name VARCHAR(100) COMMENT '编制人姓名',
  reviewer INT COMMENT '审核人',
  reviewer_name VARCHAR(100) COMMENT '审核人姓名',
  approver INT COMMENT '批准人',
  approver_name VARCHAR(100) COMMENT '批准人姓名',
  review_date DATETIME COMMENT '审核日期',
  approve_date DATETIME COMMENT '批准日期',
  effective_date DATE COMMENT '生效日期',
  expiry_date DATE COMMENT '失效日期',
  is_current_version BOOLEAN DEFAULT TRUE COMMENT '是否为当前版本',
  previous_version_id INT COMMENT '上一版本ID',
  distribution_scope TEXT COMMENT '发放范围',
  change_description TEXT COMMENT '变更说明',
  change_reason TEXT COMMENT '变更原因',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_document_code (document_code),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_version (version),
  INDEX idx_is_current_version (is_current_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件信息表';

-- 文件发放记录表
CREATE TABLE IF NOT EXISTS document_distributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL COMMENT '文件ID',
  recipient_id INT COMMENT '接收人ID',
  recipient_name VARCHAR(100) COMMENT '接收人姓名',
  recipient_dept VARCHAR(100) COMMENT '接收部门',
  distribution_date DATETIME COMMENT '发放日期',
  distribution_method VARCHAR(50) COMMENT '发放方式',
  return_date DATETIME COMMENT '回收日期',
  status VARCHAR(50) DEFAULT 'distributed' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_document_id (document_id),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件发放记录表';

-- 文件变更记录表
CREATE TABLE IF NOT EXISTS document_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL COMMENT '文件ID',
  change_type VARCHAR(50) COMMENT '变更类型',
  change_description TEXT COMMENT '变更描述',
  change_reason TEXT COMMENT '变更原因',
  old_content TEXT COMMENT '原内容',
  new_content TEXT COMMENT '新内容',
  applicant INT COMMENT '申请人',
  applicant_name VARCHAR(100) COMMENT '申请人姓名',
  apply_date DATETIME COMMENT '申请日期',
  reviewer INT COMMENT '审核人',
  reviewer_name VARCHAR(100) COMMENT '审核人姓名',
  review_date DATETIME COMMENT '审核日期',
  review_result VARCHAR(50) COMMENT '审核结果',
  review_comment TEXT COMMENT '审核意见',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_document_id (document_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件变更记录表';

-- 文件阅读记录表
CREATE TABLE IF NOT EXISTS document_read_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL COMMENT '文件ID',
  user_id INT COMMENT '用户ID',
  user_name VARCHAR(100) COMMENT '用户姓名',
  read_date DATETIME COMMENT '阅读日期',
  read_duration INT COMMENT '阅读时长(秒)',
  ip_address VARCHAR(50) COMMENT 'IP地址',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_document_id (document_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件阅读记录表';
