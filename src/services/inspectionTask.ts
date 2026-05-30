import api from './api';

export const getList = (params?: any) => {
  return api.get('/inspection-tasks', { params });
};

export const getById = (id: number) => {
  return api.get(`/inspection-tasks/${id}`);
};

export const create = (data: any) => {
  return api.post('/inspection-tasks', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/inspection-tasks/${id}`, data);
};

export const updateStatus = (id: number, status: string) => {
  return api.put(`/inspection-tasks/${id}/status`, { status });
};

export const remove = (id: number) => {
  return api.delete(`/inspection-tasks/${id}`);
};
