import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';

export const logMiddleware = (module: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const originalEnd = res.end;
    
    (res.end as any) = function (...args: any[]) {
      const duration = Date.now() - start;
      
      let logType = 'info';
      if (res.statusCode >= 400 && res.statusCode < 500) logType = 'warning';
      if (res.statusCode >= 500) logType = 'error';
      
      let operation = '';
      if (req.method === 'POST') operation = '创建';
      else if (req.method === 'PUT') operation = '更新';
      else if (req.method === 'DELETE') operation = '删除';
      else operation = '查询';
      
      // 从认证信息获取用户
      const user = (req as any).user;
      
      // 异步记录日志，不影响响应
      (async () => {
        try {
          await pool.execute(
            `INSERT INTO system_logs 
             (log_type, module, operation, user_id, user_name, ip_address, request_method, request_url, request_params, response_code, execution_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              logType,
              module,
              operation,
              user?.id || null,
              user?.real_name || '',
              req.ip || req.socket.remoteAddress || '',
              req.method,
              req.originalUrl,
              JSON.stringify({ ...req.body, ...req.query }),
              res.statusCode,
              duration
            ]
          );
        } catch (error) {
          console.error('日志记录失败:', error);
        }
      })();
      
      return originalEnd.apply(res, args);
    };
    
    next();
  };
};

export const logLogin = async (
  userId: number,
  userName: string,
  ip: string,
  success: boolean,
  errorMessage?: string
) => {
  try {
    await pool.execute(
      `INSERT INTO system_logs 
       (log_type, module, operation, user_id, user_name, ip_address, response_code, error_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        success ? 'login' : 'error',
        '认证',
        success ? '用户登录' : '登录失败',
        userId,
        userName,
        ip,
        success ? 200 : 401,
        errorMessage || null
      ]
    );
  } catch (error) {
    console.error('登录日志记录失败:', error);
  }
};
