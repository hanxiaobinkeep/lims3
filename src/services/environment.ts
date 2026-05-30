import api from './api';

// 监测计划
export const getPlanList = (params?: any) => {
  return api.get('/environment-plans', { params });
};

export const createPlan = (data: any) => {
  return api.post('/environment-plans', data);
};

export const updatePlan = (id: number, data: any) => {
  return api.put(`/environment-plans/${id}`, data);
};

export const removePlan = (id: number) => {
  return api.delete(`/environment-plans/${id}`);
};

// 环境样品
export const getSampleList = (params?: any) => {
  return api.get('/environment-samples', { params });
};

export const createSample = (data: any) => {
  return api.post('/environment-samples', data);
};

export const updateSample = (id: number, data: any) => {
  return api.put(`/environment-samples/${id}`, data);
};

export const removeSample = (id: number) => {
  return api.delete(`/environment-samples/${id}`);
};
