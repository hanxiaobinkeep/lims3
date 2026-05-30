import api from './api';

export const getList = (params?: any) => {
  return api.get('/stability-protocols', { params });
};

export const create = (data: any) => {
  return api.post('/stability-protocols', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/stability-protocols/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/stability-protocols/${id}`);
};
