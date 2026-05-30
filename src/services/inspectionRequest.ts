import api from './api';

export const getList = (params?: any) => {
  return api.get('/inspection-requests', { params });
};

export const getById = (id: number) => {
  return api.get(`/inspection-requests/${id}`);
};

export const create = (data: any) => {
  return api.post('/inspection-requests', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/inspection-requests/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/inspection-requests/${id}`);
};
