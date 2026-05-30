import api from './api.ts';

export const getIntermediateCheckPlans = (params) => {
  return api.get('/intermediate-check-plans', { params });
};

export const getIntermediateCheckPlanById = (id) => {
  return api.get(`/intermediate-check-plans/${id}`);
};

export const createIntermediateCheckPlan = (data) => {
  return api.post('/intermediate-check-plans', data);
};

export const updateIntermediateCheckPlan = (id, data) => {
  return api.put(`/intermediate-check-plans/${id}`, data);
};

export const addIntermediateCheckRecord = (data) => {
  return api.post('/intermediate-check-records', data);
};

export const reviewIntermediateCheckRecord = (id) => {
  return api.put(`/intermediate-check-records/${id}/review`);
};

export const getIntermediateCheckAlerts = (params) => {
  return api.get('/intermediate-check-alerts', { params });
};

export const resolveIntermediateCheckAlert = (id) => {
  return api.put(`/intermediate-check-alerts/${id}/resolve`);
};

export const getIntermediateCheckStats = () => {
  return api.get('/intermediate-check-stats');
};
