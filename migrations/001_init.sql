CREATE DATABASE IF NOT EXISTS lims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lims_db;

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色编码',
    permissions JSON COMMENT '权限配置',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    role_id INT COMMENT '角色ID',
    department VARCHAR(50) COMMENT '部门',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 物料表
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL COMMENT '物料编码',
    name VARCHAR(100) NOT NULL COMMENT '物料名称',
    category ENUM('raw', 'auxiliary', 'intermediate', 'finished', 'reagent', 'standard') COMMENT '物料分类',
    specification VARCHAR(200) COMMENT '规格',
    cas_no VARCHAR(50) COMMENT 'CAS号',
    supplier VARCHAR(100) COMMENT '供应商',
    stock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '库存数量',
    warning_threshold DECIMAL(10,2) DEFAULT 0 COMMENT '预警阈值',
    expiry_date DATE COMMENT '有效期',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 仪器设备表
CREATE TABLE IF NOT EXISTS instruments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL COMMENT '设备编码',
    name VARCHAR(100) NOT NULL COMMENT '设备名称',
    category ENUM('analytical', 'auxiliary', 'measuring') COMMENT '设备分类',
    model VARCHAR(100) COMMENT '型号',
    manufacturer VARCHAR(100) COMMENT '制造商',
    serial_no VARCHAR(100) COMMENT '序列号',
    location VARCHAR(100) COMMENT '存放位置',
    calibration_date DATE COMMENT '校准日期',
    calibration_due DATE COMMENT '校准到期日',
    status ENUM('active', 'maintenance', 'calibration', 'retired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 检测方法表
CREATE TABLE IF NOT EXISTS methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL COMMENT '方法编码',
    name VARCHAR(200) NOT NULL COMMENT '方法名称',
    category ENUM('national', 'industry', 'enterprise') COMMENT '方法分类',
    version VARCHAR(20) COMMENT '版本号',
    description TEXT COMMENT '方法描述',
    document_url VARCHAR(255) COMMENT '文档链接',
    status ENUM('active', 'obsolete') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 请验单表
CREATE TABLE IF NOT EXISTS inspection_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_no VARCHAR(50) NOT NULL UNIQUE COMMENT '请验单号',
    sample_name VARCHAR(100) NOT NULL COMMENT '样品名称',
    sample_type ENUM('raw', 'auxiliary', 'intermediate', 'finished', 'environmental') COMMENT '样品类型',
    batch_no VARCHAR(50) COMMENT '批号',
    quantity DECIMAL(10,2) COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    request_dept VARCHAR(50) COMMENT '请验部门',
    requester_id INT COMMENT '请验人ID',
    request_date DATE COMMENT '请验日期',
    priority ENUM('high', 'normal', 'low') DEFAULT 'normal',
    status ENUM('pending', 'sampled', 'received', 'testing', 'completed') DEFAULT 'pending',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id)
);

-- 样品表
CREATE TABLE IF NOT EXISTS samples (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sample_no VARCHAR(50) NOT NULL UNIQUE COMMENT '样品编号',
    request_id INT COMMENT '请验单ID',
    sample_name VARCHAR(100) COMMENT '样品名称',
    batch_no VARCHAR(50) COMMENT '批号',
    quantity DECIMAL(10,2) COMMENT '数量',
    storage_location VARCHAR(100) COMMENT '存放位置',
    status ENUM('pending', 'received', 'testing', 'completed', 'retained') DEFAULT 'pending',
    receive_date DATE COMMENT '接收日期',
    receiver_id INT COMMENT '接收人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES inspection_requests(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- 检验任务表
CREATE TABLE IF NOT EXISTS inspection_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_no VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    sample_id INT COMMENT '样品ID',
    test_item VARCHAR(100) COMMENT '检测项目',
    method_id INT COMMENT '方法ID',
    assignee_id INT COMMENT '执行人ID',
    priority ENUM('high', 'normal', 'low') DEFAULT 'normal',
    status ENUM('pending', 'in_progress', 'completed', 'reviewed') DEFAULT 'pending',
    due_date DATE COMMENT '截止日期',
    completed_date DATE COMMENT '完成日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sample_id) REFERENCES samples(id),
    FOREIGN KEY (method_id) REFERENCES methods(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- 检验结果表
CREATE TABLE IF NOT EXISTS inspection_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT COMMENT '任务ID',
    test_item VARCHAR(100) COMMENT '检测项目',
    result VARCHAR(100) COMMENT '结果值',
    unit VARCHAR(20) COMMENT '单位',
    specification VARCHAR(100) COMMENT '规格标准',
    is_oos BOOLEAN DEFAULT FALSE COMMENT '是否超标',
    instrument_id INT COMMENT '使用仪器ID',
    test_date DATE COMMENT '检测日期',
    tester_id INT COMMENT '检测人ID',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES inspection_tasks(id),
    FOREIGN KEY (instrument_id) REFERENCES instruments(id),
    FOREIGN KEY (tester_id) REFERENCES users(id)
);

-- 检验报告表
CREATE TABLE IF NOT EXISTS inspection_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_no VARCHAR(50) NOT NULL UNIQUE COMMENT '报告编号',
    task_id INT COMMENT '任务ID',
    content TEXT COMMENT '报告内容',
    status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'draft',
    issue_date DATE COMMENT '签发日期',
    issuer_id INT COMMENT '签发人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES inspection_tasks(id),
    FOREIGN KEY (issuer_id) REFERENCES users(id)
);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT COMMENT '用户ID',
    action VARCHAR(100) COMMENT '操作类型',
    module VARCHAR(50) COMMENT '操作模块',
    description TEXT COMMENT '操作描述',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 审计追踪表
