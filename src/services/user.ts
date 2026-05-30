import api from './api';

export const getList = (params?: any) => {
  return api.get('/users', { params });
};

export const getById = (id: number) => {
  return api.get(`/users/${id}`);
};

export const create = (data: any) => {
  return api.post('/users', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/users/${id}`, data);
};

export const resetPassword = (id: number) => {
  return api.post(`/users/${id}/reset-password`);
};

export const remove = (id: number) => {
  return api.delete(`/users/${id}`);
};
