import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND sr.status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (sr.sample_no LIKE ? OR sr.sample_name LIKE ? OR sr.batch_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM sampling_records sr ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT sr.*, ir.request_no, u1.real_name as sampling_person_name, u2.real_name as created_by_name
       FROM sampling_records sr
       LEFT JOIN inspection_requests ir ON sr.request_id = ir.id
       LEFT JOIN users u1 ON sr.sampling_person_id = u1.id
       LEFT JOIN users u2 ON sr.created_by = u2.id
       ${whereClause}
       ORDER BY sr.created_at DESC
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
    console.error('Get sampling records error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT sr.*, ir.request_no, u1.real_name as sampling_person_name, u2.real_name as created_by_name 
       FROM sampling_records sr 
       LEFT JOIN inspection_requests ir ON sr.request_id = ir.id 
       LEFT JOIN users u1 ON sr.sampling_person_id = u1.id 
       LEFT JOIN users u2 ON sr.created_by = u2.id 
       WHERE sr.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '取样记录不存在', data: null });
    }

    // 获取交接记录
    const [handoverRecords]: any = await pool.execute(
      `SELECT shr.*, u1.real_name as from_person_name, u2.real_name as to_person_name 
       FROM sample_handover_records shr 
       LEFT JOIN users u1 ON shr.from_person_id = u1.id 
       LEFT JOIN users u2 ON shr.to_person_id = u2.id 
       WHERE shr.sampling_record_id = ? 
       ORDER BY shr.created_at DESC`,
      [id]
    );

    // 获取标签打印记录
    const [labelRecords]: any = await pool.execute(
      `SELECT lpr.*, u.real_name as printed_by_name 
       FROM label_print_records lpr 
       LEFT JOIN users u ON lpr.printed_by = u.id 
       WHERE lpr.sampling_record_id = ? 
       ORDER BY lpr.created_at DESC`,
      [id]
    );

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...rows[0],
        handoverRecords,
        labelRecords
      }
    });
  } catch (error) {
    console.error('Get sampling record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const {
      requestId,
      sampleName,
      batchNo,
      samplingPersonId,
      samplingTime,
      samplingQuantity,
      samplingUnit,
      samplingLocation,
      samplingMethod,
      storageLocation,
      remark
    } = req.body;

    const sampleNo = `S${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const createdBy = (req as any).user?.id;

    const [result]: any = await pool.execute(
      `INSERT INTO sampling_records 
       (request_id, sample_no, sample_name, batch_no, sampling_person_id, sampling_time, sampling_quantity, sampling_unit, sampling_location, sampling_method, storage_location, remark, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        requestId,
        sampleNo,
        sampleName,
        batchNo,
        samplingPersonId,
        samplingTime,
        samplingQuantity,
        samplingUnit,
        samplingLocation,
        samplingMethod,
        storageLocation,
        remark,
        createdBy
      ]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, sampleNo } });
  } catch (error) {
    console.error('Create sampling record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      sampleName,
      batchNo,
      samplingPersonId,
      samplingTime,
      samplingQuantity,
      samplingUnit,
      samplingLocation,
      samplingMethod,
      storageLocation,
      status,
      remark
    } = req.body;

    await pool.execute(
      `UPDATE sampling_records SET 
       sample_name = ?, batch_no = ?, sampling_person_id = ?, sampling_time = ?, 
       sampling_quantity = ?, sampling_unit = ?, sampling_location = ?, 
       sampling_method = ?, storage_location = ?, status = ?, remark = ? 
       WHERE id = ?`,
      [
        sampleName,
        batchNo,
        samplingPersonId,
        samplingTime,
        samplingQuantity,
        samplingUnit,
        samplingLocation,
        samplingMethod,
        storageLocation,
        status,
        remark,
        id
      ]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update sampling record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM sampling_records WHERE id = ?', [id]);
    await pool.execute('DELETE FROM sample_handover_records WHERE sampling_record_id = ?', [id]);
    await pool.execute('DELETE FROM label_print_records WHERE sampling_record_id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete sampling record error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const recordSampling = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      samplingPersonId,
      samplingTime,
      samplingQuantity,
      samplingUnit,
      samplingLocation,
      samplingMethod,
      remark
    } = req.body;

    await pool.execute(
      `UPDATE sampling_records SET 
       sampling_person_id = ?, sampling_time = ?, sampling_quantity = ?, 
       sampling_unit = ?, sampling_location = ?, sampling_method = ?, 
       remark = ?, status = 'sampled' 
       WHERE id = ?`,
      [
        samplingPersonId,
        samplingTime,
        samplingQuantity,
        samplingUnit,
        samplingLocation,
        samplingMethod,
        remark,
        id
      ]
    );

    res.json({ code: 200, message: '取样记录成功', data: null });
  } catch (error) {
    console.error('Record sampling error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const recordHandover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      handoverType,
      fromPersonId,
      toPersonId,
      handoverTime,
      handoverQuantity,
      remark
    } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO sample_handover_records 
       (sampling_record_id, handover_type, from_person_id, to_person_id, handover_time, handover_quantity, handover_status, remark) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        id,
        handoverType,
        fromPersonId,
        toPersonId,
        handoverTime,
        handoverQuantity,
        remark
      ]
    );

    res.json({ code: 200, message: '交接记录创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Record handover error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const confirmHandover = async (req: Request, res: Response) => {
  try {
    const { handoverId } = req.params;
    const { status, remark } = req.body;

    await pool.execute(
      'UPDATE sample_handover_records SET handover_status = ?, remark = COALESCE(?, remark) WHERE id = ?',
      [status, remark, handoverId]
    );

    // 如果是完成交接，更新取样记录状态
    if (status === 'completed') {
      const [handover]: any = await pool.execute(
        'SELECT sampling_record_id, handover_type FROM sample_handover_records WHERE id = ?',
        [handoverId]
      );
      if (handover.length > 0) {
        const { sampling_record_id, handover_type } = handover[0];
        if (handover_type === 'sampling_to_lab') {
          await pool.execute(
            "UPDATE sampling_records SET status = 'received' WHERE id = ?",
            [sampling_record_id]
          );
        }
      }
    }

    res.json({ code: 200, message: '交接确认成功', data: null });
  } catch (error) {
    console.error('Confirm handover error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const printLabel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { labelType, labelContent } = req.body;
    const printedBy = (req as any).user?.id;

    // 检查是否已有记录
    const [existing]: any = await pool.execute(
      'SELECT id, print_count FROM label_print_records WHERE sampling_record_id = ? AND label_type = ?',
      [id, labelType]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE label_print_records SET print_count = print_count + 1, printed_by = ?, print_time = NOW(), label_content = ? WHERE id = ?',
        [printedBy, JSON.stringify(labelContent), existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO label_print_records 
         (sampling_record_id, label_type, print_count, printed_by, print_time, label_content) 
         VALUES (?, ?, 1, ?, NOW(), ?)`,
        [id, labelType, printedBy, JSON.stringify(labelContent)]
      );
    }

    res.json({ code: 200, message: '标签打印记录成功', data: null });
  } catch (error) {
    console.error('Print label error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
