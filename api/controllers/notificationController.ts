import { Request, Response } from 'express';
import pool from '../config/database.js';

// 获取当前用户的通知列表
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page = 1, pageSize = 20, isRead } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE user_id = ?';
    const params: any[] = [userId];

    if (isRead !== undefined && isRead !== '') {
      whereClause += ' AND is_read = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('获取通知失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取未读通知数量
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const [rows]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      code: 200,
      message: 'success',
      data: { count: rows[0].count }
    });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 标记通知为已读
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    await pool.execute(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ code: 200, message: '标记成功', data: null });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 标记所有通知为已读
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    await pool.execute(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ code: 200, message: '全部标记成功', data: null });
  } catch (error) {
    console.error('全部标记已读失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 创建通知（内部使用）
export const createNotification = async (
  userId: number,
  title: string,
  content: string,
  type: string = 'info',
  relatedModule?: string,
  relatedId?: number
) => {
  try {
    await pool.execute(
      `INSERT INTO notifications (user_id, title, content, type, related_module, related_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, content, type, relatedModule || null, relatedId || null]
    );
    return true;
  } catch (error) {
    console.error('创建通知失败:', error);
    return false;
  }
};

// 删除通知
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 清理旧通知（保留最近30天）
export const cleanupOldNotifications = async (req: Request, res: Response) => {
  try {
    const [result]: any = await pool.execute(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    res.json({
      code: 200,
      message: `清理完成，删除了 ${result.affectedRows} 条通知`,
      data: { deletedCount: result.affectedRows }
    });
  } catch (error) {
    console.error('清理通知失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
