const mysql = require('mysql2/promise');

async function initWorkflow() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建工作流相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/011_add_workflow.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('工作流相关表创建成功！');

    // 插入示例工作流定义
    const insertWorkflow = `
      INSERT INTO workflows (workflow_code, workflow_name, workflow_type, description, nodes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // 检验审核工作流
    const inspectionNodes = JSON.stringify([
      { id: 'start', name: '开始', type: 'start', next: 'submit' },
      { id: 'submit', name: '提交审核', type: 'task', assigneeType: 'user', next: 'review' },
      { id: 'review', name: '复核', type: 'approval', assigneeType: 'role', role: 'reviewer', next: 'approve' },
      { id: 'approve', name: '批准', type: 'approval', assigneeType: 'role', role: 'approver', next: 'end' },
      { id: 'end', name: '结束', type: 'end' }
    ]);

    await connection.execute(insertWorkflow, [
      'WF_INSPECTION',
      '检验审核工作流',
      'inspection',
      '检验结果的审核批准工作流',
      inspectionNodes,
      1
    ]);

    // 报告签发工作流
    const reportNodes = JSON.stringify([
      { id: 'start', name: '开始', type: 'start', next: 'draft' },
      { id: 'draft', name: '编制报告', type: 'task', assigneeType: 'user', next: 'review' },
      { id: 'review', name: '审核报告', type: 'approval', assigneeType: 'role', role: 'reviewer', next: 'approve' },
      { id: 'approve', name: '批准签发', type: 'approval', assigneeType: 'role', role: 'approver', next: 'sign' },
      { id: 'sign', name: '电子签名', type: 'signature', signatureType: 'report_approval', next: 'end' },
      { id: 'end', name: '结束', type: 'end' }
    ]);

    await connection.execute(insertWorkflow, [
      'WF_REPORT',
      '报告签发工作流',
      'report',
      '检验报告的编制、审核和签发工作流',
      reportNodes,
      1
    ]);

    // 偏差调查工作流
    const deviationNodes = JSON.stringify([
      { id: 'start', name: '开始', type: 'start', next: 'report' },
      { id: 'report', name: '偏差报告', type: 'task', assigneeType: 'user', next: 'preliminary' },
      { id: 'preliminary', name: '初步调查', type: 'approval', assigneeType: 'role', role: 'investigator', next: 'judge' },
      { id: 'judge', name: '调查判断', type: 'gateway', conditions: [
        { expression: 'needFullInvestigation', next: 'full' }
      ], defaultNext: 'close' },
      { id: 'full', name: '全面调查', type: 'approval', assigneeType: 'role', role: 'qa_manager', next: 'close' },
      { id: 'close', name: '关闭调查', type: 'task', assigneeType: 'user', next: 'end' },
      { id: 'end', name: '结束', type: 'end' }
    ]);

    await connection.execute(insertWorkflow, [
      'WF_DEVIATION',
      '偏差调查工作流',
      'deviation',
      '偏差调查的完整工作流程',
      deviationNodes,
      1
    ]);

    console.log('示例工作流定义插入成功！');

    // 插入审批配置
    const insertConfig = `
      INSERT INTO approval_configs (business_type, business_action, workflow_id, approval_levels)
      VALUES (?, ?, ?, ?)
    `;

    await connection.execute(insertConfig, ['inspection_result', 'review', 1, 1]);
    await connection.execute(insertConfig, ['inspection_result', 'approve', 2, 2]);
    await connection.execute(insertConfig, ['report', 'generate', 1, 1]);
    await connection.execute(insertConfig, ['report', 'approve', 2, 2]);
    await connection.execute(insertConfig, ['deviation', 'investigate', 1, 1]);

    console.log('审批配置插入成功！');

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initWorkflow();
