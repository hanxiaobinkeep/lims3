-- 质量控制相关表
-- 创建时间: 2026-05-29

-- 质控计划表
CREATE TABLE IF NOT EXISTS qc_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(200) NOT NULL COMMENT '质控计划名称',
  plan_type ENUM('control_chart', 'quality_monitor', 'capability_analysis') NOT NULL DEFAULT 'control_chart' COMMENT '计划类型',
  material_id INT COMMENT '关联物料ID',
  inspection_item VARCHAR(100) COMMENT '检验项目',
  chart_type ENUM('x_bar_r', 'x_bar_s', 'p', 'np', 'c', 'u') NOT NULL DEFAULT 'x_bar_r' COMMENT '控制图类型',
  sample_size INT NOT NULL DEFAULT 5 COMMENT '样本大小',
  sample_interval VARCHAR(50) COMMENT '取样间隔',
  center_line DECIMAL(15, 6) COMMENT '中心线',
  upper_control_limit DECIMAL(15, 6) COMMENT '上控制限',
  lower_control_limit DECIMAL(15, 6) COMMENT '下控制限',
  upper_spec_limit DECIMAL(15, 6) COMMENT '上规格限',
  lower_spec_limit DECIMAL(15, 6) COMMENT '下规格限',
  target_value DECIMAL(15, 6) COMMENT '目标值',
  unit VARCHAR(20) COMMENT '单位',
  description TEXT COMMENT '描述',
  status ENUM('draft', 'active', 'inactive') NOT NULL DEFAULT 'draft' COMMENT '状态',
  created_by INT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_material (material_id),
  INDEX idx_status (status),
  INDEX idx_type (plan_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质控计划表';

-- 质控数据表
CREATE TABLE IF NOT EXISTS qc_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '质控计划ID',
  subgroup_no INT NOT NULL COMMENT '子组号',
  sample_time DATETIME NOT NULL COMMENT '取样时间',
  sample_values TEXT NOT NULL COMMENT '样本值(JSON数组)',
  subgroup_mean DECIMAL(15, 6) COMMENT '子组均值',
  subgroup_range DECIMAL(15, 6) COMMENT '子组极差',
  subgroup_std DECIMAL(15, 6) COMMENT '子组标准差',
  is_out_of_control BOOLEAN DEFAULT FALSE COMMENT '是否失控',
  out_of_control_reason TEXT COMMENT '失控原因',
  out_of_control_action TEXT COMMENT '处理措施',
  status ENUM('pending', 'analyzed', 'resolved') DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_plan (plan_id),
  INDEX idx_subgroup (subgroup_no),
  INDEX idx_sample_time (sample_time),
  CONSTRAINT fk_qc_data_plan FOREIGN KEY (plan_id) REFERENCES qc_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质控数据表';

-- 失控记录表
CREATE TABLE IF NOT EXISTS qc_ooc_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL COMMENT '质控计划ID',
  qc_data_id INT NOT NULL COMMENT '质控数据ID',
  ooc_type VARCHAR(100) COMMENT '失控类型',
  ooc_rule VARCHAR(100) COMMENT '触发规则',
  ooc_time DATETIME NOT NULL COMMENT '失控时间',
  description TEXT COMMENT '失控描述',
  investigation TEXT COMMENT '调查过程',
  corrective_action TEXT COMMENT '纠正措施',
  preventive_action TEXT COMMENT '预防措施',
  action_taken_at DATETIME COMMENT '措施实施时间',
  closed_by INT COMMENT '关闭人ID',
  closed_at DATETIME COMMENT '关闭时间',
  status ENUM('open', 'investigating', 'action_taken', 'closed') DEFAULT 'open' COMMENT '状态',
  created_by INT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_plan (plan_id),
  INDEX idx_qc_data (qc_data_id),
  INDEX idx_status (status),
  CONSTRAINT fk_qc_ooc_plan FOREIGN KEY (plan_id) REFERENCES qc_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_qc_ooc_data FOREIGN KEY (qc_data_id) REFERENCES qc_data(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='失控记录表';
