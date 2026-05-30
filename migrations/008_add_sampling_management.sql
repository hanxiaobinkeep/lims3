-- 取样管理相关表
-- 创建时间: 2026-05-29

-- 取样记录表
CREATE TABLE IF NOT EXISTS sampling_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL COMMENT '请验单ID',
  sample_no VARCHAR(50) NOT NULL COMMENT '样品编号',
  sample_name VARCHAR(200) NOT NULL COMMENT '样品名称',
  batch_no VARCHAR(100) COMMENT '批号',
  sampling_person_id INT NOT NULL COMMENT '取样人ID',
  sampling_time DATETIME NOT NULL COMMENT '取样时间',
  sampling_quantity DECIMAL(10, 2) NOT NULL COMMENT '取样量',
  sampling_unit VARCHAR(20) NOT NULL COMMENT '取样单位',
  sampling_location VARCHAR(200) COMMENT '取样地点',
  sampling_method TEXT COMMENT '取样方法',
  storage_location VARCHAR(200) COMMENT '存放地点',
  status ENUM('pending', 'sampled', 'received', 'rejected') DEFAULT 'pending' COMMENT '状态:待取样/已取样/已接收/已拒收',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_request_id (request_id),
  INDEX idx_sample_no (sample_no),
  INDEX idx_status (status),
  INDEX idx_sampling_time (sampling_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='取样记录表';

-- 样品交接记录表
CREATE TABLE IF NOT EXISTS sample_handover_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sampling_record_id INT NOT NULL COMMENT '取样记录ID',
  handover_type ENUM('sampling_to_lab', 'lab_to_storage', 'storage_to_test') NOT NULL COMMENT '交接类型:取样到实验室/实验室到存储/存储到检验',
  from_person_id INT NOT NULL COMMENT '移交人ID',
  to_person_id INT NOT NULL COMMENT '接收人ID',
  handover_time DATETIME NOT NULL COMMENT '交接时间',
  handover_quantity DECIMAL(10, 2) COMMENT '交接数量',
  handover_status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending' COMMENT '交接状态:待接收/已完成/已拒收',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_sampling_record_id (sampling_record_id),
  INDEX idx_handover_time (handover_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='样品交接记录表';

-- 样品标签打印记录表
CREATE TABLE IF NOT EXISTS label_print_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sampling_record_id INT NOT NULL COMMENT '取样记录ID',
  label_type ENUM('sample', 'qc', 'stability') DEFAULT 'sample' COMMENT '标签类型:样品标签/质控标签/稳定性标签',
  print_count INT DEFAULT 0 COMMENT '打印次数',
  printed_by INT COMMENT '打印人ID',
  print_time DATETIME COMMENT '打印时间',
  label_content TEXT COMMENT '标签内容(JSON格式)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_sampling_record_id (sampling_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='样品标签打印记录表';
