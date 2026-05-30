import api from './api';

export const getList = (params?: any) => {
  return api.get('/samples', { params });
};

export const getById = (id: number) => {
  return api.get(`/samples/${id}`);
};

export const create = (data: any) => {
  return api.post('/samples', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/samples/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/samples/${id}`);
};
