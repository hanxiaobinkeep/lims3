import api from './api';

export interface Supplier {
  id: number;
  supplier_code: string;
  supplier_name: string;
  short_name: string;
  supplier_type: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  email: string;
  website: string;
  is_qualified: boolean;
  qualification_deadline: string;
  status: string;
  remark: string;
  created_at: string;
  updated_at: string;
  qualifications?: any[];
  evaluations?: any[];
}

export interface SupplierQualification {
  id: number;
  supplier_id: number;
  qualification_name: string;
  qualification_type: string;
  certificate_no: string;
  issue_date: string;
  expiry_date: string;
  file_path: string;
  remark: string;
  created_at: string;
}

export interface SupplierEvaluation {
  id: number;
  supplier_id: number;
  evaluation_date: string;
  evaluation_period: string;
  quality_score: number;
  delivery_score: number;
  service_score: number;
  price_score: number;
  total_score: number;
  evaluation_result: string;
  remark: string;
  created_at: string;
}

export const getList = (params?: {
  page?: number;
  pageSize?: number;
  supplier_name?: string;
  supplier_type?: string;
  is_qualified?: boolean;
}) => {
  return api.get('/suppliers', { params });
};

export const getById = (id: number) => {
  return api.get(`/suppliers/${id}`);
};

export const create = (data: Partial<Supplier>) => {
  return api.post('/suppliers', data);
};

export const update = (id: number, data: Partial<Supplier>) => {
  return api.put(`/suppliers/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/suppliers/${id}`);
};

export const addQualification = (supplier_id: number, data: Partial<SupplierQualification>) => {
  return api.post(`/suppliers/${supplier_id}/qualifications`, data);
};

export const removeQualification = (id: number) => {
  return api.delete(`/suppliers/qualifications/${id}`);
};

export const addEvaluation = (supplier_id: number, data: Partial<SupplierEvaluation>) => {
  return api.post(`/suppliers/${supplier_id}/evaluations`, data);
};

export const removeEvaluation = (id: number) => {
  return api.delete(`/suppliers/evaluations/${id}`);
};
