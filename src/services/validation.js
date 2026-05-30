import api from './api.ts';

export const getValidationPlans = (params) => {
  return api.get('/validation-plans', { params });
};

export const getValidationPlanById = (id) => {
  return api.get(`/validation-plans/${id}`);
};

export const createValidationPlan = (data) => {
  return api.post('/validation-plans', data);
};

export const updateValidationPlan = (id, data) => {
  return api.put(`/validation-plans/${id}`, data);
};

export const addValidationDocument = (data) => {
  return api.post('/validation-documents', data);
};

export const reviewValidationDocument = (id) => {
  return api.put(`/validation-documents/${id}/review`);
};

export const approveValidationDocument = (id) => {
  return api.put(`/validation-documents/${id}/approve`);
};

export const addValidationTest = (data) => {
  return api.post('/validation-tests', data);
};

export const reviewValidationTest = (id) => {
  return api.put(`/validation-tests/${id}/review`);
};

export const addTraceabilityMatrix = (data) => {
  return api.post('/traceability-matrices', data);
};

export const addValidationDeviation = (data) => {
  return api.post('/validation-deviations', data);
};

export const updateValidationDeviation = (id, data) => {
  return api.put(`/validation-deviations/${id}`, data);
};

export const getValidationStats = () => {
  return api.get('/validation-stats');
};
