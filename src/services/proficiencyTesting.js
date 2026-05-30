import api from './api.ts';

export const getProficiencyTestingPlans = (params) => {
  return api.get('/proficiency-testing-plans', { params });
};

export const getProficiencyTestingPlanById = (id) => {
  return api.get(`/proficiency-testing-plans/${id}`);
};

export const createProficiencyTestingPlan = (data) => {
  return api.post('/proficiency-testing-plans', data);
};

export const updateProficiencyTestingPlan = (id, data) => {
  return api.put(`/proficiency-testing-plans/${id}`, data);
};

export const addProficiencyTestingResult = (data) => {
  return api.post('/proficiency-testing-results', data);
};

export const reviewProficiencyTestingResult = (id, data) => {
  return api.put(`/proficiency-testing-results/${id}/review`, data);
};

export const addUnsatisfactoryAction = (data) => {
  return api.post('/proficiency-unsatisfactory-actions', data);
};

export const updateUnsatisfactoryAction = (id, data) => {
  return api.put(`/proficiency-unsatisfactory-actions/${id}`, data);
};

export const getProficiencyTestingStats = () => {
  return api.get('/proficiency-testing-stats');
};
