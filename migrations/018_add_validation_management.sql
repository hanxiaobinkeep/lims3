-- 验证管理相关表
-- 创建时间: 2026-05-29

-- 验证计划表
CREATE TABLE IF NOT EXISTS validation_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_code VARCHAR(100) NOT NULL UNIQUE COMMENT '计划编号',
  plan_name VARCHAR(500) NOT NULL COMMENT '计划名称',
  validation_type VARCHAR(100) COMMENT '验证类型',
  category VARCHAR(100) COMMENT '分类',
  description TEXT COMMENT '描述',
  target_system VARCHAR(200) COMMENT '目标系统/设备',
  target_id INT COMMENT '目标ID',
  responsible_person INT COMMENT '负责人',
  responsible_name VARCHAR(100) COMMENT '负责人姓名',
  planned_start_date DATE COMMENT '计划开始日期',
  planned_end_date DATE COMMENT '计划结束日期',
  actual_start_date DATE COMMENT '实际开始日期',
  actual_end_date DATE COMMENT '实际结束日期',
  status VARCHAR(50) DEFAULT 'planned' COMMENT '状态',
  priority VARCHAR(50) DEFAULT 'normal' COMMENT '优先级',
  risk_level VARCHAR(50) COMMENT '风险等级',
  validation_scope TEXT COMMENT '验证范围',
  acceptance_criteria TEXT COMMENT '接受标准',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_plan_code (plan_code),
  INDEX idx_validation_type (validation_type),
  INDEX idx_status (status),
  INDEX idx_target_id (target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证计划表';

-- 验证文档表（方案、报告等）
CREATE TABLE IF NOT EXISTS validation_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  document_code VARCHAR(100) COMMENT '文档编号',
  document_name VARCHAR(500) COMMENT '文档名称',
  document_type VARCHAR(100) COMMENT '文档类型',
  version VARCHAR(20) DEFAULT '1.0' COMMENT '版本',
  content TEXT COMMENT '文档内容',
  file_path VARCHAR(500) COMMENT '文件路径',
  status VARCHAR(50) DEFAULT 'draft' COMMENT '状态',
  author INT COMMENT '编制人',
  author_name VARCHAR(100) COMMENT '编制人姓名',
  reviewer INT COMMENT '审核人',
  reviewer_name VARCHAR(100) COMMENT '审核人姓名',
  approver INT COMMENT '批准人',
  approver_name VARCHAR(100) COMMENT '批准人姓名',
  review_date DATETIME COMMENT '审核日期',
  approve_date DATETIME COMMENT '批准日期',
  effective_date DATE COMMENT '生效日期',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_document_type (document_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证文档表';

-- IQ/OQ/PQ测试记录表
CREATE TABLE IF NOT EXISTS validation_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  test_code VARCHAR(100) COMMENT '测试编号',
  test_name VARCHAR(500) COMMENT '测试名称',
  test_type VARCHAR(50) COMMENT '测试类型（IQ/OQ/PQ）',
  test_objective TEXT COMMENT '测试目的',
  test_procedure TEXT COMMENT '测试步骤',
  expected_result TEXT COMMENT '预期结果',
  actual_result TEXT COMMENT '实际结果',
  test_result VARCHAR(50) COMMENT '测试结果',
  deviation_description TEXT COMMENT '偏差描述',
  tester INT COMMENT '测试人',
  tester_name VARCHAR(100) COMMENT '测试人姓名',
  test_date DATETIME COMMENT '测试日期',
  reviewer INT COMMENT '审核人',
  reviewer_name VARCHAR(100) COMMENT '审核人姓名',
  review_date DATETIME COMMENT '审核日期',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_test_type (test_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证测试记录表';

-- 可追溯性矩阵表
CREATE TABLE IF NOT EXISTS traceability_matrices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  requirement_id VARCHAR(100) COMMENT '需求编号',
  requirement_description TEXT COMMENT '需求描述',
  test_case_id VARCHAR(100) COMMENT '测试用例编号',
  test_case_description TEXT COMMENT '测试用例描述',
  test_result VARCHAR(50) COMMENT '测试结果',
  risk_level VARCHAR(50) COMMENT '风险等级',
  verification_method VARCHAR(100) COMMENT '验证方法',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='可追溯性矩阵表';

-- 验证偏差/变更记录表
CREATE TABLE IF NOT EXISTS validation_deviations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  deviation_code VARCHAR(100) COMMENT '偏差编号',
  deviation_type VARCHAR(100) COMMENT '偏差类型',
  description TEXT COMMENT '偏差描述',
  root_cause TEXT COMMENT '根本原因',
  impact_assessment TEXT COMMENT '影响评估',
  corrective_action TEXT COMMENT '纠正措施',
  preventive_action TEXT COMMENT '预防措施',
  responsible_person INT COMMENT '责任人',
  responsible_name VARCHAR(100) COMMENT '责任人姓名',
  deadline DATE COMMENT '完成期限',
  completion_date DATE COMMENT '完成日期',
  status VARCHAR(50) DEFAULT 'open' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证偏差记录表';
