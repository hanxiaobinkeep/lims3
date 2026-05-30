import mysql from 'mysql2/promise';

async function initReferenceMaterials() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    multipleStatements: true
  });

  try {
    console.log('开始创建标准物质管理相关表...');
    
    // 创建标准物质表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lims_db.reference_materials (
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
      ) COMMENT = '标准物质表'
    `);
    
    // 创建标准物质期间核查表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lims_db.rm_checks (
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
      ) COMMENT = '标准物质期间核查表'
    `);
    
    // 创建标准溶液配制记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lims_db.solution_preparations (
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
      ) COMMENT = '标准溶液配制记录表'
    `);

    // 插入示例数据
    await connection.execute(`
      INSERT INTO lims_db.reference_materials (
        rm_code, rm_name, rm_type, specification, purity, concentration, 
        manufacturer, batch_number, certificate_no, expiry_date, 
        storage_condition, initial_amount, current_amount, unit_amount, status
      ) VALUES (
        'RM001', '邻苯二甲酸氢钾', '标准物质', '100g', 99.99, NULL,
        '中国计量院', '2024001', '2024-1001', '2025-12-31',
        '2-8℃密封保存', 100.00, 95.00, 'g', 'in_stock'
      ), (
        'RM002', 'EDTA标准溶液', '标准溶液', '500mL', NULL, '0.1mol/L',
        '自制', '20240501', 'S2024001', '2024-11-30',
        '常温保存', 500.00, 450.00, 'mL', 'in_stock'
      ) ON DUPLICATE KEY UPDATE rm_name = VALUES(rm_name)
    `);

    console.log('✅ 标准物质管理相关表创建完成！');
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

initReferenceMaterials();
