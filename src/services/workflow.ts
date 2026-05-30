import api from './api';

export interface Workflow {
  id?: number;
  workflow_code: string;
  workflow_name: string;
  workflow_type?: string;
  description?: string;
  version?: number;
  is_active?: boolean;
  nodes?: any;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowInstance {
  id?: number;
  workflow_id: number;
  workflow_name?: string;
  workflow_code?: string;
  business_type: string;
  business_id: string;
  current_node_id?: string;
  status?: string;
  initiator_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowHistory {
  id?: number;
  instance_id: number;
  node_id?: string;
  node_name?: string;
  action: string;
  operator_id?: number;
  operator_name?: string;
  comment?: string;
  next_node_id?: string;
  created_at?: string;
}

export interface ApprovalConfig {
  id?: number;
  business_type: string;
  business_action: string;
  workflow_id?: number;
  approval_levels?: number;
  auto_approve?: boolean;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export const getWorkflows = (params?: { workflow_type?: string; is_active?: boolean }) => {
  return api.get('/workflows', { params });
};

export const getWorkflowById = (id: number) => {
  return api.get(`/workflows/${id}`);
};

export const createWorkflow = (data: Workflow) => {
  return api.post('/workflows', data);
};

export const updateWorkflow = (id: number, data: Workflow) => {
  return api.put(`/workflows/${id}`, data);
};

export const deleteWorkflow = (id: number) => {
  return api.delete(`/workflows/${id}`);
};

export const getWorkflowInstances = (params?: {
  workflow_id?: number;
  business_type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return api.get('/workflow-instances', { params });
};

export const startWorkflow = (data: {
  workflow_id: number;
  business_type: string;
  business_id: string;
}) => {
  return api.post('/workflow-instances', data);
};

export const executeWorkflowAction = (
  id: number,
  data: {
    action: string;
    comment?: string;
    next_node_id?: string;
  }
) => {
  return api.put(`/workflow-instances/${id}/action`, data);
};

export const cancelWorkflow = (id: number, reason?: string) => {
  return api.put(`/workflow-instances/${id}/cancel`, { reason });
};

export const getWorkflowHistory = (instance_id: number) => {
  return api.get('/workflow-history', { params: { instance_id } });
};

export const getApprovalConfigs = (business_type?: string) => {
  return api.get('/approval-configs', { params: { business_type } });
};

export const updateApprovalConfig = (data: ApprovalConfig) => {
  return api.put('/approval-configs', data);
};