CREATE TABLE IF NOT EXISTS audit_trails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) COMMENT '表名',
    record_id INT COMMENT '记录ID',
    action VARCHAR(20) COMMENT '操作类型',
    old_values JSON COMMENT '旧值',
    new_values JSON COMMENT '新值',
    user_id INT COMMENT '操作用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化角色数据
INSERT INTO roles (name, code, permissions) VALUES
('系统管理员', 'admin', '["*"]'),
('检验员', 'inspector', '["dashboard", "samples", "inspection", "resources"]'),
('审核员', 'reviewer', '["dashboard", "inspection", "review", "reports"]'),
('批准人', 'approver', '["dashboard", "reports", "approval"]'),
('质量负责人', 'quality_manager', '["dashboard", "stability", "environment", "deviation", "quality"]');

-- 初始化用户数据 (密码: 123456)
INSERT INTO users (username, password, real_name, email, role_id, department, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrzC8hS8r0Z3YJ3F7x8K1L2M3N4O5P', '系统管理员', 'admin@lims.com', 1, 'IT部', 'active'),
('inspector1', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrzC8hS8r0Z3YJ3F7x8K1L2M3N4O5P', '张三', 'zhangsan@lims.com', 2, '质检部', 'active'),
('reviewer1', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrzC8hS8r0Z3YJ3F7x8K1L2M3N4O5P', '李四', 'lisi@lims.com', 3, '质检部', 'active'),
('approver1', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrzC8hS8r0Z3YJ3F7x8K1L2M3N4O5P', '王五', 'wangwu@lims.com', 4, '质检部', 'active'),
('quality1', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrzC8hS8r0Z3YJ3F7x8K1L2M3N4O5P', '赵六', 'zhaoliu@lims.com', 5, '质量部', 'active');

-- 初始化物料数据
INSERT INTO materials (code, name, category, specification, cas_no, supplier, stock_quantity, warning_threshold, status) VALUES
('M001', '高效氯氟氰菊酯原药', 'raw', '95%', '91465-08-6', '供应商A', 1000, 100, 'active'),
('M002', '乳油溶剂', 'auxiliary', '工业级', 'NULL', '供应商B', 500, 50, 'active'),
('M003', '2.5%高效氯氟氰菊酯乳油', 'finished', '2.5%', 'NULL', '内部', 2000, 200, 'active'),
('M004', '甲醇', 'reagent', 'HPLC级', '67-56-1', '供应商C', 100, 20, 'active'),
('M005', '标准品-高效氯氟氰菊酯', 'standard', '99.5%', '91465-08-6', '供应商D', 10, 2, 'active');

-- 初始化仪器设备数据
INSERT INTO instruments (code, name, category, model, manufacturer, serial_no, location, status) VALUES
('I001', '高效液相色谱仪', 'analytical', '1260 Infinity II', 'Agilent', 'DEABC12345', '仪器室A', 'active'),
('I002', '气相色谱仪', 'analytical', '7890B', 'Agilent', 'DEABC12346', '仪器室A', 'active'),
('I003', '紫外可见分光光度计', 'analytical', 'UV-2600', 'Shimadzu', 'DEABC12347', '仪器室B', 'active'),
('I004', '电子天平', 'measuring', 'XS205', 'Mettler Toledo', 'DEABC12348', '称量室', 'active'),
('I005', 'pH计', 'measuring', 'FE28', 'Mettler Toledo', 'DEABC12349', '理化室', 'active');

-- 初始化方法数据
INSERT INTO methods (code, name, category, version, description, status) VALUES
('M001', '高效氯氟氰菊酯含量测定-HPLC法', 'enterprise', 'V1.0', '采用高效液相色谱法测定高效氯氟氰菊酯含量', 'active'),
('M002', '农药水分测定法', 'national', 'GB/T 1600-2021', '卡尔费休法测定农药水分', 'active'),
('M003', '农药pH值测定法', 'national', 'GB/T 1601-1993', '电位法测定农药pH值', 'active'),
('M004', '乳油稳定性测定法', 'national', 'GB/T 1603-2001', '测定乳油稀释稳定性', 'active'),
('M005', '农药悬浮率测定法', 'national', 'GB/T 14825-2006', '测定农药悬浮率', 'active');

-- 初始化请验单数据
INSERT INTO inspection_requests (request_no, sample_name, sample_type, batch_no, quantity, unit, request_dept, requester_id, request_date, priority, status) VALUES
('R20260529001', '高效氯氟氰菊酯原药', 'raw', 'YP202605001', 500, 'kg', '生产部', 2, '2026-05-29', 'high', 'pending'),
('R20260529002', '2.5%高效氯氟氰菊酯乳油', 'finished', 'CP202605001', 1000, 'L', '生产部', 2, '2026-05-29', 'normal', 'pending'),
('R20260529003', '乳油溶剂', 'auxiliary', 'FJ202605001', 200, 'L', '生产部', 2, '2026-05-29', 'normal', 'pending');
