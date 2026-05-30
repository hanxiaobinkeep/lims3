const mysql = require('mysql2/promise');

async function initValidationManagement() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建验证管理相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/018_add_validation_management.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('验证管理相关表创建成功！');

    // 插入示例验证计划数据
    const insertPlan = `
      INSERT INTO validation_plans (
        plan_code, plan_name, validation_type, category, description,
        target_system, responsible_person, responsible_name,
        planned_start_date, planned_end_date, status, priority, risk_level,
        validation_scope, acceptance_criteria, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertPlan, [
      'VAL-2026-001',
      '高效液相色谱仪验证',
      '设备验证',
      '分析仪器',
      '对实验室高效液相色谱仪进行IQ/OQ/PQ验证',
      'HPLC-001',
      1,
      '系统管理员',
      '2026-01-01',
      '2026-03-31',
      'in_progress',
      'high',
      '中',
      '安装确认、运行确认、性能确认',
      '所有测试项目符合接受标准',
      '年度验证计划'
    ]);

    await connection.execute(insertPlan, [
      'VAL-2026-002',
      'LIMS系统计算机化系统验证',
      '计算机化系统验证',
      '信息系统',
      '对实验室信息管理系统进行CSV验证',
      'LIMS系统',
      1,
      '系统管理员',
      '2026-02-01',
      '2026-06-30',
      'planned',
      'high',
      '高',
      '功能规范、设计规范、安装确认、运行确认、性能确认',
      '系统功能符合用户需求规范',
      '新建系统验证'
    ]);

    await connection.execute(insertPlan, [
      'VAL-2026-003',
      '电子天平验证',
      '设备验证',
      '计量器具',
      '对实验室电子天平进行IQ/OQ/PQ验证',
      'BAL-001',
      1,
      '系统管理员',
      '2026-01-15',
      '2026-02-28',
      'completed',
      'normal',
      '低',
      '安装确认、运行确认、性能确认',
      '称量精度和重复性符合要求',
      '定期验证'
    ]);

    console.log('示例验证计划数据插入成功！');

    // 获取计划ID
    const [planRows] = await connection.execute('SELECT id FROM validation_plans ORDER BY id');
    const planIds = planRows.map(r => r.id);

    if (planIds.length > 0) {
      // 插入示例验证文档数据
      const insertDocument = `
        INSERT INTO validation_documents (
          plan_id, document_code, document_name, document_type, version,
          content, status, author, author_name, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertDocument, [
        planIds[0],
        'VAL-DOC-001',
        'HPLC验证方案',
        '验证方案',
        '1.0',
        '高效液相色谱仪验证方案，包含IQ/OQ/PQ测试项目...',
        'approved',
        1,
        '系统管理员',
        '验证主文档'
      ]);

      await connection.execute(insertDocument, [
        planIds[0],
        'VAL-DOC-002',
        'HPLC验证报告',
        '验证报告',
        '1.0',
        '高效液相色谱仪验证报告，记录所有测试结果...',
        'draft',
        1,
        '系统管理员',
        '验证总结报告'
      ]);

      console.log('示例验证文档数据插入成功！');

      // 插入示例测试记录数据
      const insertTest = `
        INSERT INTO validation_tests (
          plan_id, test_code, test_name, test_type, test_objective,
          test_procedure, expected_result, actual_result, test_result,
          tester, tester_name, test_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertTest, [
        planIds[0],
        'IQ-001',
        '设备到货检查',
        'IQ',
        '确认设备型号、序列号与采购订单一致',
        '检查设备铭牌信息，核对采购订单',
        '设备型号、序列号与订单一致',
        '设备型号HPLC-2026-001，序列号SN123456，与订单一致',
        'passed',
        1,
        '系统管理员',
        '2026-01-10',
        'approved'
      ]);

      await connection.execute(insertTest, [
        planIds[0],
        'IQ-002',
        '安装环境确认',
        'IQ',
        '确认安装环境符合要求',
        '检查温度、湿度、电源、接地等',
        '温度15-30℃，湿度30-70%，电源220V±10%',
        '温度22℃，湿度55%，电源223V，接地良好',
        'passed',
        1,
        '系统管理员',
        '2026-01-10',
        'approved'
      ]);

      await connection.execute(insertTest, [
        planIds[0],
        'OQ-001',
        '泵流量精度测试',
        'OQ',
        '确认泵流量精度符合要求',
        '设置流量1.0mL/min，收集10分钟流出液，称重计算',
        '流量精度RSD≤1.0%',
        '平均流量0.998mL/min，RSD=0.35%',
        'passed',
        1,
        '系统管理员',
        '2026-01-15',
        'approved'
      ]);

      await connection.execute(insertTest, [
        planIds[0],
        'PQ-001',
        '系统适用性测试',
        'PQ',
        '确认系统性能符合分析要求',
        '使用标准品进行系统适用性测试',
        '理论塔板数≥2000，拖尾因子0.9-1.2',
        '理论塔板数3500，拖尾因子1.05',
        'passed',
        1,
        '系统管理员',
        '2026-01-20',
        'approved'
      ]);

      console.log('示例测试记录数据插入成功！');

      // 插入示例可追溯性矩阵数据
      const insertMatrix = `
        INSERT INTO traceability_matrices (
          plan_id, requirement_id, requirement_description, test_case_id,
          test_case_description, test_result, risk_level, verification_method, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertMatrix, [
        planIds[0],
        'URS-001',
        '系统应能准确控制流量',
        'OQ-001',
        '泵流量精度测试',
        'passed',
        '中',
        '测试',
        'completed'
      ]);

      await connection.execute(insertMatrix, [
        planIds[0],
        'URS-002',
        '系统应具有良好的分离效果',
        'PQ-001',
        '系统适用性测试',
        'passed',
        '高',
        '测试',
        'completed'
      ]);

      console.log('示例可追溯性矩阵数据插入成功！');
    }

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initValidationManagement();
