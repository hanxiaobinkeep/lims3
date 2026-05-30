import api from './api';

export const getList = (params?: any) => {
  return api.get('/deviations', { params });
};

export const create = (data: any) => {
  return api.post('/deviations', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/deviations/${id}`, data);
};

export const updateStatus = (id: number, status: string) => {
  return api.put(`/deviations/${id}/status`, { status });
};

export const remove = (id: number) => {
  return api.delete(`/deviations/${id}`);
};
