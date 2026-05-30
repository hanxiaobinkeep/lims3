USE lims_db;

-- 稳定性方案表
CREATE TABLE IF NOT EXISTS stability_protocols (
    id INT PRIMARY KEY AUTO_INCREMENT,
    protocol_no VARCHAR(50) NOT NULL UNIQUE COMMENT '方案编号',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    batch_no VARCHAR(50) COMMENT '批号',
    storage_condition VARCHAR(100) COMMENT '贮存条件',
    test_items TEXT COMMENT '检测项目',
    duration INT COMMENT '研究周期(月)',
    status ENUM('draft', 'approved', 'active', 'completed') DEFAULT 'draft',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 环境监测计划表
CREATE TABLE IF NOT EXISTS environment_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_no VARCHAR(50) NOT NULL UNIQUE COMMENT '计划编号',
    plan_name VARCHAR(100) NOT NULL COMMENT '计划名称',
    monitor_type ENUM('air', 'water', 'surface', 'personnel') COMMENT '监测类型',
    monitor_points TEXT COMMENT '监测点位',
    frequency VARCHAR(50) COMMENT '监测频率',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 环境样品表
CREATE TABLE IF NOT EXISTS environment_samples (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sample_no VARCHAR(50) NOT NULL UNIQUE COMMENT '样品编号',
    plan_id INT COMMENT '计划ID',
    sample_point VARCHAR(100) COMMENT '采样点位',
    sample_date DATE COMMENT '采样日期',
    sampler_id INT COMMENT '采样人ID',
    status ENUM('pending', 'tested', 'reviewed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES environment_plans(id),
    FOREIGN KEY (sampler_id) REFERENCES users(id)
);

-- 偏差调查表
CREATE TABLE IF NOT EXISTS deviation_investigations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    deviation_no VARCHAR(50) NOT NULL UNIQUE COMMENT '偏差编号',
    deviation_type ENUM('OOS', 'OOT', 'AD') COMMENT '偏差类型',
    source VARCHAR(100) COMMENT '来源',
    description TEXT COMMENT '偏差描述',
    investigator_id INT COMMENT '调查人ID',
    investigation_result TEXT COMMENT '调查结果',
    corrective_action TEXT COMMENT '纠正措施',
    status ENUM('open', 'investigating', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    FOREIGN KEY (investigator_id) REFERENCES users(id)
);
