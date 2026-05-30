import { Request, Response } from 'express';
import pool from '../config/database.js';

interface Workflow {
  id?: number;
  workflow_code: string;
  workflow_name: string;
  workflow_type?: string;
  description?: string;
  version?: number;
  is_active?: boolean;
  nodes?: any;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface WorkflowInstance {
  id?: number;
  workflow_id: number;
  business_type: string;
  business_id: string;
  current_node_id?: string;
  status?: string;
  initiator_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface WorkflowHistory {
  id?: number;
  instance_id: number;
  node_id?: string;
  node_name?: string;
  action: string;
  operator_id?: number;
  operator_name?: string;
  comment?: string;
  next_node_id?: string;
  created_at?: Date;
}

export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const { workflow_type, is_active } = req.query;
    let query = 'SELECT * FROM workflows WHERE 1=1';
    const params: any[] = [];

    if (workflow_type) {
      query += ' AND workflow_type = ?';
      params.push(workflow_type);
    }
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    query += ' ORDER BY created_at DESC';

    const [rows]: any = await pool.execute(query, params);
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getWorkflowById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute('SELECT * FROM workflows WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '工作流不存在', data: null });
    }
    res.json({ code: 200, message: '获取成功', data: rows[0] });
  } catch (error) {
    console.error('获取工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { workflow_code, workflow_name, workflow_type, description, nodes } = req.body;

    const [result]: any = await pool.execute(
      `INSERT INTO workflows (workflow_code, workflow_name, workflow_type, description, nodes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workflow_code, workflow_name, workflow_type, description, JSON.stringify(nodes), userId]
    );

    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workflow_name, workflow_type, description, nodes, is_active } = req.body;

    await pool.execute(
      `UPDATE workflows 
       SET workflow_name = ?, workflow_type = ?, description = ?, nodes = ?, is_active = ?
       WHERE id = ?`,
      [workflow_name, workflow_type, description, JSON.stringify(nodes), is_active ? 1 : 0, id]
    );

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM workflows WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getWorkflowInstances = async (req: Request, res: Response) => {
  try {
    const { workflow_id, business_type, status, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `SELECT wi.*, w.workflow_name, w.workflow_code 
                 FROM workflow_instances wi
                 LEFT JOIN workflows w ON wi.workflow_id = w.id
                 WHERE 1=1`;
    const params: any[] = [];

    if (workflow_id) {
      query += ' AND wi.workflow_id = ?';
      params.push(workflow_id);
    }
    if (business_type) {
      query += ' AND wi.business_type = ?';
      params.push(business_type);
    }
    if (status) {
      query += ' AND wi.status = ?';
      params.push(status);
    }
    
    query += ` ORDER BY wi.created_at DESC LIMIT ${Number(pageSize)} OFFSET ${offset}`;

    const [rows]: any = await pool.query(query, params);
    
    const [countResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM workflow_instances WHERE 1=1',
      []
    );

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
    console.error('获取工作流实例失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const startWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName || 'Unknown';
    const { workflow_id, business_type, business_id } = req.body;

    const [workflows]: any = await pool.execute('SELECT * FROM workflows WHERE id = ?', [workflow_id]);
    if (workflows.length === 0) {
      return res.status(404).json({ code: 404, message: '工作流不存在', data: null });
    }

    const workflow = workflows[0];
    const nodes = typeof workflow.nodes === 'string' ? JSON.parse(workflow.nodes) : workflow.nodes;
    const startNode = nodes.find((n: any) => n.type === 'start');
    const nextNode = startNode?.next ? nodes.find((n: any) => n.id === startNode.next) : null;

    const [result]: any = await pool.execute(
      `INSERT INTO workflow_instances (workflow_id, business_type, business_id, current_node_id, status, initiator_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workflow_id, business_type, business_id, nextNode?.id || 'submit', 'pending', userId]
    );

    await pool.execute(
      `INSERT INTO workflow_history (instance_id, node_id, node_name, action, operator_id, operator_name, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.insertId, startNode?.id || 'start', startNode?.name || '开始', 'submit', userId, userName, '工作流启动']
    );

    res.json({ code: 200, message: '工作流启动成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('启动工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const executeWorkflowAction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName || 'Unknown';
    const { id } = req.params;
    const { action, comment, next_node_id } = req.body;

    const [instances]: any = await pool.execute(
      `SELECT wi.*, w.nodes, w.workflow_code, w.workflow_name
       FROM workflow_instances wi
       LEFT JOIN workflows w ON wi.workflow_id = w.id
       WHERE wi.id = ?`,
      [id]
    );

    if (instances.length === 0) {
      return res.status(404).json({ code: 404, message: '工作流实例不存在', data: null });
    }

    const instance = instances[0];
    const nodes = typeof instance.nodes === 'string' ? JSON.parse(instance.nodes) : instance.nodes;
    const currentNode = nodes.find((n: any) => n.id === instance.current_node_id);

    await pool.execute(
      `INSERT INTO workflow_history (instance_id, node_id, node_name, action, operator_id, operator_name, comment, next_node_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, currentNode?.id, currentNode?.name, action, userId, userName, comment, next_node_id]
    );

    let newStatus = instance.status;
    let newNodeId = instance.current_node_id;

    if (action === 'approve') {
      if (currentNode?.next) {
        const nextNode = nodes.find((n: any) => n.id === currentNode.next);
        if (nextNode?.type === 'end') {
          newStatus = 'approved';
        } else {
          newNodeId = currentNode.next;
        }
      } else {
        newStatus = 'approved';
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'return') {
      newNodeId = next_node_id || currentNode?.next || instance.current_node_id;
    } else if (action === 'submit') {
      newStatus = 'processing';
      newNodeId = next_node_id || currentNode?.next || instance.current_node_id;
    }

    await pool.execute(
      'UPDATE workflow_instances SET current_node_id = ?, status = ? WHERE id = ?',
      [newNodeId, newStatus, id]
    );

    res.json({ code: 200, message: '操作成功', data: { status: newStatus } });
  } catch (error) {
    console.error('执行工作流操作失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getWorkflowHistory = async (req: Request, res: Response) => {
  try {
    const { instance_id } = req.query;
    const [rows]: any = await pool.execute(
      'SELECT * FROM workflow_history WHERE instance_id = ? ORDER BY created_at ASC',
      [instance_id]
    );
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取工作流历史失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const getApprovalConfigs = async (req: Request, res: Response) => {
  try {
    const { business_type } = req.query;
    let query = 'SELECT * FROM approval_configs WHERE 1=1';
    const params: any[] = [];

    if (business_type) {
      query += ' AND business_type = ?';
      params.push(business_type);
    }

    const [rows]: any = await pool.execute(query, params);
    res.json({ code: 200, message: '获取成功', data: rows });
  } catch (error) {
    console.error('获取审批配置失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const updateApprovalConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { business_type, business_action, workflow_id, approval_levels, auto_approve } = req.body;

    const [existing]: any = await pool.execute(
      'SELECT * FROM approval_configs WHERE business_type = ? AND business_action = ?',
      [business_type, business_action]
    );

    if (existing.length > 0) {
      await pool.execute(
        `UPDATE approval_configs 
         SET workflow_id = ?, approval_levels = ?, auto_approve = ?
         WHERE business_type = ? AND business_action = ?`,
        [workflow_id, approval_levels, auto_approve ? 1 : 0, business_type, business_action]
      );
    } else {
      await pool.execute(
        `INSERT INTO approval_configs (business_type, business_action, workflow_id, approval_levels, auto_approve, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [business_type, business_action, workflow_id, approval_levels, auto_approve ? 1 : 0, userId]
      );
    }

    res.json({ code: 200, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新审批配置失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};

export const cancelWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.realName || 'Unknown';
    const { id } = req.params;
    const { reason } = req.body;

    const [instances]: any = await pool.execute('SELECT * FROM workflow_instances WHERE id = ?', [id]);
    if (instances.length === 0) {
      return res.status(404).json({ code: 404, message: '工作流实例不存在', data: null });
    }

    await pool.execute('UPDATE workflow_instances SET status = ? WHERE id = ?', ['cancelled', id]);
    await pool.execute(
      `INSERT INTO workflow_history (instance_id, node_id, node_name, action, operator_id, operator_name, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, 'cancel', '取消', 'cancel', userId, userName, reason || '工作流取消']
    );

    res.json({ code: 200, message: '取消成功', data: null });
  } catch (error) {
    console.error('取消工作流失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
};
