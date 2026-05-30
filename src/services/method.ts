import api from './api';

export const getList = (params?: any) => {
  return api.get('/methods', { params });
};

export const getById = (id: number) => {
  return api.get(`/methods/${id}`);
};

export const create = (data: any) => {
  return api.post('/methods', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/methods/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/methods/${id}`);
};
