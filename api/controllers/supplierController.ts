import { Request, Response } from 'express';
import pool from '../config/database.js';

// 获取供应商列表
export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, supplier_name, supplier_type, is_qualified } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (supplier_name) {
      whereClause += ' AND supplier_name LIKE ?';
      params.push(`%${supplier_name}%`);
    }
    if (supplier_type) {
      whereClause += ' AND supplier_type = ?';
      params.push(supplier_type);
    }
    if (is_qualified !== undefined && is_qualified !== '') {
      whereClause += ' AND is_qualified = ?';
      params.push(is_qualified === 'true' ? 1 : 0);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM suppliers ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('获取供应商列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 根据ID获取供应商
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '供应商不存在', data: null });
    }

    // 获取供应商资质
    const [qualifications]: any = await pool.execute(
      'SELECT * FROM supplier_qualifications WHERE supplier_id = ? ORDER BY created_at DESC',
      [id]
    );

    // 获取供应商评价
    const [evaluations]: any = await pool.execute(
      'SELECT * FROM supplier_evaluations WHERE supplier_id = ? ORDER BY evaluation_date DESC',
      [id]
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...rows[0],
        qualifications,
        evaluations
      }
    });
  } catch (error) {
    console.error('获取供应商详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 创建供应商
export const create = async (req: Request, res: Response) => {
  try {
    const {
      supplier_code,
      supplier_name,
      short_name,
      supplier_type,
      address,
      contact_person,
      contact_phone,
      email,
      website,
      is_qualified,
      qualification_deadline,
      remark
    } = req.body;

    const created_by = (req as any).user?.id;

    const [result]: any = await pool.execute(
      `INSERT INTO suppliers (
        supplier_code, supplier_name, short_name, supplier_type, address, 
        contact_person, contact_phone, email, website, is_qualified, 
        qualification_deadline, status, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        supplier_code, supplier_name, short_name, supplier_type, address,
        contact_person, contact_phone, email, website, is_qualified ? 1 : 0,
        qualification_deadline || null, remark, created_by
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建供应商失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 更新供应商
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      supplier_code,
      supplier_name,
      short_name,
      supplier_type,
      address,
      contact_person,
      contact_phone,
      email,
      website,
      is_qualified,
      qualification_deadline,
      status,
      remark
    } = req.body;

    await pool.execute(
      `UPDATE suppliers SET 
        supplier_code = ?, supplier_name = ?, short_name = ?, supplier_type = ?, 
        address = ?, contact_person = ?, contact_phone = ?, email = ?, website = ?,
        is_qualified = ?, qualification_deadline = ?, status = ?, remark = ?
      WHERE id = ?`,
      [
        supplier_code, supplier_name, short_name, supplier_type,
        address, contact_person, contact_phone, email, website,
        is_qualified ? 1 : 0, qualification_deadline || null, status, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新供应商失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 删除供应商
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    await pool.execute('DELETE FROM supplier_qualifications WHERE supplier_id = ?', [id]);
    await pool.execute('DELETE FROM supplier_evaluations WHERE supplier_id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除供应商失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 供应商资质相关操作
export const addQualification = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const {
      qualification_name,
      qualification_type,
      certificate_no,
      issue_date,
      expiry_date,
      file_path,
      remark
    } = req.body;
    const created_by = (req as any).user?.id;

    const [result]: any = await pool.execute(
      `INSERT INTO supplier_qualifications (
        supplier_id, qualification_name, qualification_type, certificate_no,
        issue_date, expiry_date, file_path, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier_id, qualification_name, qualification_type, certificate_no,
        issue_date, expiry_date, file_path, remark, created_by
      ]
    );

    res.json({ code: 200, message: '添加资质成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加资质失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const removeQualification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM supplier_qualifications WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除资质成功', data: null });
  } catch (error) {
    console.error('删除资质失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 供应商评价相关操作
export const addEvaluation = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const {
      evaluation_date,
      evaluation_period,
      quality_score,
      delivery_score,
      service_score,
      price_score,
      remark
    } = req.body;
    const evaluator = (req as any).user?.id;

    // 计算总分
    const total_score = (
      (Number(quality_score) || 0) +
      (Number(delivery_score) || 0) +
      (Number(service_score) || 0) +
      (Number(price_score) || 0)
    ) / 4;

    let evaluation_result = '合格';
    if (total_score >= 90) evaluation_result = '优秀';
    else if (total_score >= 80) evaluation_result = '良好';
    else if (total_score < 60) evaluation_result = '不合格';

    const [result]: any = await pool.execute(
      `INSERT INTO supplier_evaluations (
        supplier_id, evaluation_date, evaluation_period, quality_score,
        delivery_score, service_score, price_score, total_score,
        evaluation_result, evaluator, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier_id, evaluation_date, evaluation_period, quality_score,
        delivery_score, service_score, price_score, total_score,
        evaluation_result, evaluator, remark
      ]
    );

    res.json({ code: 200, message: '添加评价成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加评价失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const removeEvaluation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM supplier_evaluations WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除评价成功', data: null });
  } catch (error) {
    console.error('删除评价失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
