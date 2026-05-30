import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getPersonnelList = async (req: Request, res: Response) => {
  try {
    const { department, status, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM personnel WHERE 1=1`;
    const params: any[] = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      query += ' AND (real_name LIKE ? OR employee_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

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
    console.error('获取人员列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getPersonnelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM personnel WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '人员不存在', data: null });
    }

    const personnel = rows[0];
    
    // 获取培训记录
    const [trainingRows]: any = await pool.execute('SELECT * FROM training_records WHERE personnel_id = ? ORDER BY training_date DESC', [id]);
    
    // 获取上岗证记录
    const [qualificationRows]: any = await pool.execute('SELECT * FROM qualification_certificates WHERE personnel_id = ? ORDER BY issue_date DESC', [id]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...personnel,
        trainings: trainingRows,
        qualifications: qualificationRows
      }
    });
  } catch (error) {
    console.error('获取人员详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createPersonnel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { employee_no, real_name, gender, birth_date, phone, email, department, position, entry_date, status, education, major, resume } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO personnel (employee_no, real_name, gender, birth_date, phone, email, department, position, entry_date, status, education, major, resume, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_no, real_name, gender, birth_date, phone, email, department, position, entry_date, status, education, major, resume, userId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建人员失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updatePersonnel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employee_no, real_name, gender, birth_date, phone, email, department, position, entry_date, status, education, major, resume } = req.body;

    await pool.execute(
      `UPDATE personnel SET employee_no = ?, real_name = ?, gender = ?, birth_date = ?, phone = ?, email = ?, department = ?, position = ?, entry_date = ?, status = ?, education = ?, major = ?, resume = ? WHERE id = ?`,
      [employee_no, real_name, gender, birth_date, phone, email, department, position, entry_date, status, education, major, resume, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新人员失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deletePersonnel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM personnel WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除人员失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addTraining = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { personnel_id, training_name, training_type, training_content, training_date, training_hours, trainer, training_organization, assessment_method, assessment_result, certificate_no, certificate_date, valid_until, certificate_file, remark } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO training_records (personnel_id, training_name, training_type, training_content, training_date, training_hours, trainer, training_organization, assessment_method, assessment_result, certificate_no, certificate_date, valid_until, certificate_file, remark, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [personnel_id, training_name, training_type, training_content, training_date, training_hours, trainer, training_organization, assessment_method, assessment_result, certificate_no, certificate_date, valid_until, certificate_file, remark, userId]
    );

    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加培训记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { training_name, training_type, training_content, training_date, training_hours, trainer, training_organization, assessment_method, assessment_result, certificate_no, certificate_date, valid_until, certificate_file, remark } = req.body;

    await pool.execute(
      `UPDATE training_records SET training_name = ?, training_type = ?, training_content = ?, training_date = ?, training_hours = ?, trainer = ?, training_organization = ?, assessment_method = ?, assessment_result = ?, certificate_no = ?, certificate_date = ?, valid_until = ?, certificate_file = ?, remark = ? WHERE id = ?`,
      [training_name, training_type, training_content, training_date, training_hours, trainer, training_organization, assessment_method, assessment_result, certificate_no, certificate_date, valid_until, certificate_file, remark, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新培训记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM training_records WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除培训记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addQualification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { personnel_id, certificate_name, certificate_type, certificate_no, certificate_level, issue_date, valid_until, issue_organization, scope_of_authorization, status, certificate_file, renewal_date, next_renewal_date, remark } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO qualification_certificates (personnel_id, certificate_name, certificate_type, certificate_no, certificate_level, issue_date, valid_until, issue_organization, scope_of_authorization, status, certificate_file, renewal_date, next_renewal_date, remark, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [personnel_id, certificate_name, certificate_type, certificate_no, certificate_level, issue_date, valid_until, issue_organization, scope_of_authorization, status, certificate_file, renewal_date, next_renewal_date, remark, userId]
    );

    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加上岗证失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateQualification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { certificate_name, certificate_type, certificate_no, certificate_level, issue_date, valid_until, issue_organization, scope_of_authorization, status, certificate_file, renewal_date, next_renewal_date, remark } = req.body;

    await pool.execute(
      `UPDATE qualification_certificates SET certificate_name = ?, certificate_type = ?, certificate_no = ?, certificate_level = ?, issue_date = ?, valid_until = ?, issue_organization = ?, scope_of_authorization = ?, status = ?, certificate_file = ?, renewal_date = ?, next_renewal_date = ?, remark = ? WHERE id = ?`,
      [certificate_name, certificate_type, certificate_no, certificate_level, issue_date, valid_until, issue_organization, scope_of_authorization, status, certificate_file, renewal_date, next_renewal_date, remark, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新上岗证失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteQualification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM qualification_certificates WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除上岗证失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getExpiringSoon = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + Number(days));

    const [trainingRows]: any = await pool.execute(
      `SELECT t.*, p.real_name, p.employee_no FROM training_records t 
       JOIN personnel p ON t.personnel_id = p.id 
       WHERE t.valid_until IS NOT NULL AND t.valid_until <= ? AND t.valid_until >= CURDATE()
       ORDER BY t.valid_until ASC`,
      [cutoffDate]
    );

    const [qualificationRows]: any = await pool.execute(
      `SELECT q.*, p.real_name, p.employee_no FROM qualification_certificates q 
       JOIN personnel p ON q.personnel_id = p.id 
       WHERE q.valid_until IS NOT NULL AND q.valid_until <= ? AND q.valid_until >= CURDATE()
       ORDER BY q.valid_until ASC`,
      [cutoffDate]
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        expiring_trainings: trainingRows,
        expiring_qualifications: qualificationRows
      }
    });
  } catch (error) {
    console.error('获取即将到期记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
