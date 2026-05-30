import api from './api';

export const getList = (params?: any) => {
  return api.get('/instruments', { params });
};

export const getById = (id: number) => {
  return api.get(`/instruments/${id}`);
};

export const create = (data: any) => {
  return api.post('/instruments', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/instruments/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/instruments/${id}`);
};
