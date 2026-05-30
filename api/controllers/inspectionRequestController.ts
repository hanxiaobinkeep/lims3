import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND ir.status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (ir.request_no LIKE ? OR ir.sample_name LIKE ? OR ir.batch_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM inspection_requests ir ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT ir.*, u.real_name as requester_name
       FROM inspection_requests ir
       LEFT JOIN users u ON ir.requester_id = u.id
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
    console.error('Get inspection requests error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT ir.*, u.real_name as requester_name FROM inspection_requests ir LEFT JOIN users u ON ir.requester_id = u.id WHERE ir.id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '请验单不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get inspection request error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { sampleName, sampleType, batchNo, quantity, unit, requestDept, priority, remark } = req.body;
    const requestNo = `R${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO inspection_requests (request_no, sample_name, sample_type, batch_no, quantity, unit, request_dept, requester_id, request_date, priority, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, "pending", ?)',
      [requestNo, sampleName, sampleType, batchNo, quantity ? Number(quantity) : 0, unit, requestDept, (req as any).user?.id, priority || 'normal', remark || null]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, requestNo } });
  } catch (error) {
    console.error('Create inspection request error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sampleName, sampleType, batchNo, quantity, unit, requestDept, priority, status, remark } = req.body;

    await pool.execute(
      'UPDATE inspection_requests SET sample_name = ?, sample_type = ?, batch_no = ?, quantity = ?, unit = ?, request_dept = ?, priority = ?, status = ?, remark = ? WHERE id = ?',
      [sampleName, sampleType, batchNo, quantity, unit, requestDept, priority, status, remark, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update inspection request error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM inspection_requests WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete inspection request error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
