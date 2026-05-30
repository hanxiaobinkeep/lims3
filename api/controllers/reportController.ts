import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (r.report_no LIKE ? OR r.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM inspection_reports r ${whereClause}`,
      params
    );

    const [rows]: any = await pool.query(
      `SELECT r.*, t.task_no, t.test_item, s.sample_name, s.sample_no, s.batch_no, u.real_name as issuer_name
       FROM inspection_reports r
       LEFT JOIN inspection_tasks t ON r.task_id = t.id
       LEFT JOIN samples s ON t.sample_id = s.id
       LEFT JOIN users u ON r.issuer_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
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
    console.error('Get reports error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      `SELECT r.*, t.task_no, t.test_item, s.sample_name, s.sample_no, s.batch_no, u.real_name as issuer_name 
       FROM inspection_reports r 
       LEFT JOIN inspection_tasks t ON r.task_id = t.id 
       LEFT JOIN samples s ON t.sample_id = s.id 
       LEFT JOIN users u ON r.issuer_id = u.id 
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '报告不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { taskId, content } = req.body;
    const reportNo = `REP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.random()).slice(2, 5)}`;

    const [result]: any = await pool.execute(
      'INSERT INTO inspection_reports (report_no, task_id, content, status) VALUES (?, ?, ?, "draft")',
      [reportNo, taskId, content]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId, reportNo } });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

// 自动生成报告内容
export const generateReportContent = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.query;

    // 获取任务详情
    const [taskRows]: any = await pool.execute(
      `SELECT t.*, s.sample_name, s.sample_no, s.batch_no, s.specification, s.manufacture_date,
              m.name as method_name, m.code as method_code, u.real_name as tester_name
       FROM inspection_tasks t
       LEFT JOIN samples s ON t.sample_id = s.id
       LEFT JOIN methods m ON t.method_id = m.id
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.id = ?`,
      [taskId]
    );

    if (taskRows.length === 0) {
      return res.status(404).json({ code: 404, message: '任务不存在', data: null });
    }

    const task = taskRows[0];

    // 获取检验结果
    const [resultRows]: any = await pool.execute(
      `SELECT ir.*, i.name as instrument_name
       FROM inspection_results ir
       LEFT JOIN instruments i ON ir.instrument_id = i.id
       WHERE ir.task_id = ?`,
      [taskId]
    );

    const currentDate = new Date().toISOString().slice(0, 10);

    // 生成报告内容
    const reportContent = `
检验报告
报告编号：待生成
生成日期：${currentDate}

一、基本信息
1. 样品名称：${task.sample_name}
2. 样品编号：${task.sample_no}
3. 批号：${task.batch_no}
4. 规格：${task.specification || 'N/A'}
5. 生产日期：${task.manufacture_date || 'N/A'}
6. 检验项目：${task.test_item}
7. 检验方法：${task.method_name || 'N/A'}（${task.method_code || 'N/A'}）
8. 检验人员：${task.tester_name || 'N/A'}

二、检验结果
${resultRows.length > 0 ? resultRows.map((r: any, idx: number) => `
${idx + 1}. 检验项目：${r.test_item}
   检验结果：${r.result} ${r.unit}
   规格标准：${r.specification || 'N/A'}
   判定：${r.is_oos ? '超标(OOS)' : '合格'}
   检验日期：${r.test_date || 'N/A'}
   使用仪器：${r.instrument_name || 'N/A'}
`).join('\n') : '暂无检验结果'}

三、结论
本报告检验结果：${resultRows.length > 0 && resultRows.some((r: any) => r.is_oos) ? '部分项目超标，建议复查' : '所有项目合格'}

四、备注
${resultRows.length > 0 && resultRows.some((r: any) => r.is_oos) ? '存在超标项目，需要进一步调查。' : '无'}

检验员签名：___________    复核员签名：___________    批准人签名：___________
日期：${currentDate}
    `.trim();

    res.json({ code: 200, message: '生成成功', data: { content: reportContent, task } });
  } catch (error) {
    console.error('Generate report content error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;

    await pool.execute(
      'UPDATE inspection_reports SET content = ?, status = ? WHERE id = ?',
      [content, status, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE inspection_reports SET status = "approved", issue_date = NOW(), issuer_id = ? WHERE id = ?',
      [(req as any).user?.id, id]
    );

    res.json({ code: 200, message: '报告已批准', data: null });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM inspection_reports WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
