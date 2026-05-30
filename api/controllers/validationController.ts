import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getValidationPlans = async (req: Request, res: Response) => {
  try {
    const { status, validation_type, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM validation_plans WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (validation_type) {
      query += ' AND validation_type = ?';
      params.push(validation_type);
    }
    if (keyword) {
      query += ' AND (plan_name LIKE ? OR plan_code LIKE ? OR target_system LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
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
    console.error('获取验证计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getValidationPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM validation_plans WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '计划不存在', data: null });
    }

    const plan = rows[0];
    
    // 获取验证文档
    const [documents]: any = await pool.execute('SELECT * FROM validation_documents WHERE plan_id = ? ORDER BY created_at DESC', [id]);
    
    // 获取测试记录
    const [tests]: any = await pool.execute('SELECT * FROM validation_tests WHERE plan_id = ? ORDER BY test_type, test_code', [id]);
    
    // 获取可追溯性矩阵
    const [matrices]: any = await pool.execute('SELECT * FROM traceability_matrices WHERE plan_id = ? ORDER BY requirement_id', [id]);
    
    // 获取偏差记录
    const [deviations]: any = await pool.execute('SELECT * FROM validation_deviations WHERE plan_id = ? ORDER BY created_at DESC', [id]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...plan,
        documents,
        tests,
        matrices,
        deviations
      }
    });
  } catch (error) {
    console.error('获取验证计划详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createValidationPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_code, plan_name, validation_type, category, description,
      target_system, target_id, planned_start_date, planned_end_date,
      priority, risk_level, validation_scope, acceptance_criteria, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO validation_plans (
        plan_code, plan_name, validation_type, category, description,
        target_system, target_id, responsible_person, responsible_name,
        planned_start_date, planned_end_date, priority, risk_level,
        validation_scope, acceptance_criteria, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_code, plan_name, validation_type, category, description,
        target_system, target_id || null, userId || null, userName || '',
        planned_start_date || null, planned_end_date || null, priority || 'normal', risk_level || 'medium',
        validation_scope || null, acceptance_criteria || null, remark || null, userId || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建验证计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateValidationPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      plan_code, plan_name, validation_type, category, description,
      target_system, target_id, planned_start_date, planned_end_date,
      actual_start_date, actual_end_date, status, priority, risk_level,
      validation_scope, acceptance_criteria, remark
    } = req.body;

    await pool.execute(
      `UPDATE validation_plans SET
        plan_code = ?, plan_name = ?, validation_type = ?, category = ?, description = ?,
        target_system = ?, target_id = ?, planned_start_date = ?, planned_end_date = ?,
        actual_start_date = ?, actual_end_date = ?, status = ?, priority = ?, risk_level = ?,
        validation_scope = ?, acceptance_criteria = ?, remark = ?
       WHERE id = ?`,
      [
        plan_code, plan_name, validation_type, category, description,
        target_system, target_id, planned_start_date, planned_end_date,
        actual_start_date, actual_end_date, status, priority, risk_level,
        validation_scope, acceptance_criteria, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新验证计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addValidationDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_id, document_code, document_name, document_type, version,
      content, file_path, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO validation_documents (
        plan_id, document_code, document_name, document_type, version,
        content, file_path, author, author_name, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_id, document_code, document_name, document_type, version || '1.0',
        content || null, file_path || null, userId || null, userName || '', remark || null, userId || null
      ]
    );

    res.json({ code: 200, message: '文档添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加验证文档失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const reviewValidationDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE validation_documents SET 
        reviewer = ?, reviewer_name = ?, review_date = NOW(), status = 'reviewed'
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '审核完成', data: null });
  } catch (error) {
    console.error('审核验证文档失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const approveValidationDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE validation_documents SET 
        approver = ?, approver_name = ?, approve_date = NOW(), status = 'approved', effective_date = CURDATE()
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '批准完成', data: null });
  } catch (error) {
    console.error('批准验证文档失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addValidationTest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_id, test_code, test_name, test_type, test_objective,
      test_procedure, expected_result, actual_result, test_result,
      deviation_description, test_date, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO validation_tests (
        plan_id, test_code, test_name, test_type, test_objective,
        test_procedure, expected_result, actual_result, test_result,
        deviation_description, tester, tester_name, test_date, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_id, test_code, test_name, test_type, test_objective || null,
        test_procedure || null, expected_result || null, actual_result || null, test_result || 'pending',
        deviation_description || null, userId || null, userName || '', test_date || null, remark || null, userId || null
      ]
    );

    res.json({ code: 200, message: '测试记录添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加验证测试失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const reviewValidationTest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE validation_tests SET 
        reviewer = ?, reviewer_name = ?, review_date = NOW(), status = 'approved'
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '审核完成', data: null });
  } catch (error) {
    console.error('审核验证测试失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addTraceabilityMatrix = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      plan_id, requirement_id, requirement_description, test_case_id,
      test_case_description, test_result, risk_level, verification_method, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO traceability_matrices (
        plan_id, requirement_id, requirement_description, test_case_id,
        test_case_description, test_result, risk_level, verification_method, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_id, requirement_id, requirement_description, test_case_id,
        test_case_description, test_result || 'pending', risk_level || 'medium', verification_method || null, remark || null, userId || null
      ]
    );

    res.json({ code: 200, message: '矩阵记录添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加可追溯性矩阵失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addValidationDeviation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      plan_id, deviation_code, deviation_type, description,
      root_cause, impact_assessment, corrective_action, preventive_action,
      deadline, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO validation_deviations (
        plan_id, deviation_code, deviation_type, description,
        root_cause, impact_assessment, corrective_action, preventive_action,
        responsible_person, responsible_name, deadline, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan_id, deviation_code, deviation_type, description,
        root_cause || null, impact_assessment || null, corrective_action || null, preventive_action || null,
        userId || null, userName || '', deadline || null, remark || null, userId || null
      ]
    );

    res.json({ code: 200, message: '偏差记录添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加验证偏差失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateValidationDeviation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      deviation_type, description, root_cause, impact_assessment,
      corrective_action, preventive_action, deadline, completion_date, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE validation_deviations SET
        deviation_type = ?, description = ?, root_cause = ?, impact_assessment = ?,
        corrective_action = ?, preventive_action = ?, deadline = ?, completion_date = ?, status = ?, remark = ?
       WHERE id = ?`,
      [
        deviation_type, description, root_cause, impact_assessment,
        corrective_action, preventive_action, deadline, completion_date, status, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新验证偏差失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getValidationStats = async (req: Request, res: Response) => {
  try {
    // 统计各状态的验证计划数量
    const [planStats]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM validation_plans GROUP BY status`
    );

    // 统计各类型验证计划数量
    const [typeStats]: any = await pool.execute(
      `SELECT validation_type, COUNT(*) as count FROM validation_plans GROUP BY validation_type`
    );

    // 统计测试结果分布
    const [testResultStats]: any = await pool.execute(
      `SELECT test_result, COUNT(*) as count FROM validation_tests GROUP BY test_result`
    );

    // 统计各类型测试数量
    const [testTypeStats]: any = await pool.execute(
      `SELECT test_type, COUNT(*) as count FROM validation_tests GROUP BY test_type`
    );

    // 统计偏差状态
    const [deviationStats]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM validation_deviations GROUP BY status`
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        plan_stats: planStats,
        type_stats: typeStats,
        test_result_stats: testResultStats,
        test_type_stats: testTypeStats,
        deviation_stats: deviationStats
      }
    });
  } catch (error) {
    console.error('获取验证统计失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
