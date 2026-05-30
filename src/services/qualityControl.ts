import api from './api';

export interface QCPlan {
  id?: number;
  plan_name: string;
  plan_type: string;
  material_id?: number;
  inspection_item?: string;
  chart_type: string;
  sample_size: number;
  sample_interval?: string;
  center_line?: number;
  upper_control_limit?: number;
  lower_control_limit?: number;
  upper_spec_limit?: number;
  lower_spec_limit?: number;
  target_value?: number;
  unit?: string;
  description?: string;
  status: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QCData {
  id?: number;
  plan_id: number;
  subgroup_no: number;
  sample_time: string;
  sample_values: string;
  subgroup_mean?: number;
  subgroup_range?: number;
  subgroup_std?: number;
  is_out_of_control?: boolean;
  out_of_control_reason?: string;
  out_of_control_action?: string;
  status?: string;
  remark?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QCOOC {
  id?: number;
  plan_id: number;
  qc_data_id: number;
  ooc_type?: string;
  ooc_rule?: string;
  ooc_time: string;
  description?: string;
  investigation?: string;
  corrective_action?: string;
  preventive_action?: string;
  action_taken_at?: string;
  closed_by?: number;
  closed_at?: string;
  status?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export const getQCPlans = (params?: { status?: string; plan_type?: string }) => {
  return api.get('/qc-plans', { params });
};

export const getQCPlanById = (id: number) => {
  return api.get(`/qc-plans/${id}`);
};

export const createQCPlan = (data: QCPlan) => {
  return api.post('/qc-plans', data);
};

export const updateQCPlan = (id: number, data: QCPlan) => {
  return api.put(`/qc-plans/${id}`, data);
};

export const deleteQCPlan = (id: number) => {
  return api.delete(`/qc-plans/${id}`);
};

export const getQCData = (params?: { plan_id?: number; status?: string }) => {
  return api.get('/qc-data', { params });
};

export const createQCData = (data: QCData) => {
  return api.post('/qc-data', data);
};

export const updateQCData = (id: number, data: Partial<QCData>) => {
  return api.put(`/qc-data/${id}`, data);
};

export const getQCOOCRecords = (params?: { plan_id?: number; status?: string }) => {
  return api.get('/qc-ooc-records', { params });
};

export const createQCOOC = (data: QCOOC) => {
  return api.post('/qc-ooc-records', data);
};

export const updateQCOOC = (id: number, data: Partial<QCOOC>) => {
  return api.put(`/qc-ooc-records/${id}`, data);
};
