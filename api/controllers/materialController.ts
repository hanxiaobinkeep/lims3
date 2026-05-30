import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, category, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      whereClause += ' AND (code LIKE ? OR name LIKE ? OR cas_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM materials ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM materials ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('Get materials error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM materials WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '物料不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { code, name, category, specification, casNo, supplier, stockQuantity, warningThreshold, expiryDate, status } = req.body;

    const [result]: any = await pool.execute(
      'INSERT INTO materials (code, name, category, specification, cas_no, supplier, stock_quantity, warning_threshold, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, name, category, specification, casNo, supplier, stockQuantity, warningThreshold, expiryDate, status || 'active']
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, category, specification, casNo, supplier, stockQuantity, warningThreshold, expiryDate, status } = req.body;

    await pool.execute(
      'UPDATE materials SET code = ?, name = ?, category = ?, specification = ?, cas_no = ?, supplier = ?, stock_quantity = ?, warning_threshold = ?, expiry_date = ?, status = ? WHERE id = ?',
      [code, name, category, specification, casNo, supplier, stockQuantity, warningThreshold, expiryDate, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM materials WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
