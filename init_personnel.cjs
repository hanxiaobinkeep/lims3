const mysql = require('mysql2/promise');

async function initPersonnel() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建人员管理相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/012_add_personnel.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('人员管理相关表创建成功！');

    // 插入示例人员数据
    const insertPersonnel = `
      INSERT INTO personnel (employee_no, real_name, gender, phone, email, department, position, entry_date, status, education, major) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertPersonnel, [
      'EMP001',
      '张三',
      '男',
      '13800138001',
      'zhangsan@company.com',
      '质检部',
      'QC主管',
      '2020-01-15',
      'active',
      '本科',
      '分析化学'
    ]);

    await connection.execute(insertPersonnel, [
      'EMP002',
      '李四',
      '女',
      '13800138002',
      'lisi@company.com',
      '质检部',
      '检验员',
      '2021-03-20',
      'active',
      '大专',
      '应用化学'
    ]);

    await connection.execute(insertPersonnel, [
      'EMP003',
      '王五',
      '男',
      '13800138003',
      'wangwu@company.com',
      '质检部',
      '检验员',
      '2019-07-10',
      'active',
      '本科',
      '药学'
    ]);

    console.log('示例人员数据插入成功！');

    // 获取人员ID
    const [personnelRows] = await connection.execute('SELECT id FROM personnel ORDER BY id');
    const personnelIds = personnelRows.map(row => row.id);

    // 插入培训记录
    if (personnelIds.length > 0) {
      const insertTraining = `
        INSERT INTO training_records (personnel_id, training_name, training_type, training_date, training_hours, assessment_result, certificate_no, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertTraining, [
        personnelIds[0],
        '实验室安全管理培训',
        '安全培训',
        '2024-01-10',
        8.0,
        '合格',
        'CERT2024001',
        '2026-01-09'
      ]);

      await connection.execute(insertTraining, [
        personnelIds[0],
        '液相色谱仪操作培训',
        '技能培训',
        '2024-02-15',
        16.0,
        '合格',
        'CERT2024002',
        '2025-02-14'
      ]);

      await connection.execute(insertTraining, [
        personnelIds[1],
        '实验室安全管理培训',
        '安全培训',
        '2024-03-20',
        8.0,
        '合格',
        'CERT2024003',
        '2026-03-19'
      ]);

      console.log('示例培训记录插入成功！');

      // 上岗证记录
      const insertQualification = `
        INSERT INTO qualification_certificates (personnel_id, certificate_name, certificate_type, certificate_no, issue_date, valid_until, status, scope_of_authorization) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertQualification, [
        personnelIds[0],
        '检验员上岗证',
        '上岗证',
        'LIC2024001',
        '2024-01-20',
        '2027-01-19',
        'valid',
        '气相色谱、液相色谱、紫外可见分光光度计操作'
      ]);

      await connection.execute(insertQualification, [
        personnelIds[1],
        '检验员上岗证',
        '上岗证',
        'LIC2024002',
        '2024-04-15',
        '2027-04-14',
        'valid',
        '滴定分析、天平操作、pH测定'
      ]);

      await connection.execute(insertQualification, [
        personnelIds[2],
        '实验室安全员证',
        '上岗证',
        'LIC2024003',
        '2023-06-01',
        '2026-05-31',
        'valid',
        '实验室安全管理、应急处理'
      ]);

      console.log('示例上岗证记录插入成功！');
    }

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initPersonnel();
