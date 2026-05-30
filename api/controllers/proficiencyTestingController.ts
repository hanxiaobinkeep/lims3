import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getProficiencyTestingPlans = async (req: Request, res: Response) => {
  try {
    const { status, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM proficiency_testing_plans WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      query += ' AND (plan_name LIKE ? OR plan_code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

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
    console.error('获取能力验证计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getProficiencyTestingPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM proficiency_testing_plans WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '计划不存在', data: null });
    }

    const plan = rows[0];
    
    // 获取结果记录
    const [results]: any = await pool.execute('SELECT * FROM proficiency_testing_results WHERE plan_id = ? ORDER BY created_at DESC', [id]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...plan,
        results
      }
    });
  } catch (error) {
    console.error('获取能力验证计划详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createProficiencyTestingPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_code, plan_name, organizer, testing_type, testing_items, sample_description,
      plan_date, deadline_date, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO proficiency_testing_plans (
        plan_code, plan_name, organizer, testing_type, testing_items, sample_description,
        plan_date, deadline_date, responsible_person, responsible_name, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_code, plan_name, organizer, testing_type, testing_items, sample_description,
        plan_date, deadline_date, userId, userName, remark, userId
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建能力验证计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateProficiencyTestingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      plan_code, plan_name, organizer, testing_type, testing_items, sample_description,
      plan_date, deadline_date, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE proficiency_testing_plans SET
        plan_code = ?, plan_name = ?, organizer = ?, testing_type = ?, testing_items = ?,
        sample_description = ?, plan_date = ?, deadline_date = ?, status = ?, remark = ?
       WHERE id = ?`,
      [
        plan_code, plan_name, organizer, testing_type, testing_items, sample_description,
        plan_date, deadline_date, status, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新能力验证计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addProficiencyTestingResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_id, sample_code, test_item, test_method, lab_result, reference_value,
      uncertainty, test_date, remark
    } = req.body;

    // 计算Z值和En值
    const zScore = reference_value ? ((lab_result - reference_value) / uncertainty) : null;
    const enScore = (lab_result && reference_value && uncertainty) ? 
      (Math.abs(lab_result - reference_value) / (2 * uncertainty)) : null;

    // 评价结果
    let evaluation = 'pending';
    if (zScore !== null) {
      if (Math.abs(zScore) <= 2) {
        evaluation = 'satisfactory';
      } else if (Math.abs(zScore) <= 3) {
        evaluation = 'questionable';
      } else {
        evaluation = 'unsatisfactory';
      }
    }

    const [result]: any = await pool.execute(
      `INSERT INTO proficiency_testing_results (
        plan_id, sample_code, test_item, test_method, lab_result, reference_value,
        uncertainty, z_score, en_score, evaluation, test_date, tester, tester_name, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_id, sample_code, test_item, test_method, lab_result, reference_value,
        uncertainty, zScore, enScore, evaluation, test_date, userId, userName, remark, userId
      ]
    );

    res.json({ code: 200, message: '结果录入成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('录入能力验证结果失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const reviewProficiencyTestingResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;
    const { evaluation, evaluation_comment } = req.body;

    await pool.execute(
      `UPDATE proficiency_testing_results SET 
        evaluation = ?, evaluation_comment = ?, reviewer = ?, reviewer_name = ?, review_date = NOW(), status = 'approved'
       WHERE id = ?`,
      [evaluation, evaluation_comment, userId, userName, id]
    );

    res.json({ code: 200, message: '审核完成', data: null });
  } catch (error) {
    console.error('审核能力验证结果失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addUnsatisfactoryAction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      result_id, action_type, action_description, root_cause, corrective_action,
      preventive_action, deadline, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO proficiency_unsatisfactory_actions (
        result_id, action_type, action_description, root_cause, corrective_action,
        preventive_action, responsible_person, responsible_name, deadline, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result_id, action_type, action_description, root_cause, corrective_action,
        preventive_action, userId, userName, deadline, remark, userId
      ]
    );

    res.json({ code: 200, message: '处理记录创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建不满意结果处理记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateUnsatisfactoryAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      action_type, action_description, root_cause, corrective_action,
      preventive_action, deadline, completion_date, verification_result, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE proficiency_unsatisfactory_actions SET
        action_type = ?, action_description = ?, root_cause = ?, corrective_action = ?,
        preventive_action = ?, deadline = ?, completion_date = ?, verification_result = ?, status = ?, remark = ?
       WHERE id = ?`,
      [
        action_type, action_description, root_cause, corrective_action,
        preventive_action, deadline, completion_date, verification_result, status, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新不满意结果处理记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getProficiencyTestingStats = async (req: Request, res: Response) => {
  try {
    // 统计各状态的计划数量
    const [planStats]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM proficiency_testing_plans GROUP BY status`
    );

    // 统计评价结果分布
    const [evaluationStats]: any = await pool.execute(
      `SELECT evaluation, COUNT(*) as count FROM proficiency_testing_results GROUP BY evaluation`
    );

    // 统计不满意结果处理状态
    const [actionStats]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM proficiency_unsatisfactory_actions GROUP BY status`
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        plan_stats: planStats,
        evaluation_stats: evaluationStats,
        action_stats: actionStats
      }
    });
  } catch (error) {
    console.error('获取能力验证统计失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
