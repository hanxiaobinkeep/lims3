const mysql = require('mysql2/promise');

async function initIntermediateCheck() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建期间核查管理相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/016_add_intermediate_check.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('期间核查管理相关表创建成功！');

    // 插入示例期间核查计划数据
    const insertPlan = `
      INSERT INTO intermediate_check_plans (
        plan_code, plan_name, instrument_name, instrument_code, check_item, check_method,
        check_frequency, check_criteria, tolerance_range, responsible_person, responsible_name,
        plan_date, next_check_date, status, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertPlan, [
      'IC-2026-001',
      '高效液相色谱仪期间核查',
      '高效液相色谱仪',
      'HPLC-001',
      '保留时间重复性、峰面积重复性',
      '连续进样6次，计算RSD',
      '每季度',
      '保留时间RSD≤1.0%，峰面积RSD≤2.0%',
      '±2%',
      1,
      '系统管理员',
      '2026-01-01',
      '2026-04-01',
      'active',
      'HPLC仪器期间核查计划'
    ]);

    await connection.execute(insertPlan, [
      'IC-2026-002',
      '气相色谱仪期间核查',
      '气相色谱仪',
      'GC-001',
      '保留时间重复性、峰面积重复性',
      '连续进样6次，计算RSD',
      '每季度',
      '保留时间RSD≤1.0%，峰面积RSD≤2.0%',
      '±2%',
      1,
      '系统管理员',
      '2026-01-01',
      '2026-04-01',
      'active',
      'GC仪器期间核查计划'
    ]);

    await connection.execute(insertPlan, [
      'IC-2026-003',
      '电子天平期间核查',
      '电子天平',
      'BAL-001',
      '称量重复性、示值误差',
      '使用标准砝码进行核查',
      '每月',
      '重复性≤0.1mg，示值误差±0.5mg',
      '±0.5mg',
      1,
      '系统管理员',
      '2026-01-01',
      '2026-02-01',
      'active',
      '天平期间核查计划'
    ]);

    console.log('示例期间核查计划数据插入成功！');

    // 获取计划ID
    const [planRows] = await connection.execute('SELECT id FROM intermediate_check_plans ORDER BY id');
    const planIds = planRows.map(r => r.id);

    if (planIds.length > 0) {
      // 插入示例核查记录数据
      const insertRecord = `
        INSERT INTO intermediate_check_records (
          plan_id, check_code, check_date, checker, checker_name, check_result,
          reference_value, deviation, deviation_percentage, is_within_tolerance,
          conclusion, conclusion_comment, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertRecord, [
        planIds[0],
        'IC-2026-001-01',
        '2026-01-15',
        1,
        '系统管理员',
        0.85,
        0.80,
        0.05,
        6.25,
        true,
        '合格',
        '保留时间RSD为0.85%，在允差范围内',
        'approved'
      ]);

      await connection.execute(insertRecord, [
        planIds[0],
        'IC-2026-001-02',
        '2026-02-15',
        1,
        '系统管理员',
        1.25,
        0.80,
        0.45,
        56.25,
        false,
        '不合格',
        '保留时间RSD为1.25%，超出允差范围，需要调整仪器参数',
        'pending'
      ]);

      await connection.execute(insertRecord, [
        planIds[2],
        'IC-2026-003-01',
        '2026-01-10',
        1,
        '系统管理员',
        0.02,
        0.00,
        0.02,
        null,
        true,
        '合格',
        '示值误差为0.02mg，在允差范围内',
        'approved'
      ]);

      console.log('示例期间核查记录数据插入成功！');
    }

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initIntermediateCheck();
