-- 工作流相关表
-- 创建时间: 2026-05-29

-- 工作流定义表
CREATE TABLE IF NOT EXISTS workflows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workflow_code VARCHAR(50) NOT NULL UNIQUE COMMENT '工作流编码',
  workflow_name VARCHAR(200) NOT NULL COMMENT '工作流名称',
  workflow_type VARCHAR(50) COMMENT '工作流类型（inspection, review, approval, etc.）',
  description TEXT COMMENT '描述',
  version INT DEFAULT 1 COMMENT '版本号',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  nodes JSON COMMENT '节点配置(JSON)',
  created_by INT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_code (workflow_code),
  INDEX idx_type (workflow_type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流定义表';

-- 工作流实例表
CREATE TABLE IF NOT EXISTS workflow_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workflow_id INT NOT NULL COMMENT '工作流定义ID',
  business_type VARCHAR(50) NOT NULL COMMENT '业务类型',
  business_id VARCHAR(100) NOT NULL COMMENT '业务ID',
  current_node_id VARCHAR(50) COMMENT '当前节点ID',
  status ENUM('pending', 'processing', 'approved', 'rejected', 'cancelled') DEFAULT 'pending' COMMENT '状态',
  initiator_id INT COMMENT '发起人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_workflow (workflow_id),
  INDEX idx_business (business_type, business_id),
  INDEX idx_status (status),
  CONSTRAINT fk_workflow_def FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流实例表';

-- 工作流历史记录表
CREATE TABLE IF NOT EXISTS workflow_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instance_id INT NOT NULL COMMENT '工作流实例ID',
  node_id VARCHAR(50) COMMENT '节点ID',
  node_name VARCHAR(100) COMMENT '节点名称',
  action ENUM('submit', 'approve', 'reject', 'return', 'transfer') NOT NULL COMMENT '操作类型',
  operator_id INT COMMENT '操作人ID',
  operator_name VARCHAR(100) COMMENT '操作人姓名',
  comment TEXT COMMENT '意见',
  next_node_id VARCHAR(50) COMMENT '下一节点ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  INDEX idx_instance (instance_id),
  INDEX idx_operator (operator_id),
  CONSTRAINT fk_history_instance FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流历史记录表';

-- 审批配置表
CREATE TABLE IF NOT EXISTS approval_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_type VARCHAR(50) NOT NULL COMMENT '业务类型',
  business_action VARCHAR(50) NOT NULL COMMENT '业务动作',
  workflow_id INT COMMENT '关联工作流ID',
  approval_levels INT DEFAULT 1 COMMENT '审批级别数',
  auto_approve BOOLEAN DEFAULT FALSE COMMENT '是否自动审批',
  created_by INT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_business_action (business_type, business_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批配置表';
