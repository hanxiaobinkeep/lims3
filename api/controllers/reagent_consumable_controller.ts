import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getReagentList = async (req: Request, res: Response) => {
  try {
    const { category, is_hazardous, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM reagent_consumables WHERE 1=1`;
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (is_hazardous !== undefined) {
      query += ' AND is_hazardous = ?';
      params.push(is_hazardous === 'true' ? 1 : 0);
    }
    if (keyword) {
      query += ' AND (reagent_name LIKE ? OR reagent_code LIKE ? OR cas_number LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
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
    console.error('获取试剂列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getReagentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM reagent_consumables WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '试剂不存在', data: null });
    }

    const reagent = rows[0];
    
    // 获取入库记录
    const [inRecords]: any = await pool.execute('SELECT * FROM reagent_in_records WHERE reagent_id = ? ORDER BY receive_date DESC', [id]);
    
    // 获取领用记录
    const [outRecords]: any = await pool.execute('SELECT * FROM reagent_out_records WHERE reagent_id = ? ORDER BY out_date DESC', [id]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...reagent,
        in_records: inRecords,
        out_records: outRecords
      }
    });
  } catch (error) {
    console.error('获取试剂详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createReagent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      reagent_code, reagent_name, category, specification, unit, brand, cas_number,
      grade, storage_condition, is_hazardous, is_controlled, safety_info,
      minimum_stock, current_stock, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO reagent_consumables (
        reagent_code, reagent_name, category, specification, unit, brand, cas_number,
        grade, storage_condition, is_hazardous, is_controlled, safety_info,
        minimum_stock, current_stock, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reagent_code, reagent_name, category, specification, unit, brand, cas_number,
        grade, storage_condition, is_hazardous ? 1 : 0, is_controlled ? 1 : 0, safety_info,
        minimum_stock, current_stock, remark, userId
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建试剂失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateReagent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      reagent_code, reagent_name, category, specification, unit, brand, cas_number,
      grade, storage_condition, is_hazardous, is_controlled, safety_info,
      minimum_stock, current_stock, remark
    } = req.body;

    await pool.execute(
      `UPDATE reagent_consumables SET
        reagent_code = ?, reagent_name = ?, category = ?, specification = ?, unit = ?,
        brand = ?, cas_number = ?, grade = ?, storage_condition = ?, is_hazardous = ?,
        is_controlled = ?, safety_info = ?, minimum_stock = ?, current_stock = ?, remark = ?
       WHERE id = ?`,
      [
        reagent_code, reagent_name, category, specification, unit, brand, cas_number,
        grade, storage_condition, is_hazardous ? 1 : 0, is_controlled ? 1 : 0, safety_info,
        minimum_stock, current_stock, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新试剂失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteReagent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM reagent_consumables WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除试剂失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addReagentIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      reagent_id, batch_number, quantity, unit, receive_date, expiry_date,
      supplier_id, certificate_file, inspection_status, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO reagent_in_records (
        reagent_id, batch_number, quantity, unit, receive_date, expiry_date,
        supplier_id, certificate_file, inspection_status, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reagent_id, batch_number, quantity, unit, receive_date, expiry_date,
        supplier_id, certificate_file, inspection_status, remark, userId
      ]
    );

    // 更新库存
    await pool.execute(
      'UPDATE reagent_consumables SET current_stock = current_stock + ? WHERE id = ?',
      [quantity, reagent_id]
    );

    res.json({ code: 200, message: '入库成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('试剂入库失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addReagentOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      reagent_id, quantity, unit, purpose, out_date, user_id, status, remark
    } = req.body;

    // 检查库存
    const [reagents]: any = await pool.execute('SELECT * FROM reagent_consumables WHERE id = ?', [reagent_id]);
    if (reagents.length === 0) {
      return res.status(404).json({ code: 404, message: '试剂不存在', data: null });
    }
    
    const reagent = reagents[0];
    if (reagent.current_stock < quantity) {
      return res.status(400).json({ code: 400, message: '库存不足', data: null });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO reagent_out_records (
        reagent_id, quantity, unit, purpose, out_date, user_id, user_name, status, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reagent_id, quantity, unit, purpose, out_date, user_id, userName, status, remark, userId
      ]
    );

    // 更新库存
    await pool.execute(
      'UPDATE reagent_consumables SET current_stock = current_stock - ? WHERE id = ?',
      [quantity, reagent_id]
    );

    res.json({ code: 200, message: '领用成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('试剂领用失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const confirmReagentOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const { id } = req.params;

    await pool.execute(
      `UPDATE reagent_out_records SET 
        confirm_user_id = ?, confirm_user_name = ?, confirm_date = NOW(), status = 'confirmed'
       WHERE id = ?`,
      [userId, userName, id]
    );

    res.json({ code: 200, message: '确认成功', data: null });
  } catch (error) {
    console.error('确认领用失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const addReagentReturn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      reagent_id, out_record_id, quantity, unit, return_date, user_id, receiver_id, receiver_name, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO reagent_return_records (
        reagent_id, out_record_id, quantity, unit, return_date, user_id, user_name, 
        receiver_id, receiver_name, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reagent_id, out_record_id, quantity, unit, return_date, user_id, userName,
        receiver_id, receiver_name, remark, userId
      ]
    );

    // 更新库存
    await pool.execute(
      'UPDATE reagent_consumables SET current_stock = current_stock + ? WHERE id = ?',
      [quantity, reagent_id]
    );

    res.json({ code: 200, message: '归还成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('试剂归还失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getSolutionList = async (req: Request, res: Response) => {
  try {
    const { solution_type, keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT * FROM solution_preparations WHERE 1=1`;
    const params: any[] = [];

    if (solution_type) {
      query += ' AND solution_type = ?';
      params.push(solution_type);
    }
    if (keyword) {
      query += ' AND solution_name LIKE ?';
      params.push(`%${keyword}%`);
    }
    query += ` ORDER BY preparation_date DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

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
    console.error('获取溶液列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createSolution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName;
    const {
      solution_name, solution_type, formula, concentration, preparation_date,
      volume, unit, expiry_date, storage_location, calibration_date,
      calibrated_by, calibration_result, is_standard, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO solution_preparations (
        solution_name, solution_type, formula, concentration, preparation_date,
        prepared_by, prepared_name, volume, unit, expiry_date, storage_location,
        calibration_date, calibrated_by, calibration_result, is_standard, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        solution_name, solution_type, formula, concentration, preparation_date,
        userId, userName, volume, unit, expiry_date, storage_location,
        calibration_date, calibrated_by, calibration_result, is_standard ? 1 : 0, remark, userId
      ]
    );

    res.json({ code: 200, message: '配制成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('溶液配制失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const expiryWarning = new Date(now);
    expiryWarning.setDate(expiryWarning.getDate() + 30);

    // 即将过期的试剂
    const [expiryReagents]: any = await pool.execute(
      `SELECT r.*, ir.expiry_date, ir.batch_number 
       FROM reagent_consumables r 
       JOIN reagent_in_records ir ON r.id = ir.reagent_id 
       WHERE ir.expiry_date BETWEEN CURDATE() AND ? 
       ORDER BY ir.expiry_date ASC`,
      [expiryWarning]
    );

    // 低库存的试剂
    const [lowStockReagents]: any = await pool.execute(
      `SELECT * FROM reagent_consumables 
       WHERE minimum_stock IS NOT NULL AND current_stock <= minimum_stock 
       ORDER BY current_stock ASC`
    );

    // 即将过期的溶液
    const [expirySolutions]: any = await pool.execute(
      `SELECT * FROM solution_preparations 
       WHERE expiry_date BETWEEN CURDATE() AND ? 
       ORDER BY expiry_date ASC`,
      [expiryWarning]
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        expiry_reagents: expiryReagents,
        low_stock_reagents: lowStockReagents,
        expiry_solutions: expirySolutions
      }
    });
  } catch (error) {
    console.error('获取预警信息失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
