import api from './api';

export interface ReferenceMaterial {
  id: number;
  rm_code: string;
  rm_name: string;
  rm_type?: string;
  specification?: string;
  purity?: number;
  concentration?: string;
  unit?: string;
  manufacturer?: string;
  supplier_id?: number | string;
  batch_number?: string;
  certificate_no?: string;
  manufacture_date?: string;
  expiry_date?: string;
  storage_condition?: string;
  initial_amount?: number;
  current_amount?: number;
  unit_amount?: string;
  status: string;
  remark?: string;
  created_at: string;
  updated_at: string;
  checks?: any[];
}

export interface Solution {
  id: number;
  solution_code: string;
  solution_name: string;
  concentration?: number;
  concentration_unit: string;
  preparation_method?: string;
  raw_material_id?: number | string;
  raw_material_amount?: number;
  solvent?: string;
  solvent_amount?: number;
  total_volume?: number;
  preparation_date: string;
  expiry_date?: string;
  prepared_by?: number | string;
  checked_by?: number | string;
  calibration_required?: boolean;
  calibration_result?: string;
  status: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export const getList = (params?: {
  page?: number;
  pageSize?: number;
  rm_name?: string;
  rm_type?: string;
  status?: string;
}) => {
  return api.get('/reference-materials', { params });
};

export const getById = (id: number) => {
  return api.get(`/reference-materials/${id}`);
};

export const create = (data: Partial<ReferenceMaterial>) => {
  return api.post('/reference-materials', data);
};

export const update = (id: number, data: Partial<ReferenceMaterial>) => {
  return api.put(`/reference-materials/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/reference-materials/${id}`);
};

export const addCheck = (rm_id: number, data: any) => {
  return api.post(`/reference-materials/${rm_id}/checks`, data);
};

export const getSolutions = (params?: {
  page?: number;
  pageSize?: number;
  solution_name?: string;
  status?: string;
}) => {
  return api.get('/solutions', { params });
};

export const createSolution = (data: Partial<Solution>) => {
  return api.post('/solutions', data);
};

export const removeSolution = (id: number) => {
  return api.delete(`/solutions/${id}`);
};
