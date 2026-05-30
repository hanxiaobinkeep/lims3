import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (keyword) {
      whereClause += ' AND (u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT u.id, u.username, u.real_name, u.email, u.phone, u.department, u.status, u.last_login_at, u.created_at, r.name as role_name, r.code as role_code
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ${whereClause}
       ORDER BY u.created_at DESC
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
    console.error('Get users error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT u.id, u.username, u.real_name, u.email, u.phone, u.department, u.status, u.role_id, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { username, password, realName, email, phone, roleId, department, status } = req.body;

    const [existing]: any = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '用户名已存在', data: null });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const [result]: any = await pool.execute(
      'INSERT INTO users (username, password, real_name, email, phone, role_id, department, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, realName, email, phone, roleId, department, status || 'active']
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { realName, email, phone, roleId, department, status } = req.body;

    await pool.execute(
      'UPDATE users SET real_name = ?, email = ?, phone = ?, role_id = ?, department = ?, status = ? WHERE id = ?',
      [realName, email, phone, roleId, department, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hashedPassword = await bcrypt.hash('123456', 10);

    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ code: 200, message: '密码重置成功', data: null });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
