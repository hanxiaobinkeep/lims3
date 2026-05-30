import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, deviationType, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND d.status = ?';
      params.push(status);
    }

    if (deviationType) {
      whereClause += ' AND d.deviation_type = ?';
      params.push(deviationType);
    }

    if (keyword) {
      whereClause += ' AND (d.deviation_no LIKE ? OR d.source LIKE ? OR d.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM deviation_investigations d ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT d.*, u.real_name as investigator_name
       FROM deviation_investigations d
       LEFT JOIN users u ON d.investigator_id = u.id
       ${whereClause} ORDER BY d.created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('Get deviations error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT d.*, u.real_name as investigator_name 
       FROM deviation_investigations d 
       LEFT JOIN users u ON d.investigator_id = u.id 
       WHERE d.id = ?`, [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '记录不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get deviation by id error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { deviationType, source, description, investigatorId } = req.body;
    const deviationNo = `DEV${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO deviation_investigations (deviation_no, deviation_type, source, description, investigator_id, status) VALUES (?, ?, ?, ?, ?, "open")',
      [deviationNo, deviationType, source, description, investigatorId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, deviationNo } });
  } catch (error) {
    console.error('Create deviation error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deviationType, source, description, investigatorId, investigationResult, correctiveAction } = req.body;

    await pool.execute(
      'UPDATE deviation_investigations SET deviation_type = ?, source = ?, description = ?, investigator_id = ?, investigation_result = ?, corrective_action = ? WHERE id = ?',
      [deviationType, source, description, investigatorId, investigationResult, correctiveAction, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update deviation error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const closedAt = status === 'closed' ? new Date() : null;

    await pool.execute(
      'UPDATE deviation_investigations SET status = ?, closed_at = ? WHERE id = ?',
      [status, closedAt, id]
    );

    res.json({ code: 200, message: '状态更新成功', data: null });
  } catch (error) {
    console.error('Update deviation status error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM deviation_investigations WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete deviation error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
