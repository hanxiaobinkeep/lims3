-- 存样地点管理表
-- 支持分级管理：房间-柜号-层号-格子

CREATE TABLE IF NOT EXISTS storage_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_code VARCHAR(50) NOT NULL UNIQUE COMMENT '存样地点编码',
    room VARCHAR(50) NOT NULL COMMENT '房间',
    cabinet VARCHAR(50) NOT NULL COMMENT '柜号',
    shelf VARCHAR(50) NOT NULL COMMENT '层号',
    box VARCHAR(50) NOT NULL COMMENT '格子/盒号',
    location_type ENUM('raw', 'finished', 'stability', 'environmental', 'other') DEFAULT 'other' COMMENT '存样类型：原料、成品、稳定性、环境、其他',
    capacity INT DEFAULT 1 COMMENT '容量',
    current_count INT DEFAULT 0 COMMENT '当前存放数量',
    temperature VARCHAR(20) COMMENT '温度条件',
    humidity VARCHAR(20) COMMENT '湿度条件',
    status ENUM('active', 'full', 'maintenance', 'inactive') DEFAULT 'active' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT COMMENT '创建人ID',
    UNIQUE KEY uk_location (room, cabinet, shelf, box)
);

-- 存样记录表（记录样品存放位置变更历史）
CREATE TABLE IF NOT EXISTS storage_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sample_id INT NOT NULL COMMENT '样品ID',
    location_id INT NOT NULL COMMENT '存样地点ID',
    storage_type ENUM('raw', 'finished', 'stability', 'environmental', 'other') DEFAULT 'other' COMMENT '存样类型',
    quantity DECIMAL(10,2) COMMENT '存放数量',
    unit VARCHAR(20) COMMENT '单位',
    stored_by INT COMMENT '存放人ID',
    stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '存放时间',
    retrieved_by INT COMMENT '取走人ID',
    retrieved_at TIMESTAMP NULL COMMENT '取走时间',
    status ENUM('stored', 'retrieved', 'expired') DEFAULT 'stored' COMMENT '状态',
    remark TEXT COMMENT '备注',
    FOREIGN KEY (sample_id) REFERENCES samples(id),
    FOREIGN KEY (location_id) REFERENCES storage_locations(id)
);

-- 插入示例数据
INSERT INTO storage_locations (location_code, room, cabinet, shelf, box, location_type, capacity, temperature, humidity, status, remark) VALUES
('L-A01-01-01', '留样室A', 'A01', '01', '01', 'raw', 10, '常温', '≤60%RH', 'active', '原料留样区'),
('L-A01-01-02', '留样室A', 'A01', '01', '02', 'raw', 10, '常温', '≤60%RH', 'active', '原料留样区'),
('L-A01-02-01', '留样室A', 'A01', '02', '01', 'finished', 10, '常温', '≤60%RH', 'active', '成品留样区'),
('L-A01-02-02', '留样室A', 'A01', '02', '02', 'finished', 10, '常温', '≤60%RH', 'active', '成品留样区'),
('L-B01-01-01', '稳定性实验室', 'B01', '01', '01', 'stability', 5, '25°C', '60%RH', 'active', '长期试验'),
('L-B01-01-02', '稳定性实验室', 'B01', '01', '02', 'stability', 5, '40°C', '75%RH', 'active', '加速试验'),
('L-C01-01-01', '环境样品室', 'C01', '01', '01', 'environmental', 20, '2-8°C', '≤60%RH', 'active', '环境样品存储'),
('L-C01-01-02', '环境样品室', 'C01', '01', '02', 'environmental', 20, '2-8°C', '≤60%RH', 'active', '环境样品存储');
