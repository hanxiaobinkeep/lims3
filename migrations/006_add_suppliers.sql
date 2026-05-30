USE lims_db;

-- 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_code VARCHAR(50) NOT NULL UNIQUE COMMENT '供应商编码',
    supplier_name VARCHAR(200) NOT NULL COMMENT '供应商名称',
    short_name VARCHAR(100) COMMENT '供应商简称',
    supplier_type VARCHAR(50) COMMENT '供应商类型（原料/辅料/试剂/设备/服务）',
    address VARCHAR(500) COMMENT '地址',
    contact_person VARCHAR(100) COMMENT '联系人',
    contact_phone VARCHAR(50) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    website VARCHAR(200) COMMENT '网站',
    is_qualified TINYINT DEFAULT 1 COMMENT '是否合格供应商',
    qualification_deadline DATE COMMENT '资质有效期',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态（active/inactive）',
    remark TEXT COMMENT '备注',
    created_by INT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_supplier_code (supplier_code),
    INDEX idx_supplier_name (supplier_name),
    INDEX idx_supplier_type (supplier_type),
    INDEX idx_is_qualified (is_qualified)
) COMMENT = '供应商表';

-- 供应商资质表
CREATE TABLE IF NOT EXISTS supplier_qualifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL COMMENT '供应商ID',
    qualification_name VARCHAR(200) NOT NULL COMMENT '资质名称',
    qualification_type VARCHAR(50) COMMENT '资质类型',
    certificate_no VARCHAR(100) COMMENT '证书编号',
    issue_date DATE COMMENT '发证日期',
    expiry_date DATE COMMENT '有效期至',
    file_path VARCHAR(500) COMMENT '附件路径',
    remark TEXT COMMENT '备注',
    created_by INT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_expiry_date (expiry_date)
) COMMENT = '供应商资质表';

-- 供应商评价表
CREATE TABLE IF NOT EXISTS supplier_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL COMMENT '供应商ID',
    evaluation_date DATE COMMENT '评价日期',
    evaluation_period VARCHAR(50) COMMENT '评价周期',
    quality_score DECIMAL(5, 2) COMMENT '质量评分',
    delivery_score DECIMAL(5, 2) COMMENT '交货评分',
    service_score DECIMAL(5, 2) COMMENT '服务评分',
    price_score DECIMAL(5, 2) COMMENT '价格评分',
    total_score DECIMAL(5, 2) COMMENT '综合评分',
    evaluation_result VARCHAR(50) COMMENT '评价结果（优秀/良好/合格/不合格）',
    evaluator INT COMMENT '评价人',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_evaluation_date (evaluation_date)
) COMMENT = '供应商评价表';
