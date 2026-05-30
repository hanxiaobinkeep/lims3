const mysql = require('mysql2/promise');

async function initQualityControl() {
  const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'lvba123456',
  database: 'lims_db'
});

  try {
    console.log('开始创建质量控制相关表...');

    // 读取并执行SQL文件
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/010_add_quality_control.sql'), 'utf8');
    
    // 分割SQL语句并执行
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('质量控制相关表创建成功！');

    // 插入示例质控计划
    const insertPlan = `
      INSERT INTO qc_plans (plan_name, plan_type, inspection_item, chart_type, sample_size, 
        sample_interval, center_line, upper_control_limit, lower_control_limit, 
        upper_spec_limit, lower_spec_limit, target_value, unit, description, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertPlan, [
      '产品纯度控制图',
      'control_chart',
      '纯度',
      'x_bar_r',
      5,
      '4小时',
      99.5,
      99.8,
      99.2,
      100.0,
      99.0,
      99.5,
      '%',
      '产品纯度质量控制图',
      'active',
      1
    ]);

    await connection.execute(insertPlan, [
      '水分含量控制图',
      'control_chart',
      '水分',
      'x_bar_s',
      3,
      '每天',
      0.3,
      0.5,
      0.1,
      0.6,
      0.05,
      0.3,
      '%',
      '产品水分质量控制图',
      'active',
      1
    ]);

    console.log('示例质控计划插入成功！');

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initQualityControl();