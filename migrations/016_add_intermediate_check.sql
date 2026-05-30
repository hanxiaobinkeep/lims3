-- 期间核查管理相关表
-- 创建时间: 2026-05-29

-- 期间核查计划表
CREATE TABLE IF NOT EXISTS intermediate_check_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_code VARCHAR(100) NOT NULL UNIQUE COMMENT '计划编号',
  plan_name VARCHAR(500) NOT NULL COMMENT '计划名称',
  instrument_id INT COMMENT '仪器设备ID',
  instrument_name VARCHAR(200) COMMENT '仪器设备名称',
  instrument_code VARCHAR(100) COMMENT '仪器设备编号',
  check_item VARCHAR(200) COMMENT '核查项目',
  check_method VARCHAR(200) COMMENT '核查方法',
  check_frequency VARCHAR(100) COMMENT '核查频率',
  check_criteria TEXT COMMENT '核查标准',
  tolerance_range VARCHAR(200) COMMENT '允差范围',
  responsible_person INT COMMENT '负责人',
  responsible_name VARCHAR(100) COMMENT '负责人姓名',
  plan_date DATE COMMENT '计划日期',
  next_check_date DATE COMMENT '下次核查日期',
  status VARCHAR(50) DEFAULT 'planned' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_plan_code (plan_code),
  INDEX idx_instrument_id (instrument_id),
  INDEX idx_status (status),
  INDEX idx_next_check_date (next_check_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='期间核查计划表';

-- 期间核查记录表
CREATE TABLE IF NOT EXISTS intermediate_check_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  check_code VARCHAR(100) COMMENT '核查编号',
  check_date DATE COMMENT '核查日期',
  checker INT COMMENT '核查人',
  checker_name VARCHAR(100) COMMENT '核查人姓名',
  check_result DECIMAL(15,6) COMMENT '核查结果',
  reference_value DECIMAL(15,6) COMMENT '参考值',
  deviation DECIMAL(15,6) COMMENT '偏差',
  deviation_percentage DECIMAL(10,4) COMMENT '偏差百分比',
  is_within_tolerance BOOLEAN DEFAULT TRUE COMMENT '是否在允差范围内',
  conclusion VARCHAR(50) COMMENT '结论',
  conclusion_comment TEXT COMMENT '结论说明',
  corrective_action TEXT COMMENT '纠正措施',
  reviewer INT COMMENT '审核人',
  reviewer_name VARCHAR(100) COMMENT '审核人姓名',
  review_date DATETIME COMMENT '审核日期',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_check_date (check_date),
  INDEX idx_status (status),
  INDEX idx_conclusion (conclusion),
  CONSTRAINT fk_check_plan FOREIGN KEY (plan_id) REFERENCES intermediate_check_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='期间核查记录表';

-- 期间核查预警表
CREATE TABLE IF NOT EXISTS intermediate_check_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  alert_type VARCHAR(50) COMMENT '预警类型',
  alert_content TEXT COMMENT '预警内容',
  alert_date DATE COMMENT '预警日期',
  is_resolved BOOLEAN DEFAULT FALSE COMMENT '是否已处理',
  resolved_date DATETIME COMMENT '处理日期',
  resolved_by INT COMMENT '处理人',
  resolved_name VARCHAR(100) COMMENT '处理人姓名',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_alert_type (alert_type),
  INDEX idx_is_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='期间核查预警表';
