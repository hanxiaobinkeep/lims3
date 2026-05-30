import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, taskId, isOOS, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (taskId) {
      whereClause += ' AND ir.task_id = ?';
      params.push(taskId);
    }

    if (isOOS !== undefined && isOOS !== '') {
      whereClause += ' AND ir.is_oos = ?';
      params.push(isOOS === 'true' ? 1 : 0);
    }

    if (keyword) {
      whereClause += ' AND (ir.test_item LIKE ? OR ir.result LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM inspection_results ir ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT ir.*, t.task_no, s.sample_name, s.sample_no, i.name as instrument_name, u.real_name as tester_name
       FROM inspection_results ir
       LEFT JOIN inspection_tasks t ON ir.task_id = t.id
       LEFT JOIN samples s ON t.sample_id = s.id
       LEFT JOIN instruments i ON ir.instrument_id = i.id
       LEFT JOIN users u ON ir.tester_id = u.id
       ${whereClause}
       ORDER BY ir.created_at DESC
       LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('Get inspection results error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT ir.*, t.task_no, s.sample_name, s.sample_no, i.name as instrument_name, u.real_name as tester_name 
       FROM inspection_results ir 
       LEFT JOIN inspection_tasks t ON ir.task_id = t.id 
       LEFT JOIN samples s ON t.sample_id = s.id 
       LEFT JOIN instruments i ON ir.instrument_id = i.id 
       LEFT JOIN users u ON ir.tester_id = u.id 
       WHERE ir.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '结果不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get inspection result error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { taskId, testItem, result, unit, specification, isOOS, instrumentId, testDate, remark } = req.body;

    const [result_insert]: any = await pool.execute(
      'INSERT INTO inspection_results (task_id, test_item, result, unit, specification, is_oos, instrument_id, test_date, tester_id, remark, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [taskId, testItem, result, unit, specification, isOOS ? 1 : 0, instrumentId, testDate, (req as any).user?.id, remark, 'pending']
    );

    // 更新任务状态为completed
    await pool.execute('UPDATE inspection_tasks SET status = ? WHERE id = ?', ['completed', taskId]);

    res.json({ code: 200, message: '创建成功', data: { id: result_insert.insertId } });
  } catch (error) {
    console.error('Create inspection result error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testItem, result, unit, specification, isOOS, instrumentId, testDate, remark } = req.body;

    await pool.execute(
      'UPDATE inspection_results SET test_item = ?, result = ?, unit = ?, specification = ?, is_oos = ?, instrument_id = ?, test_date = ?, remark = ? WHERE id = ?',
      [testItem, result, unit, specification, isOOS ? 1 : 0, instrumentId, testDate, remark, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update inspection result error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM inspection_results WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete inspection result error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
