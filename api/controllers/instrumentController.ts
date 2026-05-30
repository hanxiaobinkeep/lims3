import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, category, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (code LIKE ? OR name LIKE ? OR model LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM instruments ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM instruments ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('Get instruments error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM instruments WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '设备不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get instrument error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { code, name, category, model, manufacturer, serialNo, location, calibrationDate, calibrationDue, status } = req.body;

    const [result]: any = await pool.execute(
      'INSERT INTO instruments (code, name, category, model, manufacturer, serial_no, location, calibration_date, calibration_due, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, name, category, model, manufacturer, serialNo, location, calibrationDate || null, calibrationDue || null, status || 'active']
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create instrument error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, category, model, manufacturer, serialNo, location, calibrationDate, calibrationDue, status } = req.body;

    await pool.execute(
      'UPDATE instruments SET code = ?, name = ?, category = ?, model = ?, manufacturer = ?, serial_no = ?, location = ?, calibration_date = ?, calibration_due = ?, status = ? WHERE id = ?',
      [code, name, category, model, manufacturer, serialNo, location, calibrationDate, calibrationDue, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update instrument error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM instruments WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete instrument error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
