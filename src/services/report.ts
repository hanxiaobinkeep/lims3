import api from './api';

export const getList = (params?: any) => {
  return api.get('/reports', { params });
};

export const getById = (id: number) => {
  return api.get(`/reports/${id}`);
};

export const generateReport = (taskId: number) => {
  return api.get('/reports/generate', { params: { taskId } });
};

export const create = (data: any) => {
  return api.post('/reports', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/reports/${id}`, data);
};

export const approve = (id: number) => {
  return api.post(`/reports/${id}/approve`);
};

export const remove = (id: number) => {
  return api.delete(`/reports/${id}`);
};
