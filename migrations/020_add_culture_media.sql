-- 培养基管理表
CREATE TABLE IF NOT EXISTS culture_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_code VARCHAR(50) NOT NULL UNIQUE COMMENT '培养基编码',
    media_name VARCHAR(100) NOT NULL COMMENT '培养基名称',
    media_type ENUM('bacteria', 'fungi', 'mold', 'selective', 'differential', 'enriched') COMMENT '培养基类型',
    manufacturer VARCHAR(100) COMMENT '生产厂家',
    batch_no VARCHAR(50) COMMENT '批号',
    specification VARCHAR(50) COMMENT '规格',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) DEFAULT 'g' COMMENT '单位',
    storage_condition VARCHAR(50) COMMENT '储存条件',
    expiry_date DATE COMMENT '有效期',
    status ENUM('in_stock', 'in_use', 'expired', 'disposed') DEFAULT 'in_stock' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT COMMENT '创建人ID'
);

-- 培养基验收记录表
CREATE TABLE IF NOT EXISTS media_acceptance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL COMMENT '培养基ID',
    acceptance_date DATE COMMENT '验收日期',
    acceptance_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending' COMMENT '验收结果',
    appearance_check VARCHAR(200) COMMENT '外观检查',
    sterility_check VARCHAR(200) COMMENT '无菌检查',
    growth_test VARCHAR(200) COMMENT '促生长试验',
    inspector_id INT COMMENT '检验员ID',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES culture_media(id)
);

-- 培养基配制记录表
CREATE TABLE IF NOT EXISTS media_preparation_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL COMMENT '培养基ID',
    preparation_date DATE COMMENT '配制日期',
    prepared_by INT COMMENT '配制人ID',
    prepared_quantity DECIMAL(10,2) COMMENT '配制数量',
    unit VARCHAR(20) DEFAULT 'mL' COMMENT '单位',
    sterilization_method ENUM('autoclave', 'filtration', 'other') DEFAULT 'autoclave' COMMENT '灭菌方式',
    sterilization_temp DECIMAL(5,1) COMMENT '灭菌温度(°C)',
    sterilization_duration INT COMMENT '灭菌时间(分钟)',
    sterilization_date DATETIME COMMENT '灭菌日期时间',
    ph_value DECIMAL(4,2) COMMENT 'pH值',
    status ENUM('prepared', 'sterilized', 'in_use', 'expired', 'disposed') DEFAULT 'prepared' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES culture_media(id)
);

-- 培养皿预培养记录表
CREATE TABLE IF NOT EXISTS media_pre_incubation_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    preparation_id INT NOT NULL COMMENT '配制记录ID',
    incubator_id VARCHAR(50) COMMENT '培养箱编号',
    incubator_model VARCHAR(50) COMMENT '培养箱型号',
    incubation_temp DECIMAL(5,1) COMMENT '培养温度(°C)',
    incubation_start DATETIME COMMENT '预培养开始时间',
    incubation_end DATETIME COMMENT '预培养结束时间',
    incubation_duration INT COMMENT '预培养时长(小时)',
    sterility_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending' COMMENT '无菌检查结果',
    contamination_count INT DEFAULT 0 COMMENT '污染数量',
    inspector_id INT COMMENT '检查人ID',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preparation_id) REFERENCES media_preparation_records(id)
);

-- 培养基领用记录表
CREATE TABLE IF NOT EXISTS media_usage_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    preparation_id INT NOT NULL COMMENT '配制记录ID',
    used_quantity DECIMAL(10,2) COMMENT '领用数量',
    unit VARCHAR(20) DEFAULT 'mL' COMMENT '单位',
    used_by INT COMMENT '领用人ID',
    used_date DATETIME COMMENT '领用时间',
    purpose VARCHAR(200) COMMENT '用途',
    test_sample_no VARCHAR(50) COMMENT '关联样品编号',
    status ENUM('used', 'returned') DEFAULT 'used' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preparation_id) REFERENCES media_preparation_records(id)
);

-- 培养基灭活记录表
CREATE TABLE IF NOT EXISTS media_inactivation_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    preparation_id INT NOT NULL COMMENT '配制记录ID',
    inactivation_date DATETIME COMMENT '灭活日期时间',
    inactivation_method ENUM('autoclave', 'chemical', 'incineration') DEFAULT 'autoclave' COMMENT '灭活方式',
    inactivation_temp DECIMAL(5,1) COMMENT '灭活温度(°C)',
    inactivation_duration INT COMMENT '灭活时间(分钟)',
    operator_id INT COMMENT '操作人ID',
    verified_by INT COMMENT '确认人ID',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preparation_id) REFERENCES media_preparation_records(id)
);

-- 插入示例数据
INSERT INTO culture_media (media_code, media_name, media_type, manufacturer, batch_no, specification, quantity, unit, storage_condition, expiry_date, status) VALUES
('CM-001', '营养琼脂培养基', 'bacteria', '北京陆桥', 'LB202601', '250g/瓶', 10, '瓶', '2-8°C避光', '2027-01-15', 'in_stock'),
('CM-002', '孟加拉红培养基', 'fungi', '青岛海博', 'HB202602', '250g/瓶', 8, '瓶', '2-8°C避光', '2026-12-20', 'in_stock'),
('CM-003', '沙氏葡萄糖琼脂', 'mold', '北京陆桥', 'LB202603', '250g/瓶', 5, '瓶', '2-8°C避光', '2027-03-10', 'in_stock'),
('CM-004', '麦康凯琼脂', 'selective', '广东环凯', 'HK202604', '250g/瓶', 6, '瓶', '2-8°C避光', '2026-11-30', 'in_stock');
