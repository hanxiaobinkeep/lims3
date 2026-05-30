USE lims_db;

-- 标准物质表
CREATE TABLE IF NOT EXISTS reference_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rm_code VARCHAR(50) NOT NULL UNIQUE COMMENT '标准物质编号',
    rm_name VARCHAR(200) NOT NULL COMMENT '标准物质名称',
    rm_type VARCHAR(50) COMMENT '类型: 标准物质/标准溶液',
    specification VARCHAR(200) COMMENT '规格',
    purity DECIMAL(8,4) COMMENT '纯度',
    concentration VARCHAR(100) COMMENT '浓度',
    unit VARCHAR(50) COMMENT '单位',
    manufacturer VARCHAR(200) COMMENT '生产厂家',
    supplier_id INT COMMENT '供应商ID',
    batch_number VARCHAR(100) COMMENT '批号',
    certificate_no VARCHAR(100) COMMENT '证书编号',
    manufacture_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期至',
    storage_condition VARCHAR(200) COMMENT '储存条件',
    initial_amount DECIMAL(10,2) COMMENT '初始数量',
    current_amount DECIMAL(10,2) COMMENT '当前数量',
    unit_amount VARCHAR(50) COMMENT '计量单位',
    status VARCHAR(20) DEFAULT 'in_stock' COMMENT '状态: in_stock/expiring/expired',
    remark TEXT COMMENT '备注',
    created_by INT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rm_code (rm_code),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status)
) COMMENT = '标准物质表';

-- 标准物质期间核查表
CREATE TABLE IF NOT EXISTS rm_checks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rm_id INT NOT NULL COMMENT '标准物质ID',
    check_date DATE NOT NULL COMMENT '核查日期',
    check_type VARCHAR(50) COMMENT '核查类型',
    check_method VARCHAR(200) COMMENT '核查方法',
    check_result VARCHAR(50) COMMENT '核查结果: pass/fail',
    deviation_description TEXT COMMENT '偏差说明',
    file_path VARCHAR(500) COMMENT '附件路径',
    checked_by INT COMMENT '核查人',
    next_check_date DATE COMMENT '下次核查日期',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rm_id (rm_id),
    INDEX idx_check_date (check_date)
) COMMENT = '标准物质期间核查表';

-- 标准溶液配制记录表
CREATE TABLE IF NOT EXISTS solution_preparations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solution_code VARCHAR(50) NOT NULL UNIQUE COMMENT '溶液编号',
    solution_name VARCHAR(200) NOT NULL COMMENT '溶液名称',
    concentration DECIMAL(12,6) COMMENT '浓度',
    concentration_unit VARCHAR(50) COMMENT '浓度单位',
    preparation_method TEXT COMMENT '配制方法',
    raw_material_id INT COMMENT '原料标准物质ID',
    raw_material_amount DECIMAL(10,4) COMMENT '原料用量',
    solvent VARCHAR(200) COMMENT '溶剂',
    solvent_amount DECIMAL(10,2) COMMENT '溶剂用量',
    total_volume DECIMAL(10,2) COMMENT '总体积',
    preparation_date DATE COMMENT '配制日期',
    expiry_date DATE COMMENT '有效期至',
    prepared_by INT COMMENT '配制人',
    checked_by INT COMMENT '核对人',
    calibration_required BOOLEAN DEFAULT FALSE COMMENT '是否需要标定',
    calibration_result VARCHAR(50) COMMENT '标定结果',
    status VARCHAR(20) DEFAULT 'valid' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_solution_code (solution_code),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status)
) COMMENT = '标准溶液配制记录表';
