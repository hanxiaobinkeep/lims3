import { Request, Response } from 'express';
import pool from '../config/database.js';

// 获取存样地点列表
export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, room, cabinet, locationType, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (room) {
      whereClause += ' AND room = ?';
      params.push(room);
    }

    if (cabinet) {
      whereClause += ' AND cabinet = ?';
      params.push(cabinet);
    }

    if (locationType) {
      whereClause += ' AND location_type = ?';
      params.push(locationType);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (location_code LIKE ? OR room LIKE ? OR cabinet LIKE ? OR remark LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM storage_locations ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT sl.*, u.real_name as created_by_name
       FROM storage_locations sl
       LEFT JOIN users u ON sl.created_by = u.id
       ${whereClause}
       ORDER BY sl.room, sl.cabinet, sl.shelf, sl.box
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
    console.error('Get storage locations error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取存样地点详情
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT sl.*, u.real_name as created_by_name
       FROM storage_locations sl
       LEFT JOIN users u ON sl.created_by = u.id
       WHERE sl.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '存样地点不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get storage location error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 创建存样地点
export const create = async (req: Request, res: Response) => {
  try {
    const { room, cabinet, shelf, box, locationType, capacity, temperature, humidity, remark } = req.body;
    const userId = (req as any).user?.id;

    const locationCode = `L-${cabinet}-${shelf}-${box}`;

    const [result]: any = await pool.execute(
      `INSERT INTO storage_locations (location_code, room, cabinet, shelf, box, location_type, capacity, temperature, humidity, remark, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [locationCode, room, cabinet, shelf, box, locationType || 'other', capacity || 1, temperature || null, humidity || null, remark || null, userId || null]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, locationCode } });
  } catch (error: any) {
    console.error('Create storage location error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '存样地点编码或位置已存在', data: null });
    }
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 更新存样地点
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { room, cabinet, shelf, box, locationType, capacity, temperature, humidity, status, remark } = req.body;

    const locationCode = `L-${cabinet}-${shelf}-${box}`;

    await pool.execute(
      `UPDATE storage_locations
       SET location_code = ?, room = ?, cabinet = ?, shelf = ?, box = ?, location_type = ?,
           capacity = ?, temperature = ?, humidity = ?, status = ?, remark = ?
       WHERE id = ?`,
      [locationCode, room, cabinet, shelf, box, locationType, capacity || 1, temperature || null, humidity || null, status || 'active', remark || null, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error: any) {
    console.error('Update storage location error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '存样地点编码或位置已存在', data: null });
    }
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 删除存样地点
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 检查是否有关联的存样记录
    const [records]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM storage_records WHERE location_id = ? AND status = "stored"',
      [id]
    );

    if (records[0].count > 0) {
      return res.status(400).json({ code: 400, message: '该地点还有样品存放，无法删除', data: null });
    }

    await pool.execute('DELETE FROM storage_locations WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete storage location error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取存样记录列表
export const getStorageRecords = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, sampleId, locationId, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (sampleId) {
      whereClause += ' AND sr.sample_id = ?';
      params.push(sampleId);
    }

    if (locationId) {
      whereClause += ' AND sr.location_id = ?';
      params.push(locationId);
    }

    if (status) {
      whereClause += ' AND sr.status = ?';
      params.push(status);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM storage_records sr ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT sr.*, s.sample_no, s.sample_name, sl.location_code, sl.room, sl.cabinet, sl.shelf, sl.box,
              u1.real_name as stored_by_name, u2.real_name as retrieved_by_name
       FROM storage_records sr
       LEFT JOIN samples s ON sr.sample_id = s.id
       LEFT JOIN storage_locations sl ON sr.location_id = sl.id
       LEFT JOIN users u1 ON sr.stored_by = u1.id
       LEFT JOIN users u2 ON sr.retrieved_by = u2.id
       ${whereClause}
       ORDER BY sr.stored_at DESC
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
    console.error('Get storage records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 样品入库
export const storeSample = async (req: Request, res: Response) => {
  try {
    const { sampleId, locationId, storageType, quantity, unit, remark } = req.body;
    const userId = (req as any).user?.id;

    // 检查地点是否已满
    const [location]: any = await pool.execute(
      'SELECT capacity, current_count, status FROM storage_locations WHERE id = ?',
      [locationId]
    );

    if (location.length === 0) {
      return res.status(404).json({ code: 404, message: '存样地点不存在', data: null });
    }

    if (location[0].status === 'full' || location[0].current_count >= location[0].capacity) {
      return res.status(400).json({ code: 400, message: '该存样地点已满', data: null });
    }

    // 创建存样记录
    const [result]: any = await pool.execute(
      `INSERT INTO storage_records (sample_id, location_id, storage_type, quantity, unit, stored_by, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sampleId, locationId, storageType || 'other', quantity || null, unit || null, userId || null, remark || null]
    );

    // 更新地点当前数量
    await pool.execute(
      'UPDATE storage_locations SET current_count = current_count + 1, status = IF(current_count + 1 >= capacity, "full", status) WHERE id = ?',
      [locationId]
    );

    res.json({ code: 200, message: '入库成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Store sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 样品出库
export const retrieveSample = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    const userId = (req as any).user?.id;

    const [record]: any = await pool.execute(
      'SELECT location_id, status FROM storage_records WHERE id = ?',
      [id]
    );

    if (record.length === 0) {
      return res.status(404).json({ code: 404, message: '存样记录不存在', data: null });
    }

    if (record[0].status !== 'stored') {
      return res.status(400).json({ code: 400, message: '该样品已出库或过期', data: null });
    }

    await pool.execute(
      `UPDATE storage_records SET status = 'retrieved', retrieved_by = ?, retrieved_at = NOW(), remark = CONCAT(IFNULL(remark, ''), ' ', ?) WHERE id = ?`,
      [userId || null, remark || '取走', id]
    );

    // 更新地点当前数量
    await pool.execute(
      'UPDATE storage_locations SET current_count = GREATEST(current_count - 1, 0), status = IF(current_count - 1 < capacity, "active", status) WHERE id = ?',
      [record[0].location_id]
    );

    res.json({ code: 200, message: '出库成功', data: null });
  } catch (error) {
    console.error('Retrieve sample error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取房间列表（用于筛选）
export const getRooms = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT DISTINCT room FROM storage_locations ORDER BY room');
    res.json({ code: 200, message: 'success', data: rows.map((r: any) => r.room) });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 获取统计信息
export const getStats = async (req: Request, res: Response) => {
  try {
    const [locationStats]: any = await pool.query(`
      SELECT
        COUNT(*) as total_locations,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'full' THEN 1 ELSE 0 END) as full_count,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count,
        SUM(current_count) as total_stored,
        SUM(capacity) as total_capacity
      FROM storage_locations
    `);

    const [typeStats]: any = await pool.query(`
      SELECT location_type, COUNT(*) as count, SUM(current_count) as stored_count
      FROM storage_locations
      GROUP BY location_type
    `);

    res.json({
      code: 200,
      message: 'success',
      data: {
        overview: locationStats[0],
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
