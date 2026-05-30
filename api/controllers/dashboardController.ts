import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [pendingRequests]: any = await pool.execute('SELECT COUNT(*) as count FROM inspection_requests WHERE status = "pending"');
    const [pendingTasks]: any = await pool.execute('SELECT COUNT(*) as count FROM inspection_tasks WHERE status IN ("pending", "in_progress")');
    const [pendingReview]: any = await pool.execute('SELECT COUNT(*) as count FROM inspection_results ir JOIN inspection_tasks it ON ir.task_id = it.id WHERE it.status = "completed"');
    const [totalSamples]: any = await pool.execute('SELECT COUNT(*) as count FROM samples');
    const [oosCount]: any = await pool.execute('SELECT COUNT(*) as count FROM inspection_results WHERE is_oos = TRUE');
    const [instrumentCount]: any = await pool.execute('SELECT COUNT(*) as count FROM instruments WHERE status = "active"');

    const [recentRequests]: any = await pool.execute(
      'SELECT ir.*, u.real_name as requester_name FROM inspection_requests ir LEFT JOIN users u ON ir.requester_id = u.id ORDER BY ir.created_at DESC LIMIT 5'
    );

    const [taskStats]: any = await pool.execute(
      'SELECT status, COUNT(*) as count FROM inspection_tasks GROUP BY status'
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        stats: {
          pendingRequests: pendingRequests[0].count,
          pendingTasks: pendingTasks[0].count,
          pendingReview: pendingReview[0].count,
          totalSamples: totalSamples[0].count,
          oosCount: oosCount[0].count,
          instrumentCount: instrumentCount[0].count
        },
        recentRequests,
        taskStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
