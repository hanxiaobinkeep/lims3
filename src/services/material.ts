import api from './api';

export const getList = (params?: any) => {
  return api.get('/materials', { params });
};

export const getById = (id: number) => {
  return api.get(`/materials/${id}`);
};

export const create = (data: any) => {
  return api.post('/materials', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/materials/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/materials/${id}`);
};
