-- 查询统计与报表管理相关表
-- 创建时间: 2026-05-29

-- 报表模板表
CREATE TABLE IF NOT EXISTS report_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_code VARCHAR(100) NOT NULL UNIQUE COMMENT '模板编码',
  template_name VARCHAR(500) NOT NULL COMMENT '模板名称',
  template_type VARCHAR(100) COMMENT '模板类型',
  category VARCHAR(100) COMMENT '分类',
  description TEXT COMMENT '描述',
  query_sql TEXT COMMENT '查询SQL',
  parameters TEXT COMMENT '参数配置(JSON)',
  layout_config TEXT COMMENT '布局配置(JSON)',
  chart_type VARCHAR(50) COMMENT '图表类型',
  is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_template_code (template_code),
  INDEX idx_template_type (template_type),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表模板表';

-- 报表实例表
CREATE TABLE IF NOT EXISTS report_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL COMMENT '模板ID',
  instance_code VARCHAR(100) COMMENT '实例编码',
  instance_name VARCHAR(500) COMMENT '实例名称',
  parameters TEXT COMMENT '运行参数(JSON)',
  result_data TEXT COMMENT '结果数据(JSON)',
  file_path VARCHAR(500) COMMENT '文件路径',
  file_format VARCHAR(50) COMMENT '文件格式',
  status VARCHAR(50) DEFAULT 'generated' COMMENT '状态',
  generated_by INT COMMENT '生成人',
  generated_name VARCHAR(100) COMMENT '生成人姓名',
  generated_at DATETIME COMMENT '生成时间',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_template_id (template_id),
  INDEX idx_status (status),
  INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表实例表';

-- 统计指标配置表
CREATE TABLE IF NOT EXISTS statistics_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  indicator_code VARCHAR(100) NOT NULL UNIQUE COMMENT '指标编码',
  indicator_name VARCHAR(500) NOT NULL COMMENT '指标名称',
  indicator_type VARCHAR(100) COMMENT '指标类型',
  category VARCHAR(100) COMMENT '分类',
  description TEXT COMMENT '描述',
  calculation_method TEXT COMMENT '计算方法',
  query_sql TEXT COMMENT '查询SQL',
  display_format VARCHAR(100) COMMENT '显示格式',
  refresh_frequency VARCHAR(50) COMMENT '刷新频率',
  is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_indicator_code (indicator_code),
  INDEX idx_indicator_type (indicator_type),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统计指标配置表';

-- 统计结果表
CREATE TABLE IF NOT EXISTS statistics_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  indicator_id INT NOT NULL COMMENT '指标ID',
  result_value DECIMAL(15,6) COMMENT '结果值',
  result_text TEXT COMMENT '结果文本',
  period_start DATE COMMENT '统计开始日期',
  period_end DATE COMMENT '统计结束日期',
  calculated_at DATETIME COMMENT '计算时间',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_indicator_id (indicator_id),
  INDEX idx_period (period_start, period_end),
  INDEX idx_calculated_at (calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统计结果表';
