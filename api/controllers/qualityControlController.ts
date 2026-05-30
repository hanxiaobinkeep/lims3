import { Request, Response } from 'express';
import pool from '../config/database.js';

interface QCPlan {
  id?: number;
  plan_name: string;
  plan_type: string;
  material_id?: number;
  inspection_item?: string;
  chart_type: string;
  sample_size: number;
  sample_interval?: string;
  center_line?: number;
  upper_control_limit?: number;
  lower_control_limit?: number;
  upper_spec_limit?: number;
  lower_spec_limit?: number;
  target_value?: number;
  unit?: string;
  description?: string;
  status: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface QCData {
  id?: number;
  plan_id: number;
  subgroup_no: number;
  sample_time: Date;
  sample_values: string;
  subgroup_mean?: number;
  subgroup_range?: number;
  subgroup_std?: number;
  is_out_of_control?: boolean;
  out_of_control_reason?: string;
  out_of_control_action?: string;
  status?: string;
  remark?: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface QCOOC {
  id?: number;
  plan_id: number;
  qc_data_id: number;
  ooc_type?: string;
  ooc_rule?: string;
  ooc_time: Date;
  description?: string;
  investigation?: string;
  corrective_action?: string;
  preventive_action?: string;
  action_taken_at?: Date;
  closed_by?: number;
  closed_at?: Date;
  status?: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export const getQCPlans = async (req: Request, res: Response) => {
  try {
    const { status, plan_type } = req.query;
    let query = 'SELECT * FROM qc_plans WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (plan_type) {
      query += ' AND plan_type = ?';
      params.push(plan_type);
    }
    query += ' ORDER BY created_at DESC';

    const [rows]: any = await pool.execute(query, params);
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取质控计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getQCPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM qc_plans WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '质控计划不存在', data: null });
    }
    res.json({ code: 200, message: '获取成功', data: rows[0] });
  } catch (error) {
    console.error('获取质控计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createQCPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { plan_name, plan_type, material_id, inspection_item, chart_type, 
      sample_size, sample_interval, center_line, upper_control_limit, lower_control_limit,
      upper_spec_limit, lower_spec_limit, target_value, unit, description, status } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO qc_plans 
       (plan_name, plan_type, material_id, inspection_item, chart_type, sample_size, 
        sample_interval, center_line, upper_control_limit, lower_control_limit, 
        upper_spec_limit, lower_spec_limit, target_value, unit, description, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [plan_name, plan_type, material_id, inspection_item, chart_type, sample_size,
        sample_interval, center_line, upper_control_limit, lower_control_limit,
        upper_spec_limit, lower_spec_limit, target_value, unit, description, status, userId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建质控计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateQCPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plan_name, plan_type, material_id, inspection_item, chart_type, 
      sample_size, sample_interval, center_line, upper_control_limit, lower_control_limit,
      upper_spec_limit, lower_spec_limit, target_value, unit, description, status } = req.body;

    await pool.execute(
      `UPDATE qc_plans 
       SET plan_name = ?, plan_type = ?, material_id = ?, inspection_item = ?, chart_type = ?, 
           sample_size = ?, sample_interval = ?, center_line = ?, upper_control_limit = ?, 
           lower_control_limit = ?, upper_spec_limit = ?, lower_spec_limit = ?, target_value = ?, 
           unit = ?, description = ?, status = ?
       WHERE id = ?`,
      [plan_name, plan_type, material_id, inspection_item, chart_type, sample_size,
        sample_interval, center_line, upper_control_limit, lower_control_limit,
        upper_spec_limit, lower_spec_limit, target_value, unit, description, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新质控计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteQCPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM qc_plans WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除质控计划失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getQCData = async (req: Request, res: Response) => {
  try {
    const { plan_id, status } = req.query;
    let query = 'SELECT * FROM qc_data WHERE 1=1';
    const params: any[] = [];

    if (plan_id) {
      query += ' AND plan_id = ?';
      params.push(plan_id);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY subgroup_no DESC';

    const [rows]: any = await pool.execute(query, params);
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取质控数据失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createQCData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { plan_id, subgroup_no, sample_time, sample_values, remark } = req.body;

    let subgroup_mean: number | undefined;
    let subgroup_range: number | undefined;
    let subgroup_std: number | undefined;
    let is_out_of_control = false;

    const values = JSON.parse(sample_values);
    if (Array.isArray(values) && values.length > 0) {
      const [planRows]: any = await pool.execute('SELECT * FROM qc_plans WHERE id = ?', [plan_id]);
      if (planRows.length > 0) {
        const plan = planRows[0];
        const sum = values.reduce((a, b) => a + b, 0);
        subgroup_mean = sum / values.length;
        subgroup_range = Math.max(...values) - Math.min(...values);
        const mean = subgroup_mean;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        subgroup_std = Math.sqrt(variance);

        if (plan.upper_control_limit !== null && plan.lower_control_limit !== null) {
          if (subgroup_mean > plan.upper_control_limit || subgroup_mean < plan.lower_control_limit) {
            is_out_of_control = true;
          }
        }
      }
    }

    const [result]: any = await pool.execute(
      `INSERT INTO qc_data 
       (plan_id, subgroup_no, sample_time, sample_values, subgroup_mean, subgroup_range, 
        subgroup_std, is_out_of_control, status, remark, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [plan_id, subgroup_no, sample_time, sample_values, subgroup_mean, subgroup_range,
        subgroup_std, is_out_of_control, is_out_of_control ? 'pending' : 'analyzed', remark, userId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建质控数据失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateQCData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { out_of_control_reason, out_of_control_action, status, remark } = req.body;

    await pool.execute(
      `UPDATE qc_data 
       SET out_of_control_reason = ?, out_of_control_action = ?, status = ?, remark = ?
       WHERE id = ?`,
      [out_of_control_reason, out_of_control_action, status, remark, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新质控数据失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getQCOOCRecords = async (req: Request, res: Response) => {
  try {
    const { plan_id, status } = req.query;
    let query = 'SELECT * FROM qc_ooc_records WHERE 1=1';
    const params: any[] = [];

    if (plan_id) {
      query += ' AND plan_id = ?';
      params.push(plan_id);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const [rows]: any = await pool.execute(query, params);
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取失控记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createQCOOC = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { plan_id, qc_data_id, ooc_type, ooc_rule, ooc_time, description } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO qc_ooc_records 
       (plan_id, qc_data_id, ooc_type, ooc_rule, ooc_time, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [plan_id, qc_data_id, ooc_type, ooc_rule, ooc_time, description, userId]
    );

    await pool.execute('UPDATE qc_data SET status = ? WHERE id = ?', ['pending', qc_data_id]);

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建失控记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateQCOOC = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { investigation, corrective_action, preventive_action, action_taken_at, status, closed_at } = req.body;

    if (status === 'closed') {
      const closedAt = closed_at || new Date();
      await pool.execute(
        `UPDATE qc_ooc_records SET 
          investigation = ?, corrective_action = ?, preventive_action = ?, 
          action_taken_at = ?, status = ?, closed_by = ?, closed_at = ?
         WHERE id = ?`,
        [investigation, corrective_action, preventive_action, action_taken_at, status, userId, closedAt, id]
      );

      const [oocRows]: any = await pool.execute('SELECT * FROM qc_ooc_records WHERE id = ?', [id]);
      if (oocRows.length > 0) {
        await pool.execute('UPDATE qc_data SET status = ? WHERE id = ?', ['resolved', oocRows[0].qc_data_id]);
      }
    } else {
      await pool.execute(
        `UPDATE qc_ooc_records SET 
          investigation = ?, corrective_action = ?, preventive_action = ?, 
          action_taken_at = ?, status = ?
         WHERE id = ?`,
        [investigation, corrective_action, preventive_action, action_taken_at, status, id]
      );
    }

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新失控记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
