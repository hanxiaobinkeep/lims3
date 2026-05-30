import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, assigneeId, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    if (assigneeId) {
      whereClause += ' AND t.assignee_id = ?';
      params.push(assigneeId);
    }

    if (keyword) {
      whereClause += ' AND (t.task_no LIKE ? OR t.test_item LIKE ? OR s.sample_name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM inspection_tasks t ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT t.*, s.sample_no, s.sample_name, s.batch_no, m.name as method_name, m.code as method_code, u.real_name as assignee_name
       FROM inspection_tasks t
       LEFT JOIN samples s ON t.sample_id = s.id
       LEFT JOIN methods m ON t.method_id = m.id
       LEFT JOIN users u ON t.assignee_id = u.id
       ${whereClause}
       ORDER BY t.created_at DESC
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
    console.error('Get inspection tasks error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT t.*, s.sample_no, s.sample_name, s.batch_no, m.name as method_name, m.code as method_code, u.real_name as assignee_name 
       FROM inspection_tasks t 
       LEFT JOIN samples s ON t.sample_id = s.id 
       LEFT JOIN methods m ON t.method_id = m.id 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '任务不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get inspection task error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { sampleId, testItem, methodId, assigneeId, priority, dueDate } = req.body;
    const taskNo = `T${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO inspection_tasks (task_no, sample_id, test_item, method_id, assignee_id, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, "pending", ?)',
      [taskNo, sampleId, testItem, methodId, assigneeId, priority, dueDate]
    );

    await pool.execute('UPDATE samples SET status = "testing" WHERE id = ?', [sampleId]);

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, taskNo } });
  } catch (error) {
    console.error('Create inspection task error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testItem, methodId, assigneeId, priority, status, dueDate } = req.body;

    await pool.execute(
      'UPDATE inspection_tasks SET test_item = ?, method_id = ?, assignee_id = ?, priority = ?, status = ?, due_date = ? WHERE id = ?',
      [testItem, methodId, assigneeId, priority, status, dueDate, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update inspection task error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updates: string[] = ['status = ?'];
    const params: any[] = [status];

    if (status === 'in_progress') {
      updates.push('completed_date = NULL');
    } else if (status === 'completed' || status === 'reviewed') {
      updates.push('completed_date = NOW()');
    }

    params.push(id);

    await pool.execute(
      `UPDATE inspection_tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ code: 200, message: '状态更新成功', data: null });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM inspection_tasks WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete inspection task error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
