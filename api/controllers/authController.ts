import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { logLogin } from '../middleware/log.js';

function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return str === '*' ? ['*'] : [];
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
    }

    const [rows]: any = await pool.execute(
      'SELECT u.*, r.name as role_name, r.code as role_code, r.permissions FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = ? AND u.status = "active"',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await logLogin(user.id, user.real_name, req.ip || '', false, '密码错误');
      return res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    await logLogin(user.id, user.real_name, req.ip || '', true);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.real_name,
          email: user.email,
          phone: user.phone,
          roleId: user.role_id,
          roleName: user.role_name,
          roleCode: user.role_code,
          department: user.department,
          permissions: user.permissions ? safeJsonParse(user.permissions) : []
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, message: '未认证', data: null });
    }

    const [rows]: any = await pool.execute(
      'SELECT u.id, u.username, u.real_name, u.email, u.phone, u.role_id, u.department, r.name as role_name, r.code as role_code, r.permissions FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const user = rows[0];
    res.json({
      code: 200,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        realName: user.real_name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        roleName: user.role_name,
        roleCode: user.role_code,
        department: user.department,
        permissions: user.permissions ? safeJsonParse(user.permissions) : []
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
