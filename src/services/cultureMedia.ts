import api from './api';

// 培养基基础信息
export const getCultureMediaList = (params?: any) => {
  return api.get('/culture-media', { params });
};

export const getCultureMediaById = (id: number) => {
  return api.get(`/culture-media/${id}`);
};

export const createCultureMedia = (data: any) => {
  return api.post('/culture-media', data);
};

export const updateCultureMedia = (id: number, data: any) => {
  return api.put(`/culture-media/${id}`, data);
};

export const deleteCultureMedia = (id: number) => {
  return api.delete(`/culture-media/${id}`);
};

// 验收记录
export const getAcceptanceRecords = (params?: any) => {
  return api.get('/media-acceptance-records', { params });
};

export const createAcceptanceRecord = (data: any) => {
  return api.post('/media-acceptance-records', data);
};

export const updateAcceptanceRecord = (id: number, data: any) => {
  return api.put(`/media-acceptance-records/${id}`, data);
};

export const deleteAcceptanceRecord = (id: number) => {
  return api.delete(`/media-acceptance-records/${id}`);
};

// 配制记录
export const getPreparationRecords = (params?: any) => {
  return api.get('/media-preparation-records', { params });
};

export const createPreparationRecord = (data: any) => {
  return api.post('/media-preparation-records', data);
};

export const updatePreparationRecord = (id: number, data: any) => {
  return api.put(`/media-preparation-records/${id}`, data);
};

export const deletePreparationRecord = (id: number) => {
  return api.delete(`/media-preparation-records/${id}`);
};

export const confirmSterilization = (id: number, data: any) => {
  return api.put(`/media-preparation-records/${id}/sterilize`, data);
};

// 预培养记录
export const getPreIncubationRecords = (params?: any) => {
  return api.get('/media-pre-incubation-records', { params });
};

export const createPreIncubationRecord = (data: any) => {
  return api.post('/media-pre-incubation-records', data);
};

export const updatePreIncubationRecord = (id: number, data: any) => {
  return api.put(`/media-pre-incubation-records/${id}`, data);
};

export const deletePreIncubationRecord = (id: number) => {
  return api.delete(`/media-pre-incubation-records/${id}`);
};

export const confirmSterilityResult = (id: number, data: any) => {
  return api.put(`/media-pre-incubation-records/${id}/sterility`, data);
};

// 领用记录
export const getUsageRecords = (params?: any) => {
  return api.get('/media-usage-records', { params });
};

export const createUsageRecord = (data: any) => {
  return api.post('/media-usage-records', data);
};

export const updateUsageRecord = (id: number, data: any) => {
  return api.put(`/media-usage-records/${id}`, data);
};

export const deleteUsageRecord = (id: number) => {
  return api.delete(`/media-usage-records/${id}`);
};

// 灭活记录
export const getInactivationRecords = (params?: any) => {
  return api.get('/media-inactivation-records', { params });
};

export const createInactivationRecord = (data: any) => {
  return api.post('/media-inactivation-records', data);
};

export const updateInactivationRecord = (id: number, data: any) => {
  return api.put(`/media-inactivation-records/${id}`, data);
};

export const deleteInactivationRecord = (id: number) => {
  return api.delete(`/media-inactivation-records/${id}`);
};

export const verifyInactivation = (id: number, data: any) => {
  return api.put(`/media-inactivation-records/${id}/verify`, data);
};
