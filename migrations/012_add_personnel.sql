-- 人员管理相关表
-- 创建时间: 2026-05-29

-- 人员基本信息表
CREATE TABLE IF NOT EXISTS personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '关联的系统用户ID',
  employee_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工号',
  real_name VARCHAR(100) NOT NULL COMMENT '姓名',
  gender VARCHAR(10) COMMENT '性别',
  birth_date DATE COMMENT '出生日期',
  phone VARCHAR(20) COMMENT '联系电话',
  email VARCHAR(100) COMMENT '邮箱',
  department VARCHAR(100) COMMENT '部门',
  position VARCHAR(100) COMMENT '职位',
  entry_date DATE COMMENT '入职日期',
  status ENUM('active', 'inactive', 'resigned') DEFAULT 'active' COMMENT '状态',
  education VARCHAR(50) COMMENT '学历',
  major VARCHAR(100) COMMENT '专业',
  resume TEXT COMMENT '简历',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_employee_no (employee_no),
  INDEX idx_status (status),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员基本信息表';

-- 培训记录表
CREATE TABLE IF NOT EXISTS training_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personnel_id INT NOT NULL COMMENT '人员ID',
  training_name VARCHAR(200) NOT NULL COMMENT '培训名称',
  training_type VARCHAR(50) COMMENT '培训类型',
  training_content TEXT COMMENT '培训内容',
  training_date DATE COMMENT '培训日期',
  training_hours DECIMAL(5,1) COMMENT '培训时长（小时）',
  trainer VARCHAR(100) COMMENT '培训讲师',
  training_organization VARCHAR(200) COMMENT '培训机构',
  assessment_method VARCHAR(100) COMMENT '考核方式',
  assessment_result VARCHAR(50) COMMENT '考核结果',
  certificate_no VARCHAR(100) COMMENT '证书编号',
  certificate_date DATE COMMENT '证书日期',
  valid_until DATE COMMENT '有效期至',
  certificate_file VARCHAR(500) COMMENT '证书文件',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_personnel_id (personnel_id),
  INDEX idx_training_date (training_date),
  INDEX idx_valid_until (valid_until),
  CONSTRAINT fk_training_personnel FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训记录表';

-- 上岗证管理表
CREATE TABLE IF NOT EXISTS qualification_certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personnel_id INT NOT NULL COMMENT '人员ID',
  certificate_name VARCHAR(200) NOT NULL COMMENT '证书名称',
  certificate_type VARCHAR(50) COMMENT '证书类型',
  certificate_no VARCHAR(100) COMMENT '证书编号',
  certificate_level VARCHAR(50) COMMENT '证书等级',
  issue_date DATE COMMENT '发证日期',
  valid_until DATE COMMENT '有效期至',
  issue_organization VARCHAR(200) COMMENT '发证机构',
  scope_of_authorization TEXT COMMENT '授权范围',
  status ENUM('valid', 'expired', 'revoked') DEFAULT 'valid' COMMENT '状态',
  certificate_file VARCHAR(500) COMMENT '证书文件',
  renewal_date DATE COMMENT '复审日期',
  next_renewal_date DATE COMMENT '下次复审日期',
  remark TEXT COMMENT '备注',
  created_by INT COMMENT '创建人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_personnel_id (personnel_id),
  INDEX idx_certificate_no (certificate_no),
  INDEX idx_status (status),
  INDEX idx_valid_until (valid_until),
  CONSTRAINT fk_qualification_personnel FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上岗证管理表';
