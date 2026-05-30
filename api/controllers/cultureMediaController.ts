import { Request, Response } from 'express';
import pool from '../config/database.js';

// ==================== 培养基基础信息 ====================

export const getCultureMediaList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, mediaType, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (mediaType) {
      whereClause += ' AND media_type = ?';
      params.push(mediaType);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (media_code LIKE ? OR media_name LIKE ? OR manufacturer LIKE ? OR batch_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM culture_media ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT cm.*, u.real_name as created_by_name
       FROM culture_media cm
       LEFT JOIN users u ON cm.created_by = u.id
       ${whereClause}
       ORDER BY cm.created_at DESC
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
    console.error('Get culture media list error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getCultureMediaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT cm.*, u.real_name as created_by_name
       FROM culture_media cm
       LEFT JOIN users u ON cm.created_by = u.id
       WHERE cm.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '培养基不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get culture media error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createCultureMedia = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      mediaCode, mediaName, mediaType, manufacturer, batchNo,
      specification, quantity, unit, storageCondition, expiryDate, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO culture_media (
        media_code, media_name, media_type, manufacturer, batch_no,
        specification, quantity, unit, storage_condition, expiry_date, status, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mediaCode, mediaName, mediaType || null, manufacturer || null, batchNo || null,
        specification || null, quantity || null, unit || 'g', storageCondition || null,
        expiryDate || null, 'in_stock', remark || null, userId || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error: any) {
    console.error('Create culture media error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '培养基编码已存在', data: null });
    }
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateCultureMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      mediaCode, mediaName, mediaType, manufacturer, batchNo,
      specification, quantity, unit, storageCondition, expiryDate, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE culture_media SET
        media_code = ?, media_name = ?, media_type = ?, manufacturer = ?, batch_no = ?,
        specification = ?, quantity = ?, unit = ?, storage_condition = ?, expiry_date = ?,
        status = ?, remark = ?
       WHERE id = ?`,
      [
        mediaCode, mediaName, mediaType || null, manufacturer || null, batchNo || null,
        specification || null, quantity || null, unit || 'g', storageCondition || null,
        expiryDate || null, status || 'in_stock', remark || null, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error: any) {
    console.error('Update culture media error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '培养基编码已存在', data: null });
    }
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteCultureMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [records]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM media_acceptance_records WHERE media_id = ?',
      [id]
    );
    if (records[0].count > 0) {
      return res.status(400).json({ code: 400, message: '该培养基存在关联记录，无法删除', data: null });
    }

    await pool.execute('DELETE FROM culture_media WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete culture media error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// ==================== 验收记录管理 ====================

export const getAcceptanceRecords = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, mediaId, acceptanceResult } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (mediaId) {
      whereClause += ' AND mar.media_id = ?';
      params.push(mediaId);
    }

    if (acceptanceResult) {
      whereClause += ' AND mar.acceptance_result = ?';
      params.push(acceptanceResult);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM media_acceptance_records mar ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT mar.*, cm.media_code, cm.media_name, u.real_name as inspector_name
       FROM media_acceptance_records mar
       LEFT JOIN culture_media cm ON mar.media_id = cm.id
       LEFT JOIN users u ON mar.inspector_id = u.id
       ${whereClause}
       ORDER BY mar.acceptance_date DESC
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
    console.error('Get acceptance records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getAcceptanceRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT mar.*, cm.media_code, cm.media_name, u.real_name as inspector_name
       FROM media_acceptance_records mar
       LEFT JOIN culture_media cm ON mar.media_id = cm.id
       LEFT JOIN users u ON mar.inspector_id = u.id
       WHERE mar.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '验收记录不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get acceptance record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createAcceptanceRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      mediaId, acceptanceDate, acceptanceResult,
      appearanceCheck, sterilityCheck, growthTest, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO media_acceptance_records (
        media_id, acceptance_date, acceptance_result,
        appearance_check, sterility_check, growth_test, inspector_id, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mediaId, acceptanceDate || null, acceptanceResult || 'pending',
        appearanceCheck || null, sterilityCheck || null, growthTest || null,
        userId || null, remark || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create acceptance record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateAcceptanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      mediaId, acceptanceDate, acceptanceResult,
      appearanceCheck, sterilityCheck, growthTest, remark
    } = req.body;

    await pool.execute(
      `UPDATE media_acceptance_records SET
        media_id = ?, acceptance_date = ?, acceptance_result = ?,
        appearance_check = ?, sterility_check = ?, growth_test = ?, remark = ?
       WHERE id = ?`,
      [
        mediaId, acceptanceDate || null, acceptanceResult || 'pending',
        appearanceCheck || null, sterilityCheck || null, growthTest || null,
        remark || null, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update acceptance record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteAcceptanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM media_acceptance_records WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete acceptance record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// ==================== 配制记录管理 ====================

export const getPreparationRecords = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, mediaId, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (mediaId) {
      whereClause += ' AND mpr.media_id = ?';
      params.push(mediaId);
    }

    if (status) {
      whereClause += ' AND mpr.status = ?';
      params.push(status);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM media_preparation_records mpr ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT mpr.*, cm.media_code, cm.media_name, u.real_name as prepared_by_name
       FROM media_preparation_records mpr
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u ON mpr.prepared_by = u.id
       ${whereClause}
       ORDER BY mpr.preparation_date DESC
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
    console.error('Get preparation records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getPreparationRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT mpr.*, cm.media_code, cm.media_name, u.real_name as prepared_by_name
       FROM media_preparation_records mpr
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u ON mpr.prepared_by = u.id
       WHERE mpr.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '配制记录不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get preparation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createPreparationRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      mediaId, preparationDate, preparedQuantity, unit,
      sterilizationMethod, sterilizationTemp, sterilizationDuration, phValue, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO media_preparation_records (
        media_id, preparation_date, prepared_by, prepared_quantity, unit,
        sterilization_method, sterilization_temp, sterilization_duration, ph_value, status, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mediaId, preparationDate || null, userId || null, preparedQuantity || null, unit || 'mL',
        sterilizationMethod || 'autoclave', sterilizationTemp || null, sterilizationDuration || null,
        phValue || null, 'prepared', remark || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create preparation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updatePreparationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      mediaId, preparationDate, preparedQuantity, unit,
      sterilizationMethod, sterilizationTemp, sterilizationDuration, phValue, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE media_preparation_records SET
        media_id = ?, preparation_date = ?, prepared_quantity = ?, unit = ?,
        sterilization_method = ?, sterilization_temp = ?, sterilization_duration = ?,
        ph_value = ?, status = ?, remark = ?
       WHERE id = ?`,
      [
        mediaId, preparationDate || null, preparedQuantity || null, unit || 'mL',
        sterilizationMethod || 'autoclave', sterilizationTemp || null, sterilizationDuration || null,
        phValue || null, status || 'prepared', remark || null, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update preparation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deletePreparationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [usage]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM media_usage_records WHERE preparation_id = ?',
      [id]
    );
    if (usage[0].count > 0) {
      return res.status(400).json({ code: 400, message: '该配制记录存在领用记录，无法删除', data: null });
    }

    await pool.execute('DELETE FROM media_preparation_records WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete preparation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const confirmSterilization = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { sterilizationDate } = req.body;

    const [record]: any = await pool.execute(
      'SELECT status FROM media_preparation_records WHERE id = ?',
      [id]
    );
    if (record.length === 0) {
      return res.status(404).json({ code: 404, message: '配制记录不存在', data: null });
    }

    await pool.execute(
      `UPDATE media_preparation_records SET
        status = 'sterilized', sterilization_date = ?, prepared_by = ?
       WHERE id = ?`,
      [sterilizationDate || new Date(), userId || null, id]
    );

    res.json({ code: 200, message: '灭菌确认成功', data: null });
  } catch (error) {
    console.error('Confirm sterilization error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// ==================== 预培养记录管理 ====================

export const getPreIncubationRecords = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, preparationId, sterilityResult } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (preparationId) {
      whereClause += ' AND mpir.preparation_id = ?';
      params.push(preparationId);
    }

    if (sterilityResult) {
      whereClause += ' AND mpir.sterility_result = ?';
      params.push(sterilityResult);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM media_pre_incubation_records mpir ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT mpir.*, cm.media_code, cm.media_name, u.real_name as inspector_name
       FROM media_pre_incubation_records mpir
       LEFT JOIN media_preparation_records mpr ON mpir.preparation_id = mpr.id
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u ON mpir.inspector_id = u.id
       ${whereClause}
       ORDER BY mpir.incubation_start DESC
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
    console.error('Get pre-incubation records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getPreIncubationRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT mpir.*, cm.media_code, cm.media_name, u.real_name as inspector_name
       FROM media_pre_incubation_records mpir
       LEFT JOIN media_preparation_records mpr ON mpir.preparation_id = mpr.id
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u ON mpir.inspector_id = u.id
       WHERE mpir.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '预培养记录不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get pre-incubation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createPreIncubationRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      preparationId, incubatorId, incubatorModel, incubationTemp,
      incubationStart, incubationEnd, incubationDuration, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO media_pre_incubation_records (
        preparation_id, incubator_id, incubator_model, incubation_temp,
        incubation_start, incubation_end, incubation_duration, inspector_id, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        preparationId, incubatorId || null, incubatorModel || null, incubationTemp || null,
        incubationStart || null, incubationEnd || null, incubationDuration || null,
        userId || null, remark || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create pre-incubation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updatePreIncubationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      preparationId, incubatorId, incubatorModel, incubationTemp,
      incubationStart, incubationEnd, incubationDuration, remark
    } = req.body;

    await pool.execute(
      `UPDATE media_pre_incubation_records SET
        preparation_id = ?, incubator_id = ?, incubator_model = ?, incubation_temp = ?,
        incubation_start = ?, incubation_end = ?, incubation_duration = ?, remark = ?
       WHERE id = ?`,
      [
        preparationId, incubatorId || null, incubatorModel || null, incubationTemp || null,
        incubationStart || null, incubationEnd || null, incubationDuration || null,
        remark || null, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update pre-incubation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deletePreIncubationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM media_pre_incubation_records WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete pre-incubation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const confirmSterilityResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { sterilityResult, contaminationCount } = req.body;

    const [record]: any = await pool.execute(
      'SELECT id FROM media_pre_incubation_records WHERE id = ?',
      [id]
    );
    if (record.length === 0) {
      return res.status(404).json({ code: 404, message: '预培养记录不存在', data: null });
    }

    await pool.execute(
      `UPDATE media_pre_incubation_records SET
        sterility_result = ?, contamination_count = ?, inspector_id = ?
       WHERE id = ?`,
      [sterilityResult || 'pending', contaminationCount || 0, userId || null, id]
    );

    res.json({ code: 200, message: '无菌检查结果确认成功', data: null });
  } catch (error) {
    console.error('Confirm sterility result error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// ==================== 领用记录管理 ====================

export const getUsageRecords = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, preparationId, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (preparationId) {
      whereClause += ' AND mur.preparation_id = ?';
      params.push(preparationId);
    }

    if (status) {
      whereClause += ' AND mur.status = ?';
      params.push(status);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM media_usage_records mur ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT mur.*, cm.media_code, cm.media_name, u.real_name as used_by_name
       FROM media_usage_records mur
       LEFT JOIN media_preparation_records mpr ON mur.preparation_id = mpr.id
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u ON mur.used_by = u.id
       ${whereClause}
       ORDER BY mur.used_date DESC
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
    console.error('Get usage records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getUsageRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT mur.*, cm.media_code, cm.media_name, u.real_name as used_by_name
       FROM media_usage_records mur
       LEFT JOIN media_preparation_records mpr ON mur.preparation_id = mpr.id
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u ON mur.used_by = u.id
       WHERE mur.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '领用记录不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get usage record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createUsageRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      preparationId, usedQuantity, unit, usedDate, purpose, testSampleNo, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO media_usage_records (
        preparation_id, used_quantity, unit, used_by, used_date, purpose, test_sample_no, status, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        preparationId, usedQuantity || null, unit || 'mL', userId || null,
        usedDate || null, purpose || null, testSampleNo || null, 'used', remark || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create usage record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateUsageRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      preparationId, usedQuantity, unit, usedDate, purpose, testSampleNo, status, remark
    } = req.body;

    await pool.execute(
      `UPDATE media_usage_records SET
        preparation_id = ?, used_quantity = ?, unit = ?, used_date = ?,
        purpose = ?, test_sample_no = ?, status = ?, remark = ?
       WHERE id = ?`,
      [
        preparationId, usedQuantity || null, unit || 'mL', usedDate || null,
        purpose || null, testSampleNo || null, status || 'used', remark || null, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update usage record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteUsageRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM media_usage_records WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete usage record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// ==================== 灭活记录管理 ====================

export const getInactivationRecords = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, preparationId } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (preparationId) {
      whereClause += ' AND mir.preparation_id = ?';
      params.push(preparationId);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM media_inactivation_records mir ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT mir.*, cm.media_code, cm.media_name,
              u1.real_name as operator_name, u2.real_name as verified_by_name
       FROM media_inactivation_records mir
       LEFT JOIN media_preparation_records mpr ON mir.preparation_id = mpr.id
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u1 ON mir.operator_id = u1.id
       LEFT JOIN users u2 ON mir.verified_by = u2.id
       ${whereClause}
       ORDER BY mir.inactivation_date DESC
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
    console.error('Get inactivation records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getInactivationRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT mir.*, cm.media_code, cm.media_name,
              u1.real_name as operator_name, u2.real_name as verified_by_name
       FROM media_inactivation_records mir
       LEFT JOIN media_preparation_records mpr ON mir.preparation_id = mpr.id
       LEFT JOIN culture_media cm ON mpr.media_id = cm.id
       LEFT JOIN users u1 ON mir.operator_id = u1.id
       LEFT JOIN users u2 ON mir.verified_by = u2.id
       WHERE mir.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '灭活记录不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get inactivation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createInactivationRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      preparationId, inactivationDate, inactivationMethod,
      inactivationTemp, inactivationDuration, remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO media_inactivation_records (
        preparation_id, inactivation_date, inactivation_method,
        inactivation_temp, inactivation_duration, operator_id, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        preparationId, inactivationDate || null, inactivationMethod || 'autoclave',
        inactivationTemp || null, inactivationDuration || null, userId || null, remark || null
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create inactivation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateInactivationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      preparationId, inactivationDate, inactivationMethod,
      inactivationTemp, inactivationDuration, remark
    } = req.body;

    await pool.execute(
      `UPDATE media_inactivation_records SET
        preparation_id = ?, inactivation_date = ?, inactivation_method = ?,
        inactivation_temp = ?, inactivation_duration = ?, remark = ?
       WHERE id = ?`,
      [
        preparationId, inactivationDate || null, inactivationMethod || 'autoclave',
        inactivationTemp || null, inactivationDuration || null, remark || null, id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update inactivation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteInactivationRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM media_inactivation_records WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete inactivation record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const verifyInactivation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const [record]: any = await pool.execute(
      'SELECT id, operator_id FROM media_inactivation_records WHERE id = ?',
      [id]
    );
    if (record.length === 0) {
      return res.status(404).json({ code: 404, message: '灭活记录不存在', data: null });
    }

    if (record[0].operator_id === userId) {
      return res.status(400).json({ code: 400, message: '操作人与确认人不能为同一人', data: null });
    }

    await pool.execute(
      'UPDATE media_inactivation_records SET verified_by = ? WHERE id = ?',
      [userId || null, id]
    );

    res.json({ code: 200, message: '双人确认成功', data: null });
  } catch (error) {
    console.error('Verify inactivation error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
