import { Request, Response } from 'express';
import pool from '../config/database.js';

// 获取待复核的检验结果列表
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = `WHERE ir.status IN ('pending', 'reviewing')`;
    const params: any[] = [];

    if (status) {
      whereClause += ' AND ir.status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (s.sample_no LIKE ? OR ir.test_item LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM inspection_results ir 
       LEFT JOIN inspection_tasks it ON ir.task_id = it.id 
       LEFT JOIN samples s ON it.sample_id = s.id 
       ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT ir.*,
              it.task_no,
              s.sample_no, s.sample_name,
              t.real_name as tester_name
       FROM inspection_results ir
       LEFT JOIN inspection_tasks it ON ir.task_id = it.id
       LEFT JOIN samples s ON it.sample_id = s.id
       LEFT JOIN users t ON ir.tester_id = t.id
       ${whereClause}
       ORDER BY ir.created_at DESC
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
    console.error('获取待复核结果失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取结果的复核历史
export const getReviewHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [rows]: any = await pool.execute(
      `SELECT dr.*, u.real_name as reviewer_name 
       FROM data_reviews dr 
       LEFT JOIN users u ON dr.reviewer_id = u.id 
       WHERE dr.inspection_result_id = ? 
       ORDER BY dr.created_at DESC`,
      [id]
    );

    res.json({ code: 200, message: 'success', data: rows });
  } catch (error) {
    console.error('获取复核历史失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 创建复核记录
export const createReview = async (req: Request, res: Response) => {
  try {
    const { inspection_result_id, review_type, review_comment } = req.body;
    const userId = (req as any).user.id;

    // 更新检验结果状态
    await pool.execute(
      `UPDATE inspection_results 
       SET status = 'reviewing' 
       WHERE id = ?`,
      [inspection_result_id]
    );

    const [result]: any = await pool.execute(
      `INSERT INTO data_reviews 
       (inspection_result_id, reviewer_id, review_type, review_comment, review_status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [inspection_result_id, userId, review_type, review_comment]
    );

    res.json({ code: 200, message: '复核记录创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建复核记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 执行复核（批准/拒绝）
export const executeReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { review_status, review_comment } = req.body;
    const userId = (req as any).user.id;

    // 更新复核记录
    await pool.execute(
      `UPDATE data_reviews 
       SET review_status = ?, review_comment = ?, reviewer_id = ?, reviewed_at = NOW() 
       WHERE id = ?`,
      [review_status, review_comment, userId, id]
    );

    // 获取对应的检验结果ID
    const [reviewRows]: any = await pool.execute(
      'SELECT inspection_result_id FROM data_reviews WHERE id = ?',
      [id]
    );

    if (reviewRows.length > 0) {
      const resultId = reviewRows[0].inspection_result_id;
      
      // 更新检验结果状态
      const newStatus = review_status === 'approved' ? 'reviewed' : 'pending';
      await pool.execute(
        'UPDATE inspection_results SET status = ? WHERE id = ?',
        [newStatus, resultId]
      );
    }

    res.json({ code: 200, message: '复核成功', data: null });
  } catch (error) {
    console.error('执行复核失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 批准（最终批准）
export const approveResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // 更新检验结果状态为已批准
    await pool.execute(
      `UPDATE inspection_results 
       SET status = 'approved' 
       WHERE id = ?`,
      [id]
    );

    // 创建批准记录
    const [result]: any = await pool.execute(
      `INSERT INTO data_reviews 
       (inspection_result_id, reviewer_id, review_type, review_status, reviewed_at) 
       VALUES (?, ?, 'approval', 'approved', NOW())`,
      [id, userId]
    );

    res.json({ code: 200, message: '批准成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('批准失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
