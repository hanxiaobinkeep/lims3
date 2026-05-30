const mysql = require('mysql2/promise');

async function initStatisticsReports() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建查询统计与报表管理相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/017_add_statistics_reports.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('查询统计与报表管理相关表创建成功！');

    // 插入示例报表模板数据
    const insertTemplate = `
      INSERT INTO report_templates (
        template_code, template_name, template_type, category, description,
        query_sql, parameters, layout_config, chart_type, is_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertTemplate, [
      'RPT-001',
      '月度检验任务统计报表',
      '统计报表',
      '检验业务',
      '统计每月检验任务完成情况',
      'SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM inspection_tasks GROUP BY month ORDER BY month DESC LIMIT 12',
      '{"period": {"type": "month", "default": "current"}}',
      '{"columns": [{"field": "month", "title": "月份"}, {"field": "total", "title": "任务总数"}, {"field": "completed", "title": "已完成"}]}',
      'bar',
      true
    ]);

    await connection.execute(insertTemplate, [
      'RPT-002',
      '样品检验周期分析报表',
      '分析报表',
      '检验业务',
      '分析样品从接收到报告发出的周期',
      'SELECT sample_code, sample_name, DATEDIFF(report_date, receive_date) as cycle_days FROM samples WHERE report_date IS NOT NULL ORDER BY cycle_days DESC LIMIT 50',
      '{"limit": {"type": "number", "default": 50}}',
      '{"columns": [{"field": "sample_code", "title": "样品编号"}, {"field": "sample_name", "title": "样品名称"}, {"field": "cycle_days", "title": "周期天数"}]}',
      'table',
      true
    ]);

    await connection.execute(insertTemplate, [
      'RPT-003',
      '仪器设备使用率报表',
      '统计报表',
      '资源管理',
      '统计仪器设备的使用情况',
      'SELECT i.instrument_name, i.instrument_code, COUNT(t.id) as usage_count, SUM(t.test_duration) as total_hours FROM instruments i LEFT JOIN inspection_tasks t ON i.id = t.instrument_id GROUP BY i.id ORDER BY usage_count DESC',
      '{}',
      '{"columns": [{"field": "instrument_name", "title": "仪器名称"}, {"field": "instrument_code", "title": "仪器编号"}, {"field": "usage_count", "title": "使用次数"}, {"field": "total_hours", "title": "总时长(小时)"}]}',
      'pie',
      true
    ]);

    console.log('示例报表模板数据插入成功！');

    // 插入示例统计指标配置数据
    const insertIndicator = `
      INSERT INTO statistics_configs (
        indicator_code, indicator_name, indicator_type, category, description,
        calculation_method, query_sql, display_format, refresh_frequency, is_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertIndicator, [
      'IND-001',
      '本月检验任务完成率',
      '完成率',
      '检验业务',
      '统计本月检验任务的完成情况',
      '已完成任务数/总任务数*100%',
      'SELECT ROUND(SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as completion_rate FROM inspection_tasks WHERE DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")',
      'percentage',
      'daily',
      true
    ]);

    await connection.execute(insertIndicator, [
      'IND-002',
      '本月样品检验数量',
      '数量',
      '检验业务',
      '统计本月检验的样品数量',
      'COUNT',
      'SELECT COUNT(*) as sample_count FROM samples WHERE DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")',
      'number',
      'daily',
      true
    ]);

    await connection.execute(insertIndicator, [
      'IND-003',
      '平均检验周期',
      '平均值',
      '检验业务',
      '统计样品平均检验周期',
      'AVG(DATEDIFF(report_date, receive_date))',
      'SELECT ROUND(AVG(DATEDIFF(report_date, receive_date)), 1) as avg_cycle FROM samples WHERE report_date IS NOT NULL AND DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")',
      'number',
      'weekly',
      true
    ]);

    await connection.execute(insertIndicator, [
      'IND-004',
      '不合格样品率',
      '比率',
      '质量管理',
      '统计不合格样品占比',
      '不合格样品数/总样品数*100%',
      'SELECT ROUND(SUM(CASE WHEN result_status = "不合格" THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as failure_rate FROM samples WHERE DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")',
      'percentage',
      'weekly',
      true
    ]);

    await connection.execute(insertIndicator, [
      'IND-005',
      '仪器设备完好率',
      '完好率',
      '资源管理',
      '统计仪器设备完好情况',
      '完好仪器数/总仪器数*100%',
      'SELECT ROUND(SUM(CASE WHEN status = "正常" THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as good_rate FROM instruments',
      'percentage',
      'monthly',
      true
    ]);

    console.log('示例统计指标配置数据插入成功！');

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initStatisticsReports();
