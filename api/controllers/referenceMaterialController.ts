import { Request, Response } from 'express';
import pool from '../config/database.js';

// 获取标准物质列表
export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, rm_name, rm_type, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (rm_name) {
      whereClause += ' AND rm_name LIKE ?';
      params.push(`%${rm_name}%`);
    }
    if (rm_type) {
      whereClause += ' AND rm_type = ?';
      params.push(rm_type);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM reference_materials ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM reference_materials ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('获取标准物质列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 根据ID获取标准物质详情
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT * FROM reference_materials WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '标准物质不存在', data: null });
    }

    // 获取期间核查记录
    const [checks]: any = await pool.execute(
      'SELECT * FROM rm_checks WHERE rm_id = ? ORDER BY check_date DESC',
      [id]
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...rows[0],
        checks
      }
    });
  } catch (error) {
    console.error('获取标准物质详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 创建标准物质
export const create = async (req: Request, res: Response) => {
  try {
    const {
      rm_code, rm_name, rm_type, specification, purity, concentration,
      unit, manufacturer, supplier_id, batch_number, certificate_no,
      manufacture_date, expiry_date, storage_condition,
      initial_amount, current_amount, unit_amount, remark
    } = req.body;

    const created_by = (req as any).user?.id;

    const [result]: any = await pool.execute(
      `INSERT INTO reference_materials (
        rm_code, rm_name, rm_type, specification, purity, concentration,
        unit, manufacturer, supplier_id, batch_number, certificate_no,
        manufacture_date, expiry_date, storage_condition,
        initial_amount, current_amount, unit_amount, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rm_code, rm_name, rm_type, specification, purity, concentration,
        unit, manufacturer, supplier_id, batch_number, certificate_no,
        manufacture_date, expiry_date, storage_condition,
        initial_amount, current_amount, unit_amount, remark, created_by
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建标准物质失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 更新标准物质
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      rm_code, rm_name, rm_type, specification, purity, concentration,
      unit, manufacturer, supplier_id, batch_number, certificate_no,
      manufacture_date, expiry_date, storage_condition,
      initial_amount, current_amount, unit_amount, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE reference_materials SET
        rm_code = ?, rm_name = ?, rm_type = ?, specification = ?, purity = ?, concentration = ?,
        unit = ?, manufacturer = ?, supplier_id = ?, batch_number = ?, certificate_no = ?,
        manufacture_date = ?, expiry_date = ?, storage_condition = ?,
        initial_amount = ?, current_amount = ?, unit_amount = ?, status = ?, remark = ?
      WHERE id = ?`,
      [
        rm_code, rm_name, rm_type, specification, purity, concentration,
        unit, manufacturer, supplier_id, batch_number, certificate_no,
        manufacture_date, expiry_date, storage_condition,
        initial_amount, current_amount, unit_amount, status, remark, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新标准物质失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 删除标准物质
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM reference_materials WHERE id = ?', [id]);
    await pool.execute('DELETE FROM rm_checks WHERE rm_id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除标准物质失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 添加期间核查记录
export const addCheck = async (req: Request, res: Response) => {
  try {
    const { rm_id } = req.params;
    const {
      check_date, check_type, check_method, check_result,
      deviation_description, file_path, checked_by, next_check_date, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO rm_checks (
        rm_id, check_date, check_type, check_method, check_result,
        deviation_description, file_path, checked_by, next_check_date, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rm_id, check_date, check_type, check_method, check_result,
        deviation_description, file_path, checked_by, next_check_date, remark
      ]
    );

    res.json({ code: 200, message: '添加核查记录成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加核查记录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取标准溶液列表
export const getSolutions = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, solution_name, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (solution_name) {
      whereClause += ' AND solution_name LIKE ?';
      params.push(`%${solution_name}%`);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM solution_preparations ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM solution_preparations ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('获取标准溶液列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 创建标准溶液
export const createSolution = async (req: Request, res: Response) => {
  try {
    const {
      solution_code, solution_name, concentration, concentration_unit,
      preparation_method, raw_material_id, raw_material_amount, solvent,
      solvent_amount, total_volume, preparation_date, expiry_date,
      prepared_by, checked_by, calibration_required, calibration_result, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO solution_preparations (
        solution_code, solution_name, concentration, concentration_unit,
        preparation_method, raw_material_id, raw_material_amount, solvent,
        solvent_amount, total_volume, preparation_date, expiry_date,
        prepared_by, checked_by, calibration_required, calibration_result, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        solution_code, solution_name, concentration, concentration_unit,
        preparation_method, raw_material_id, raw_material_amount, solvent,
        solvent_amount, total_volume, preparation_date, expiry_date,
        prepared_by, checked_by, calibration_required, calibration_result, remark
      ]
    );

    res.json({ code: 200, message: '创建标准溶液成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建标准溶液失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 删除标准溶液
export const removeSolution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM solution_preparations WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除标准溶液失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
