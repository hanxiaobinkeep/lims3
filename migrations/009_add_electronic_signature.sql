-- 电子签名相关表
-- 创建时间: 2026-05-29

-- 电子签名配置表
CREATE TABLE IF NOT EXISTS electronic_signatures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  signature_image VARCHAR(500) COMMENT '签名图片路径',
  signature_type ENUM('approval', 'review', 'verification', 'cancellation') NOT NULL DEFAULT 'approval' COMMENT '签名类型:批准/复核/审核/撤销',
  password_hash VARCHAR(255) NOT NULL COMMENT '签名密码哈希',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_user_type (user_id, signature_type),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子签名配置表';

-- 电子签名记录表
CREATE TABLE IF NOT EXISTS signature_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_type VARCHAR(50) NOT NULL COMMENT '记录类型:report/report_result/data_review/instrument_calibration等',
  record_id INT NOT NULL COMMENT '关联记录ID',
  signature_type ENUM('approval', 'review', 'verification', 'cancellation') NOT NULL COMMENT '签名类型',
  signer_id INT NOT NULL COMMENT '签名人ID',
  signer_name VARCHAR(100) NOT NULL COMMENT '签名人姓名',
  signature_hash VARCHAR(255) NOT NULL COMMENT '签名哈希值',
  signature_image VARCHAR(500) COMMENT '签名图片路径',
  ip_address VARCHAR(50) COMMENT '签名IP地址',
  user_agent TEXT COMMENT '浏览器User-Agent',
  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '签名时间',
  remark TEXT COMMENT '签名说明',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_record (record_type, record_id),
  INDEX idx_signer_id (signer_id),
  INDEX idx_signed_at (signed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子签名记录表';

-- 签名验证表（用于验证签名完整性）
CREATE TABLE IF NOT EXISTS signature_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  signature_record_id INT NOT NULL COMMENT '签名记录ID',
  verified_content TEXT NOT NULL COMMENT '被签名的原始内容',
  verification_hash VARCHAR(255) NOT NULL COMMENT '验证哈希值',
  is_valid BOOLEAN DEFAULT TRUE COMMENT '是否有效',
  verified_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '验证时间',
  INDEX idx_signature_record_id (signature_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签名验证表';
