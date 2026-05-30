import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT id, name as role_name, code as role_code, description, status, created_at FROM roles ORDER BY id');
    res.json({ code: 200, message: 'success', data: rows });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM roles WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '角色不存在', data: null });
    }

    const role = rows[0];
    res.json({
      code: 200,
      message: 'success',
      data: {
        ...role,
        role_name: role.name,
        role_code: role.code,
        permissions: role.permissions ? JSON.parse(role.permissions) : []
      }
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { role_code, role_name, description, permissions } = req.body;
    const [result]: any = await pool.execute(
      'INSERT INTO roles (code, name, description, status, permissions) VALUES (?, ?, ?, ?, ?)',
      [role_code, role_name, description || '', 'active', JSON.stringify(permissions || [])]
    );
    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_code, role_name, description, permissions, status } = req.body;
    await pool.execute(
      'UPDATE roles SET code = ?, name = ?, description = ?, status = ?, permissions = ? WHERE id = ?',
      [role_code, role_name, description || '', status || 'active', JSON.stringify(permissions || []), id]
    );
    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updatePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    await pool.execute(
      'UPDATE roles SET permissions = ? WHERE id = ?',
      [JSON.stringify(permissions || []), id]
    );
    res.json({ code: 200, message: '权限配置成功', data: null });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
