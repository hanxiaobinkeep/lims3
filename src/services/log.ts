import api from './api';

export const getLogs = (params?: any) => {
  return api.get('/logs', { params });
};

export const getLogById = (id: number) => {
  return api.get(`/logs/${id}`);
};

export const getLogStats = () => {
  return api.get('/logs/stats');
};
