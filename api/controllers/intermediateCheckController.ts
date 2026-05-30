import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getIntermediateCheckPlans = async (req: Request, res: Response) => {
  try {
    const { status, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM intermediate_check_plans WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      query += ' AND (plan_name LIKE ? OR plan_code LIKE ? OR instrument_name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    query += ` ORDER BY next_check_date ASC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

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
    console.error('获取期间核查计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getIntermediateCheckPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM intermediate_check_plans WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '计划不存在', data: null });
    }

    const plan = rows[0];
    
    // 获取核查记录
    const [records]: any = await pool.execute('SELECT * FROM intermediate_check_records WHERE plan_id = ? ORDER BY check_date DESC', [id]);
    
    // 获取预警记录
    const [alerts]: any = await pool.execute('SELECT * FROM intermediate_check_alerts WHERE plan_id = ? ORDER BY created_at DESC', [id]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...plan,
        records,
        alerts
      }
    });
  } catch (error) {
    console.error('获取期间核查计划详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createIntermediateCheckPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_code, plan_name, instrument_id, instrument_name, instrument_code, check_item,
      check_method, check_frequency, check_criteria, tolerance_range, plan_date, next_check_date, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO intermediate_check_plans (
        plan_code, plan_name, instrument_id, instrument_name, instrument_code, check_item,
        check_method, check_frequency, check_criteria, tolerance_range, responsible_person, responsible_name,
        plan_date, next_check_date, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_code, plan_name, instrument_id, instrument_name, instrument_code, check_item,
        check_method, check_frequency, check_criteria, tolerance_range, userId, userName,
        plan_date, next_check_date, remark, userId
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建期间核查计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateIntermediateCheckPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      plan_code, plan_name, instrument_id, instrument_name, instrument_code, check_item,
      check_method, check_frequency, check_criteria, tolerance_range, plan_date, next_check_date, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE intermediate_check_plans SET
        plan_code = ?, plan_name = ?, instrument_id = ?, instrument_name = ?, instrument_code = ?,
        check_item = ?, check_method = ?, check_frequency = ?, check_criteria = ?, tolerance_range = ?,
        plan_date = ?, next_check_date = ?, status = ?, remark = ?
       WHERE id = ?`,
      [
        plan_code, plan_name, instrument_id, instrument_name, instrument_code, check_item,
        check_method, check_frequency, check_criteria, tolerance_range, plan_date, next_check_date, status, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新期间核查计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addIntermediateCheckRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_id, check_code, check_date, check_result, reference_value, conclusion, conclusion_comment, corrective_action, remark
    } = req.body;

    // 计算偏差和偏差百分比
    const deviation = check_result && reference_value ? (check_result - reference_value) : null;
    const deviationPercentage = reference_value ? ((deviation / reference_value) * 100) : null;

    // 判断是否超出允差范围（简化判断，实际应根据具体允差范围判断）
    const isWithinTolerance = Math.abs(deviationPercentage || 0) <= 2.0;

    const [result]: any = await pool.execute(
      `INSERT INTO intermediate_check_records (
        plan_id, check_code, check_date, checker, checker_name, check_result, reference_value,
        deviation, deviation_percentage, is_within_tolerance, conclusion, conclusion_comment,
        corrective_action, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_id, check_code, check_date, userId, userName, check_result, reference_value,
        deviation, deviationPercentage, isWithinTolerance, conclusion, conclusion_comment,
        corrective_action, remark, userId
      ]
    );

    // 如果超出允差范围，创建预警
    if (!isWithinTolerance) {
      await pool.execute(
        `INSERT INTO intermediate_check_alerts (plan_id, alert_type, alert_content, alert_date, remark) VALUES (?, ?, ?, ?, ?)`,
        [
          plan_id,
          '超出允差',
          `核查结果${check_result}超出参考值${reference_value}的允差范围，偏差${deviationPercentage?.toFixed(2)}%`,
          check_date,
          '自动生成的预警'
        ]
      );
    }

    res.json({ code: 200, message: '核查记录添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加期间核查记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const reviewIntermediateCheckRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE intermediate_check_records SET 
        reviewer = ?, reviewer_name = ?, review_date = NOW(), status = 'approved'
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '审核完成', data: null });
  } catch (error) {
    console.error('审核期间核查记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getIntermediateCheckAlerts = async (req: Request, res: Response) => {
  try {
    const { is_resolved, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT a.*, p.plan_name, p.instrument_name FROM intermediate_check_alerts a LEFT JOIN intermediate_check_plans p ON a.plan_id = p.id WHERE 1=1`;
    const params: any[] = [];

    if (is_resolved !== undefined) {
      query += ' AND a.is_resolved = ?';
      params.push(is_resolved === 'true' ? 1 : 0);
    }
    query += ` ORDER BY a.created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

    const [rows]: any = await pool.query(query, params);

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*/, '').replace(/LIMIT.*/, '');
    const countParams = params.slice();
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
    console.error('获取期间核查预警失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const resolveIntermediateCheckAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE intermediate_check_alerts SET 
        is_resolved = true, resolved_date = NOW(), resolved_by = ?, resolved_name = ?
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '预警已处理', data: null });
  } catch (error) {
    console.error('处理期间核查预警失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getIntermediateCheckStats = async (req: Request, res: Response) => {
  try {
    // 统计各状态的计划数量
    const [planStats]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM intermediate_check_plans GROUP BY status`
    );

    // 统计结论分布
    const [conclusionStats]: any = await pool.execute(
      `SELECT conclusion, COUNT(*) as count FROM intermediate_check_records GROUP BY conclusion`
    );

    // 统计预警数量
    const [alertStats]: any = await pool.execute(
      `SELECT is_resolved, COUNT(*) as count FROM intermediate_check_alerts GROUP BY is_resolved`
    );

    // 即将到期的核查计划（30天内）
    const [upcomingChecks]: any = await pool.execute(
      `SELECT * FROM intermediate_check_plans WHERE next_check_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'active' ORDER BY next_check_date ASC`
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        plan_stats: planStats,
        conclusion_stats: conclusionStats,
        alert_stats: alertStats,
        upcoming_checks: upcomingChecks
      }
    });
  } catch (error) {
    console.error('获取期间核查统计失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
