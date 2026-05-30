import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getReportTemplates = async (req: Request, res: Response) => {
  try {
    const { category, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM report_templates WHERE 1=1`;
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (keyword) {
      query += ' AND (template_name LIKE ? OR template_code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    query += ` AND is_enabled = true ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

    const [rows]: any = await pool.query(query, params);

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*/, '').replace(/LIMIT.*/, '');
    const countParams = params.slice(0, -2);
    const [countResult]: any = await pool.query(countQuery, countParams);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    console.error('获取报表模板失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getReportTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM report_templates WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '模板不存在', data: null });
    }

    res.json({ code: 200, message: '获取成功', data: rows[0] });
  } catch (error) {
    console.error('获取报表模板详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { template_id, parameters, instance_name } = req.body;

    // 获取模板信息
    const [templates]: any = await pool.execute('SELECT * FROM report_templates WHERE id = ?', [template_id]);
    if (templates.length === 0) {
      return res.status(404).json({ code: 404, message: '模板不存在', data: null });
    }

    const template = templates[0];

    // 执行查询SQL获取数据
    let querySql = template.query_sql;
    // 这里可以添加参数替换逻辑
    
    const [dataRows]: any = await pool.execute(querySql);

    // 生成实例编码
    const instanceCode = `RPT-${Date.now()}`;

    // 保存报表实例
    const [result]: any = await pool.execute(
      `INSERT INTO report_instances (
        template_id, instance_code, instance_name, parameters, result_data,
        file_format, status, generated_by, generated_name, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        template_id, instanceCode, instance_name || template.template_name,
        JSON.stringify(parameters), JSON.stringify(dataRows),
        'json', 'generated', userId, userName
      ]
    );

    res.json({
      code: 200,
      message: '报表生成成功',
      data: {
        id: result.insertId,
        instance_code: instanceCode,
        data: dataRows
      }
    });
  } catch (error) {
    console.error('生成报表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getReportInstances = async (req: Request, res: Response) => {
  try {
    const { template_id, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT r.*, t.template_name FROM report_instances r LEFT JOIN report_templates t ON r.template_id = t.id WHERE 1=1`;
    const params: any[] = [];

    if (template_id) {
      query += ' AND r.template_id = ?';
      params.push(template_id);
    }
    query += ` ORDER BY r.generated_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

    const [rows]: any = await pool.execute(query, params);

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*/, '').replace(/LIMIT.*/, '');
    const countParams = params.slice(0, -2);
    const [countResult]: any = await pool.execute(countQuery, countParams);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    console.error('获取报表实例失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getStatisticsConfigs = async (req: Request, res: Response) => {
  try {
    const { category, keyword } = req.query;

    let query = `SELECT * FROM statistics_configs WHERE is_enabled = true`;
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (keyword) {
      query += ' AND (indicator_name LIKE ? OR indicator_code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    query += ' ORDER BY category, indicator_name';

    const [rows]: any = await pool.execute(query, params);

    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取统计指标配置失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const calculateStatistics = async (req: Request, res: Response) => {
  try {
    const { indicator_id, period_start, period_end } = req.body;

    // 获取指标配置
    const [configs]: any = await pool.execute('SELECT * FROM statistics_configs WHERE id = ?', [indicator_id]);
    if (configs.length === 0) {
      return res.status(404).json({ code: 404, message: '指标不存在', data: null });
    }

    const config = configs[0];

    // 执行查询SQL
    let querySql = config.query_sql;
    // 可以添加日期范围参数替换

    const [resultRows]: any = await pool.execute(querySql);
    const resultData = resultRows[0];

    // 保存统计结果
    const resultValue = resultData[Object.keys(resultData)[0]];
    await pool.execute(
      `INSERT INTO statistics_results (indicator_id, result_value, result_text, period_start, period_end, calculated_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [indicator_id, resultValue, JSON.stringify(resultData), period_start, period_end]
    );

    res.json({
      code: 200,
      message: '计算成功',
      data: resultData
    });
  } catch (error) {
    console.error('计算统计指标失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    // 获取关键业务指标
    const stats: any = {};

    // 本月检验任务统计
    const [taskStats]: any = await pool.execute(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
       FROM inspection_tasks 
       WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
    );
    stats.tasks = taskStats[0];

    // 本月样品统计
    const [sampleStats]: any = await pool.execute(
      `SELECT 
        COUNT(*) as total_samples,
        SUM(CASE WHEN result_status = '合格' THEN 1 ELSE 0 END) as qualified_samples,
        SUM(CASE WHEN result_status = '不合格' THEN 1 ELSE 0 END) as unqualified_samples
       FROM samples 
       WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
    );
    stats.samples = sampleStats[0];

    // 仪器设备统计
    const [instrumentStats]: any = await pool.execute(
      `SELECT 
        COUNT(*) as total_instruments,
        SUM(CASE WHEN status = '正常' THEN 1 ELSE 0 END) as normal_instruments
       FROM instruments`
    );
    stats.instruments = instrumentStats[0];

    // 待处理任务统计
    const [pendingStats]: any = await pool.execute(
      `SELECT 
        COUNT(*) as pending_reviews,
        (SELECT COUNT(*) FROM deviation_investigations WHERE status = 'investigating') as pending_deviations,
        (SELECT COUNT(*) FROM intermediate_check_alerts WHERE is_resolved = false) as pending_alerts
       FROM data_reviews WHERE status = 'pending'`
    );
    stats.pending = pendingStats[0];

    // 最近7天检验任务趋势
    const [taskTrend]: any = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM inspection_tasks 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`
    );
    stats.task_trend = taskTrend;

    res.json({
      code: 200,
      message: '获取成功',
      data: stats
    });
  } catch (error) {
    console.error('获取仪表盘统计失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getStatisticsCategories = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT DISTINCT category FROM statistics_configs WHERE is_enabled = true ORDER BY category'
    );
    res.json({ code: 200, message: '获取成功', data: rows.map((row: any) => row.category) });
  } catch (error) {
    console.error('获取统计分类失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
