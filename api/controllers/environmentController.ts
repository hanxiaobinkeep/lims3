import { Request, Response } from 'express';
import pool from '../config/database.js';

// 监测计划
export const getPlans = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (plan_no LIKE ? OR plan_name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM environment_plans ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM environment_plans ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
      params
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    console.error('Get environment plans error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM environment_plans WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '记录不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get plan by id error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    const { planName, monitorType, monitorPoints, frequency } = req.body;
    const planNo = `ENV${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO environment_plans (plan_no, plan_name, monitor_type, monitor_points, frequency, status) VALUES (?, ?, ?, ?, ?, "active")',
      [planNo, planName, monitorType, monitorPoints, frequency]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, planNo } });
  } catch (error) {
    console.error('Create environment plan error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planName, monitorType, monitorPoints, frequency, status } = req.body;

    await pool.execute(
      'UPDATE environment_plans SET plan_name = ?, monitor_type = ?, monitor_points = ?, frequency = ?, status = ? WHERE id = ?',
      [planName, monitorType, monitorPoints, frequency, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update environment plan error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM environment_plans WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete environment plan error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 环境样品
export const getSamples = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, planId, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }

    if (planId) {
      whereClause += ' AND s.plan_id = ?';
      params.push(planId);
    }

    if (keyword) {
      whereClause += ' AND (s.sample_no LIKE ? OR s.sample_point LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM environment_samples s ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT s.*, p.plan_name, p.monitor_type, u.real_name as sampler_name
       FROM environment_samples s
       LEFT JOIN environment_plans p ON s.plan_id = p.id
       LEFT JOIN users u ON s.sampler_id = u.id
       ${whereClause} ORDER BY s.created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
      params
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    console.error('Get environment samples error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getSampleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT s.*, p.plan_name, u.real_name as sampler_name 
       FROM environment_samples s 
       LEFT JOIN environment_plans p ON s.plan_id = p.id 
       LEFT JOIN users u ON s.sampler_id = u.id 
       WHERE s.id = ?`, [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '记录不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get sample by id error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createSample = async (req: Request, res: Response) => {
  try {
    const { planId, samplePoint, sampleDate, samplerId } = req.body;
    const sampleNo = `ES${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO environment_samples (sample_no, plan_id, sample_point, sample_date, sampler_id, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [sampleNo, planId, samplePoint, sampleDate, samplerId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, sampleNo } });
  } catch (error) {
    console.error('Create environment sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateSample = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planId, samplePoint, sampleDate, samplerId, status } = req.body;

    await pool.execute(
      'UPDATE environment_samples SET plan_id = ?, sample_point = ?, sample_date = ?, sampler_id = ?, status = ? WHERE id = ?',
      [planId, samplePoint, sampleDate, samplerId, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update environment sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteSample = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM environment_samples WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete environment sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
