-- 能力验证管理相关表
-- 创建时间: 2026-05-29

-- 能力验证计划表
CREATE TABLE IF NOT EXISTS proficiency_testing_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_code VARCHAR(100) NOT NULL UNIQUE COMMENT '计划编号',
  plan_name VARCHAR(500) NOT NULL COMMENT '计划名称',
  organizer VARCHAR(200) COMMENT '组织者',
  testing_type VARCHAR(100) COMMENT '验证类型',
  testing_items TEXT COMMENT '检测项目',
  sample_description TEXT COMMENT '样品描述',
  plan_date DATE COMMENT '计划日期',
  deadline_date DATE COMMENT '截止日期',
  responsible_person INT COMMENT '负责人',
  responsible_name VARCHAR(100) COMMENT '负责人姓名',
  status VARCHAR(50) DEFAULT 'planned' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_plan_code (plan_code),
  INDEX idx_status (status),
  INDEX idx_plan_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='能力验证计划表';

-- 能力验证结果表
CREATE TABLE IF NOT EXISTS proficiency_testing_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '计划ID',
  sample_code VARCHAR(100) COMMENT '样品编号',
  test_item VARCHAR(200) COMMENT '检测项目',
  test_method VARCHAR(200) COMMENT '检测方法',
  lab_result DECIMAL(15,6) COMMENT '实验室结果',
  reference_value DECIMAL(15,6) COMMENT '参考值',
  uncertainty DECIMAL(15,6) COMMENT '不确定度',
  z_score DECIMAL(10,4) COMMENT 'Z值',
  en_score DECIMAL(10,4) COMMENT 'En值',
  evaluation VARCHAR(50) COMMENT '评价结果',
  evaluation_comment TEXT COMMENT '评价说明',
  test_date DATE COMMENT '检测日期',
  tester INT COMMENT '检测人',
  tester_name VARCHAR(100) COMMENT '检测人姓名',
  reviewer INT COMMENT '审核人',
  reviewer_name VARCHAR(100) COMMENT '审核人姓名',
  review_date DATETIME COMMENT '审核日期',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_plan_id (plan_id),
  INDEX idx_status (status),
  INDEX idx_evaluation (evaluation),
  CONSTRAINT fk_result_plan FOREIGN KEY (plan_id) REFERENCES proficiency_testing_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='能力验证结果表';

-- 不满意结果处理记录表
CREATE TABLE IF NOT EXISTS proficiency_unsatisfactory_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL COMMENT '结果ID',
  action_type VARCHAR(100) COMMENT '措施类型',
  action_description TEXT COMMENT '措施描述',
  root_cause TEXT COMMENT '根本原因分析',
  corrective_action TEXT COMMENT '纠正措施',
  preventive_action TEXT COMMENT '预防措施',
  responsible_person INT COMMENT '责任人',
  responsible_name VARCHAR(100) COMMENT '责任人姓名',
  deadline DATE COMMENT '完成期限',
  completion_date DATE COMMENT '完成日期',
  verification_result TEXT COMMENT '验证结果',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_result_id (result_id),
  INDEX idx_status (status),
  CONSTRAINT fk_action_result FOREIGN KEY (result_id) REFERENCES proficiency_testing_results(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='不满意结果处理记录表';
