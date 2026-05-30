import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (s.sample_no LIKE ? OR s.sample_name LIKE ? OR s.batch_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM samples s ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT s.*, ir.request_no, ir.sample_type, u.real_name as receiver_name
       FROM samples s
       LEFT JOIN inspection_requests ir ON s.request_id = ir.id
       LEFT JOIN users u ON s.receiver_id = u.id
       ${whereClause}
       ORDER BY s.created_at DESC
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
    console.error('Get samples error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT s.*, ir.request_no, u.real_name as receiver_name FROM samples s LEFT JOIN inspection_requests ir ON s.request_id = ir.id LEFT JOIN users u ON s.receiver_id = u.id WHERE s.id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '样品不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { requestId, sampleName, batchNo, quantity, storageLocation } = req.body;
    const sampleNo = `S${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO samples (sample_no, request_id, sample_name, batch_no, quantity, storage_location, status, receiver_id, receive_date) VALUES (?, ?, ?, ?, ?, ?, "received", ?, NOW())',
      [sampleNo, requestId, sampleName, batchNo, quantity, storageLocation, (req as any).user?.id]
    );

    if (requestId) {
      await pool.execute('UPDATE inspection_requests SET status = "received" WHERE id = ?', [requestId]);
    }

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, sampleNo } });
  } catch (error) {
    console.error('Create sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sampleName, batchNo, quantity, storageLocation, status } = req.body;

    await pool.execute(
      'UPDATE samples SET sample_name = ?, batch_no = ?, quantity = ?, storage_location = ?, status = ? WHERE id = ?',
      [sampleName, batchNo, quantity, storageLocation, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM samples WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
