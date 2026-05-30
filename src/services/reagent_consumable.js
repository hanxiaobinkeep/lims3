import api from './api.ts';

export const getReagentList = (params) => {
  return api.get('/reagent-consumables', { params });
};

export const getReagentById = (id) => {
  return api.get(`/reagent-consumables/${id}`);
};

export const createReagent = (data) => {
  return api.post('/reagent-consumables', data);
};

export const updateReagent = (id, data) => {
  return api.put(`/reagent-consumables/${id}`, data);
};

export const deleteReagent = (id) => {
  return api.delete(`/reagent-consumables/${id}`);
};

export const addReagentIn = (reagentId, data) => {
  return api.post(`/reagent-consumables/${reagentId}/in`, data);
};

export const addReagentOut = (reagentId, data) => {
  return api.post(`/reagent-consumables/${reagentId}/out`, data);
};

export const confirmReagentOut = (id) => {
  return api.put(`/reagent-out-records/${id}/confirm`);
};

export const addReagentReturn = (reagentId, data) => {
  return api.post(`/reagent-consumables/${reagentId}/return`, data);
};

export const getSolutionList = (params) => {
  return api.get('/solutions', { params });
};

export const createSolution = (data) => {
  return api.post('/solutions', data);
};

export const getReagentAlerts = () => {
  return api.get('/reagent-alerts');
};
