import api from './api';

export const getList = (params?: any) => {
  return api.get('/inspection-results', { params });
};

export const getById = (id: number) => {
  return api.get(`/inspection-results/${id}`);
};

export const create = (data: any) => {
  return api.post('/inspection-results', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/inspection-results/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/inspection-results/${id}`);
};
