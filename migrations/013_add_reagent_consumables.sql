-- 试剂耗材管理相关表
-- 创建时间: 2026-05-29

-- 试剂耗材基本信息表
CREATE TABLE IF NOT EXISTS reagent_consumables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reagent_code VARCHAR(50) NOT NULL UNIQUE COMMENT '试剂编码',
  reagent_name VARCHAR(200) NOT NULL COMMENT '试剂名称',
  category VARCHAR(100) COMMENT '分类',
  specification VARCHAR(100) COMMENT '规格',
  unit VARCHAR(50) COMMENT '单位',
  brand VARCHAR(100) COMMENT '品牌',
  cas_number VARCHAR(50) COMMENT 'CAS号',
  grade VARCHAR(50) COMMENT '级别',
  storage_condition VARCHAR(200) COMMENT '存储条件',
  is_hazardous BOOLEAN DEFAULT FALSE COMMENT '是否危险品',
  is_controlled BOOLEAN DEFAULT FALSE COMMENT '是否管制药品',
  safety_info TEXT COMMENT '安全信息',
  minimum_stock DECIMAL(10,2) COMMENT '最低库存',
  current_stock DECIMAL(10,2) DEFAULT 0 COMMENT '当前库存',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_reagent_code (reagent_code),
  INDEX idx_category (category),
  INDEX idx_is_hazardous (is_hazardous),
  INDEX idx_is_controlled (is_controlled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试剂耗材基本信息表';

-- 试剂耗材入库记录表
CREATE TABLE IF NOT EXISTS reagent_in_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reagent_id INT NOT NULL COMMENT '试剂ID',
  batch_number VARCHAR(100) COMMENT '批号',
  quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
  unit VARCHAR(50) COMMENT '单位',
  receive_date DATE COMMENT '接收日期',
  expiry_date DATE COMMENT '有效期',
  supplier_id INT COMMENT '供应商ID',
  certificate_file VARCHAR(500) COMMENT '证书文件',
  inspection_status VARCHAR(50) DEFAULT 'pending' COMMENT '验收状态',
  inspection_date DATE COMMENT '验收日期',
  inspector INT COMMENT '验收人',
  inspection_result TEXT COMMENT '验收结果',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_reagent_id (reagent_id),
  INDEX idx_batch_number (batch_number),
  INDEX idx_expiry_date (expiry_date),
  CONSTRAINT fk_in_reagent FOREIGN KEY (reagent_id) REFERENCES reagent_consumables(id) ON DELETE CASCADE,
  CONSTRAINT fk_in_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试剂耗材入库记录表';

-- 试剂耗材领用记录表
CREATE TABLE IF NOT EXISTS reagent_out_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reagent_id INT NOT NULL COMMENT '试剂ID',
  in_record_id INT COMMENT '入库记录ID',
  quantity DECIMAL(10,2) NOT NULL COMMENT '领用数量',
  unit VARCHAR(50) COMMENT '单位',
  purpose VARCHAR(200) COMMENT '用途',
  out_date DATETIME COMMENT '领用日期',
  user_id INT COMMENT '领用人',
  user_name VARCHAR(100) COMMENT '领用人姓名',
  confirm_user_id INT COMMENT '确认人ID',
  confirm_user_name VARCHAR(100) COMMENT '确认人姓名',
  confirm_date DATETIME COMMENT '确认日期',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_reagent_id (reagent_id),
  INDEX idx_user_id (user_id),
  INDEX idx_out_date (out_date),
  INDEX idx_status (status),
  CONSTRAINT fk_out_reagent FOREIGN KEY (reagent_id) REFERENCES reagent_consumables(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试剂耗材领用记录表';

-- 试剂耗材归还记录表
CREATE TABLE IF NOT EXISTS reagent_return_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reagent_id INT NOT NULL COMMENT '试剂ID',
  out_record_id INT COMMENT '领用记录ID',
  quantity DECIMAL(10,2) NOT NULL COMMENT '归还数量',
  unit VARCHAR(50) COMMENT '单位',
  return_date DATETIME COMMENT '归还日期',
  user_id INT COMMENT '归还人',
  user_name VARCHAR(100) COMMENT '归还人姓名',
  receiver_id INT COMMENT '接收人ID',
  receiver_name VARCHAR(100) COMMENT '接收人姓名',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_reagent_id (reagent_id),
  INDEX idx_out_record_id (out_record_id),
  INDEX idx_return_date (return_date),
  CONSTRAINT fk_return_reagent FOREIGN KEY (reagent_id) REFERENCES reagent_consumables(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试剂耗材归还记录表';

-- 试液/流动相/滴定液配制表
CREATE TABLE IF NOT EXISTS solution_preparations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solution_name VARCHAR(200) NOT NULL COMMENT '溶液名称',
  solution_type VARCHAR(50) COMMENT '溶液类型',
  formula TEXT COMMENT '配方',
  concentration VARCHAR(100) COMMENT '浓度',
  preparation_date DATETIME COMMENT '配制日期',
  prepared_by INT COMMENT '配制人',
  prepared_name VARCHAR(100) COMMENT '配制人姓名',
  volume DECIMAL(10,2) COMMENT '配制体积',
  unit VARCHAR(50) COMMENT '单位',
  expiry_date DATE COMMENT '有效期',
  storage_location VARCHAR(200) COMMENT '存放地点',
  calibration_date DATE COMMENT '标定日期',
  calibrated_by INT COMMENT '标定人',
  calibration_result TEXT COMMENT '标定结果',
  is_standard BOOLEAN DEFAULT FALSE COMMENT '是否标准溶液',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_solution_name (solution_name),
  INDEX idx_solution_type (solution_type),
  INDEX idx_preparation_date (preparation_date),
  INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试液/流动相/滴定液配制表';
