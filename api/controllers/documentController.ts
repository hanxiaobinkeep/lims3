import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getDocumentCategories = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM document_categories ORDER BY sort_order, id');
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取文件分类失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createDocumentCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { category_code, category_name, parent_id, level, sort_order, description } = req.body;

    const [result]: any = await pool.execute(
      'INSERT INTO document_categories (category_code, category_name, parent_id, level, sort_order, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_code, category_name, parent_id || 0, level || 1, sort_order || 0, description, userId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建文件分类失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { category_id, status, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT d.*, c.category_name FROM documents d LEFT JOIN document_categories c ON d.category_id = c.id WHERE 1=1`;
    const params: any[] = [];

    if (category_id) {
      query += ' AND d.category_id = ?';
      params.push(category_id);
    }
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }
    if (keyword) {
      query += ' AND (d.document_name LIKE ? OR d.document_code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    query += ` ORDER BY d.created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

    const [rows]: any = await pool.query(query, params);

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*/, '').replace(/LIMIT.*/, '');
    const countParams = params.slice(0, -2);
    const [countResult]: any = await pool.query(countQuery, countParams);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT d.*, c.category_name FROM documents d LEFT JOIN document_categories c ON d.category_id = c.id WHERE d.id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '文件不存在', data: null });
    }

    const document = rows[0];
    
    // 获取发放记录
    const [distributions]: any = await pool.execute('SELECT * FROM document_distributions WHERE document_id = ? ORDER BY created_at DESC', [id]);
    
    // 获取变更记录
    const [changes]: any = await pool.execute('SELECT * FROM document_changes WHERE document_id = ? ORDER BY created_at DESC', [id]);
    
    // 获取阅读记录
    const [readRecords]: any = await pool.execute('SELECT * FROM document_read_records WHERE document_id = ? ORDER BY read_date DESC', [id]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...document,
        distributions,
        changes,
        read_records: readRecords
      }
    });
  } catch (error) {
    console.error('获取文件详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      document_code, document_name, category_id, document_type, version, content,
      file_path, file_size, file_format, effective_date, expiry_date, distribution_scope, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO documents (
        document_code, document_name, category_id, document_type, version, status,
        content, file_path, file_size, file_format, author, author_name,
        effective_date, expiry_date, distribution_scope, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        document_code, document_name, category_id, document_type, version || '1.0', 'draft',
        content, file_path, file_size, file_format, userId, userName,
        effective_date, expiry_date, distribution_scope, remark, userId
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建文件失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      document_code, document_name, category_id, document_type, version, content,
      file_path, file_size, file_format, effective_date, expiry_date, distribution_scope, remark
    } = req.body;

    await pool.execute(
      `UPDATE documents SET
        document_code = ?, document_name = ?, category_id = ?, document_type = ?, version = ?,
        content = ?, file_path = ?, file_size = ?, file_format = ?,
        effective_date = ?, expiry_date = ?, distribution_scope = ?, remark = ?
       WHERE id = ?`,
      [
        document_code, document_name, category_id, document_type, version,
        content, file_path, file_size, file_format,
        effective_date, expiry_date, distribution_scope, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新文件失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const reviewDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;
    const { review_result, review_comment } = req.body;

    await pool.execute(
      `UPDATE documents SET 
        reviewer = ?, reviewer_name = ?, review_date = NOW(), status = ?
       WHERE id = ?`,
      [userId, userName, review_result === 'approved' ? 'reviewed' : 'draft', id]
    );

    res.json({ code: 200, message: '审核完成', data: null });
  } catch (error) {
    console.error('审核文件失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const approveDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE documents SET 
        approver = ?, approver_name = ?, approve_date = NOW(), status = 'approved'
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '批准成功', data: null });
  } catch (error) {
    console.error('批准文件失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const distributeDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { document_id, recipient_id, recipient_name, recipient_dept, distribution_method, remark } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO document_distributions (
        document_id, recipient_id, recipient_name, recipient_dept, distribution_date, distribution_method, remark, created_by
      ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [document_id, recipient_id, recipient_name, recipient_dept, distribution_method, remark, userId]
    );

    res.json({ code: 200, message: '发放成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('发放文件失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const returnDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.execute(
      `UPDATE document_distributions SET status = 'returned', return_date = NOW() WHERE id = ?`,
      [id]
    );

    res.json({ code: 200, message: '回收成功', data: null });
  } catch (error) {
    console.error('回收文件失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createDocumentChange = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      document_id, change_type, change_description, change_reason, old_content, new_content
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO document_changes (
        document_id, change_type, change_description, change_reason, old_content, new_content,
        applicant, applicant_name, apply_date, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [document_id, change_type, change_description, change_reason, old_content, new_content, userId, userName, 'pending', userId]
    );

    res.json({ code: 200, message: '变更申请提交成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('提交变更申请失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const reviewDocumentChange = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;
    const { review_result, review_comment } = req.body;

    await pool.execute(
      `UPDATE document_changes SET 
        reviewer = ?, reviewer_name = ?, review_date = NOW(), review_result = ?, review_comment = ?, status = ?
       WHERE id = ?`,
      [userId, userName, review_result, review_comment, review_result === 'approved' ? 'approved' : 'rejected', id]
    );

    res.json({ code: 200, message: '审核完成', data: null });
  } catch (error) {
    console.error('审核变更失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const recordDocumentRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { document_id, read_duration, ip_address } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO document_read_records (
        document_id, user_id, user_name, read_date, read_duration, ip_address
      ) VALUES (?, ?, ?, NOW(), ?, ?)`,
      [document_id, userId, userName, read_duration, ip_address]
    );

    res.json({ code: 200, message: '记录成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('记录阅读失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
