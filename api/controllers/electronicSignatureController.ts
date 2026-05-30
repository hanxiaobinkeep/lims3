import { Request, Response } from 'express';
import pool from '../config/database.js';
import crypto from 'crypto';

export const getSignatureConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const [rows]: any = await pool.execute(
      'SELECT * FROM electronic_signatures WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    res.json({
      code: 200,
      message: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取签名配置失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const setupSignature = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { signatureType, signatureImage, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ code: 400, message: '签名密码至少需要6位', data: null });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    await pool.execute(
      `INSERT INTO electronic_signatures 
       (user_id, signature_type, signature_image, password_hash, is_active) 
       VALUES (?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE 
       signature_image = VALUES(signature_image), 
       password_hash = VALUES(password_hash)`,
      [userId, signatureType, signatureImage, passwordHash]
    );

    res.json({ code: 200, message: '签名设置成功', data: null });
  } catch (error) {
    console.error('设置签名失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateSignature = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { signatureType, signatureImage, oldPassword, newPassword } = req.body;

    if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '新密码至少需要6位', data: null });
    }

    const [existing]: any = await pool.execute(
      'SELECT * FROM electronic_signatures WHERE user_id = ? AND signature_type = ?',
      [userId, signatureType]
    );

    if (existing.length === 0) {
      return res.status(404).json({ code: 404, message: '签名配置不存在', data: null });
    }

    if (oldPassword) {
      const oldHash = crypto.createHash('sha256').update(oldPassword).digest('hex');
      if (existing[0].password_hash !== oldHash) {
        return res.status(400).json({ code: 400, message: '原密码错误', data: null });
      }
    }

    const newPasswordHash = newPassword 
      ? crypto.createHash('sha256').update(newPassword).digest('hex')
      : existing[0].password_hash;

    await pool.execute(
      `UPDATE electronic_signatures SET 
       signature_image = COALESCE(?, signature_image),
       password_hash = ?
       WHERE user_id = ? AND signature_type = ?`,
      [signatureImage, newPasswordHash, userId, signatureType]
    );

    res.json({ code: 200, message: '签名更新成功', data: null });
  } catch (error) {
    console.error('更新签名失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createSignature = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { recordType, recordId, signatureType, password, content, remark } = req.body;

    const [userRows]: any = await pool.execute(
      'SELECT real_name FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const signerName = userRows[0].real_name;

    const [sigConfig]: any = await pool.execute(
      'SELECT * FROM electronic_signatures WHERE user_id = ? AND signature_type = ? AND is_active = TRUE',
      [userId, signatureType]
    );

    if (sigConfig.length === 0) {
      return res.status(400).json({ code: 400, message: '用户未配置该类型签名', data: null });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (sigConfig[0].password_hash !== passwordHash) {
      return res.status(400).json({ code: 400, message: '签名密码错误', data: null });
    }

    const signatureData = JSON.stringify({
      userId,
      signerName,
      recordType,
      recordId,
      signatureType,
      timestamp: new Date().toISOString()
    });
    const signatureHash = crypto.createHash('sha256').update(signatureData).digest('hex');

    const [result]: any = await pool.execute(
      `INSERT INTO signature_records 
       (record_type, record_id, signature_type, signer_id, signer_name, signature_hash, signature_image, ip_address, user_agent, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordType,
        recordId,
        signatureType,
        userId,
        signerName,
        signatureHash,
        sigConfig[0].signature_image,
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        remark
      ]
    );

    // 创建验证记录
    await pool.execute(
      `INSERT INTO signature_verifications 
       (signature_record_id, verified_content, verification_hash) 
       VALUES (?, ?, ?)`,
      [
        result.insertId,
        content,
        crypto.createHash('sha256').update(content || signatureData).digest('hex')
      ]
    );

    res.json({
      code: 200,
      message: '签名成功',
      data: {
        id: result.insertId,
        signatureHash,
        signedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('创建签名失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const verifySignature = async (req: Request, res: Response) => {
  try {
    const { signatureRecordId } = req.params;

    const [rows]: any = await pool.execute(
      `SELECT sr.*, sv.verified_content, sv.verification_hash, sv.is_valid 
       FROM signature_records sr 
       LEFT JOIN signature_verifications sv ON sr.id = sv.signature_record_id 
       WHERE sr.id = ?`,
      [signatureRecordId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '签名记录不存在', data: null });
    }

    const record = rows[0];
    const currentHash = crypto.createHash('sha256').update(record.verified_content || '').digest('hex');
    const isValid = currentHash === record.verification_hash && record.is_valid;

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...record,
        isValid
      }
    });
  } catch (error) {
    console.error('验证签名失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getSignatureHistory = async (req: Request, res: Response) => {
  try {
    const { recordType, recordId } = req.query;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (recordType) {
      whereClause += ' AND sr.record_type = ?';
      params.push(recordType);
    }
    if (recordId) {
      whereClause += ' AND sr.record_id = ?';
      params.push(recordId);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM signature_records sr ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT sr.*, u.real_name as signer_real_name, sv.is_valid
       FROM signature_records sr
       LEFT JOIN users u ON sr.signer_id = u.id
       LEFT JOIN signature_verifications sv ON sr.id = sv.signature_record_id
       ${whereClause}
       ORDER BY sr.signed_at DESC
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
    console.error('获取签名历史失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const revokeSignature = async (req: Request, res: Response) => {
  try {
    const { signatureRecordId } = req.params;
    const { password, reason } = req.body;
    const userId = (req as any).user?.id;

    const [rows]: any = await pool.execute(
      'SELECT * FROM signature_records WHERE id = ?',
      [signatureRecordId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '签名记录不存在', data: null });
    }

    const signature = rows[0];

    const [sigConfig]: any = await pool.execute(
      'SELECT * FROM electronic_signatures WHERE user_id = ? AND signature_type = ? AND is_active = TRUE',
      [signature.signer_id, 'cancellation']
    );

    if (sigConfig.length > 0) {
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      if (sigConfig[0].password_hash !== passwordHash) {
        return res.status(400).json({ code: 400, message: '签名密码错误', data: null });
      }
    }

    await pool.execute(
      'UPDATE signature_verifications SET is_valid = FALSE WHERE signature_record_id = ?',
      [signatureRecordId]
    );

    await pool.execute(
      `INSERT INTO signature_records 
       (record_type, record_id, signature_type, signer_id, signer_name, signature_hash, remark) 
       VALUES (?, ?, 'cancellation', ?, ?, ?, ?)`,
      [
        signature.record_type,
        signature.record_id,
        userId,
        (req as any).user?.realName || 'Unknown',
        crypto.createHash('sha256').update(`revoked:${signatureRecordId}:${new Date().toISOString()}`).digest('hex'),
        `撤销签名: ${reason}`
      ]
    );

    res.json({ code: 200, message: '签名已撤销', data: null });
  } catch (error) {
    console.error('撤销签名失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
