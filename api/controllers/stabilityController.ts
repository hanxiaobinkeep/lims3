import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getProtocols = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (protocol_no LIKE ? OR product_name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM stability_protocols ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT * FROM stability_protocols ${whereClause} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`,
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
    console.error('Get stability protocols error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getList = getProtocols;

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM stability_protocols WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '记录不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get stability protocol by id error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createProtocol = async (req: Request, res: Response) => {
  try {
    const { productName, batchNo, storageCondition, testItems, duration, remark } = req.body;
    const protocolNo = `STB${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO stability_protocols (protocol_no, product_name, batch_no, storage_condition, test_items, duration, status, remark) VALUES (?, ?, ?, ?, ?, ?, "draft", ?)',
      [protocolNo, productName, batchNo, storageCondition, testItems, duration, remark]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, protocolNo } });
  } catch (error) {
    console.error('Create stability protocol error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = createProtocol;

export const updateProtocol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { productName, batchNo, storageCondition, testItems, duration, status, remark } = req.body;

    await pool.execute(
      'UPDATE stability_protocols SET product_name = ?, batch_no = ?, storage_condition = ?, test_items = ?, duration = ?, status = ?, remark = ? WHERE id = ?',
      [productName, batchNo, storageCondition, testItems, duration, status, remark, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update stability protocol error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = updateProtocol;

export const deleteProtocol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM stability_protocols WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete stability protocol error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = deleteProtocol;
