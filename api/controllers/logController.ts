import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      logType, 
      module,
      userId,
      startDate,
      endDate,
      keyword 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(pageSize);
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (logType) {
      whereClause += ' AND log_type = ?';
      params.push(logType);
    }

    if (module) {
      whereClause += ' AND module LIKE ?';
      params.push(`%${module}%`);
    }

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    }

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (keyword) {
      whereClause += ' AND (operation LIKE ? OR user_name LIKE ? OR ip_address LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM system_logs ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM system_logs ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('Get logs error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT * FROM system_logs WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '日志不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get log by id error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createLog = async (req: Request, res: Response) => {
  try {
    const { 
      log_type, 
      module, 
      operation, 
      user_id, 
      user_name, 
      ip_address, 
      request_method, 
      request_url, 
      request_params, 
      response_code, 
      error_message, 
      execution_time 
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO system_logs 
       (log_type, module, operation, user_id, user_name, ip_address, request_method, request_url, request_params, response_code, error_message, execution_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [log_type, module, operation, user_id, user_name, ip_address, request_method, request_url, request_params, response_code, error_message, execution_time]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const [todayStats]: any = await pool.execute(
      `SELECT COUNT(*) as count, log_type FROM system_logs WHERE DATE(created_at) = ? GROUP BY log_type`,
      [today]
    );

    const [yesterdayStats]: any = await pool.execute(
      `SELECT COUNT(*) as count, log_type FROM system_logs WHERE DATE(created_at) = ? GROUP BY log_type`,
      [yesterday]
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        today: todayStats,
        yesterday: yesterdayStats
      }
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
