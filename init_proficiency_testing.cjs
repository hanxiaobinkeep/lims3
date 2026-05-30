const mysql = require('mysql2/promise');

async function initProficiencyTesting() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建能力验证管理相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/015_add_proficiency_testing.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('能力验证管理相关表创建成功！');

    // 插入示例能力验证计划数据
    const insertPlan = `
      INSERT INTO proficiency_testing_plans (
        plan_code, plan_name, organizer, testing_type, testing_items, sample_description,
        plan_date, deadline_date, responsible_person, responsible_name, status, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertPlan, [
      'PT-2026-001',
      '2026年农药残留检测能力验证',
      '中国合格评定国家认可委员会（CNAS）',
      '实验室间比对',
      '有机磷类农药残留、氨基甲酸酯类农药残留',
      '蔬菜基质样品，含有已知浓度的农药残留',
      '2026-03-01',
      '2026-06-30',
      1,
      '系统管理员',
      'completed',
      '年度能力验证计划'
    ]);

    await connection.execute(insertPlan, [
      'PT-2026-002',
      '2026年重金属检测能力验证',
      '国家认证认可监督管理委员会',
      '测量审核',
      '铅、镉、汞、砷',
      '土壤基质样品',
      '2026-04-01',
      '2026-07-31',
      1,
      '系统管理员',
      'in_progress',
      '重金属检测能力验证'
    ]);

    console.log('示例能力验证计划数据插入成功！');

    // 获取计划ID
    const [planRows] = await connection.execute('SELECT id FROM proficiency_testing_plans ORDER BY id');
    const planIds = planRows.map(r => r.id);

    if (planIds.length > 0) {
      // 插入示例结果数据
      const insertResult = `
        INSERT INTO proficiency_testing_results (
          plan_id, sample_code, test_item, test_method, lab_result, reference_value,
          uncertainty, z_score, en_score, evaluation, evaluation_comment, test_date, tester, tester_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertResult, [
        planIds[0],
        'PT-001-A',
        '有机磷类农药残留',
        'GB/T 5009.20-2003',
        0.0523,
        0.0500,
        0.0025,
        0.92,
        0.65,
        'satisfactory',
        '结果满意，Z值在允许范围内',
        '2026-04-15',
        1,
        '系统管理员',
        'approved'
      ]);

      await connection.execute(insertResult, [
        planIds[0],
        'PT-001-B',
        '氨基甲酸酯类农药残留',
        'GB/T 5009.104-2003',
        0.0891,
        0.0800,
        0.0040,
        2.28,
        1.62,
        'unsatisfactory',
        '结果不满意，Z值超出允许范围，需要调查',
        '2026-04-16',
        1,
        '系统管理员',
        'approved'
      ]);

      console.log('示例能力验证结果数据插入成功！');

      // 获取结果ID
      const [resultRows] = await connection.execute('SELECT id FROM proficiency_testing_results WHERE evaluation = ?', ['unsatisfactory']);
      const unsatisfactoryIds = resultRows.map(r => r.id);

      if (unsatisfactoryIds.length > 0) {
        // 插入不满意结果处理记录
        const insertAction = `
          INSERT INTO proficiency_unsatisfactory_actions (
            result_id, action_type, action_description, root_cause, corrective_action,
            preventive_action, responsible_person, responsible_name, deadline, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(insertAction, [
          unsatisfactoryIds[0],
          '调查与纠正',
          '对氨基甲酸酯类农药残留检测结果不满意的调查',
          '标准溶液配制误差，标准品纯度不足',
          '重新配制标准溶液，使用新批号标准品进行复测',
          '加强标准品验收管理，定期核查标准溶液',
          1,
          '系统管理员',
          '2026-05-15',
          'in_progress'
        ]);

        console.log('示例不满意结果处理记录插入成功！');
      }
    }

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initProficiencyTesting();
