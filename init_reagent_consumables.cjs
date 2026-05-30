const mysql = require('mysql2/promise');

async function initReagentConsumables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建试剂耗材管理相关表...');

    // 先删除旧表（如果存在）
    await connection.execute('DROP TABLE IF EXISTS reagent_return_records');
    await connection.execute('DROP TABLE IF EXISTS reagent_out_records');
    await connection.execute('DROP TABLE IF EXISTS reagent_in_records');
    await connection.execute('DROP TABLE IF EXISTS solution_preparations');
    await connection.execute('DROP TABLE IF EXISTS reagent_consumables');

    console.log('旧表删除成功！');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/013_add_reagent_consumables.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('试剂耗材管理相关表创建成功！');

    // 插入示例试剂数据
    const insertReagent = `
      INSERT INTO reagent_consumables (
        reagent_code, reagent_name, category, specification, unit, brand, cas_number, 
        grade, storage_condition, is_hazardous, is_controlled, minimum_stock, current_stock, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertReagent, [
      'RG20260001',
      '乙腈',
      '有机溶剂',
      '500mL',
      '瓶',
      'Sigma-Aldrich',
      '75-05-8',
      'HPLC级',
      '2-8℃冷藏',
      true,
      false,
      5,
      12,
      '液相色谱流动相'
    ]);

    await connection.execute(insertReagent, [
      'RG20260002',
      '甲醇',
      '有机溶剂',
      '500mL',
      '瓶',
      'Sigma-Aldrich',
      '67-56-1',
      'HPLC级',
      '2-8℃冷藏',
      true,
      false,
      8,
      15,
      '液相色谱流动相'
    ]);

    await connection.execute(insertReagent, [
      'RG20260003',
      '氢氧化钠',
      '无机试剂',
      '500g',
      '瓶',
      '国药集团',
      '1310-73-2',
      'AR级',
      '常温干燥',
      true,
      false,
      10,
      6,
      '标准滴定液配制'
    ]);

    await connection.execute(insertReagent, [
      'RG20260004',
      '硝酸银',
      '无机试剂',
      '100g',
      '瓶',
      '国药集团',
      '7761-88-8',
      'AR级',
      '避光保存',
      true,
      true,
      3,
      4,
      '滴定分析用，管制药品'
    ]);

    await connection.execute(insertReagent, [
      'RG20260005',
      '酚酞指示剂',
      '指示剂',
      '25g',
      '瓶',
      '国药集团',
      '77-09-8',
      'AR级',
      '常温保存',
      false,
      false,
      5,
      8,
      '酸碱滴定指示剂'
    ]);

    console.log('示例试剂数据插入成功！');

    // 获取试剂ID
    const [reagentRows] = await connection.execute('SELECT id FROM reagent_consumables ORDER BY id');
    const reagentIds = reagentRows.map(r => r.id);

    if (reagentIds.length > 0) {
      // 插入入库记录
      const insertInRecord = `
        INSERT INTO reagent_in_records (
          reagent_id, batch_number, quantity, unit, receive_date, expiry_date, 
          inspection_status, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertInRecord, [
        reagentIds[0],
        'Lot20260501',
        6,
        '瓶',
        '2026-05-01',
        '2027-05-01',
        'completed',
        '验收合格'
      ]);

      await connection.execute(insertInRecord, [
        reagentIds[1],
        'Lot20260502',
        8,
        '瓶',
        '2026-05-02',
        '2027-05-02',
        'completed',
        '验收合格'
      ]);

      console.log('示例入库记录插入成功！');

      // 插入配制记录
      const insertSolution = `
        INSERT INTO solution_preparations (
          solution_name, solution_type, formula, concentration, preparation_date, 
          volume, unit, expiry_date, storage_location, is_standard, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertSolution, [
        '0.1mol/L氢氧化钠标准滴定液',
        '滴定液',
        'NaOH 4.0g + 纯化水 1000mL',
        '0.1012 mol/L',
        '2026-05-01 10:00:00',
        1000,
        'mL',
        '2026-05-15',
        '试剂柜B-1',
        true,
        '用于酸碱滴定分析'
      ]);

      await connection.execute(insertSolution, [
        '乙腈-水流动相(60:40)',
        '流动相',
        '乙腈 600mL + 水 400mL',
        '60:40',
        '2026-05-01 14:00:00',
        1000,
        'mL',
        '2026-05-02',
        '试剂柜A-2',
        false,
        '用于HPLC分析'
      ]);

      console.log('示例溶液配制记录插入成功！');
    }

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initReagentConsumables();
