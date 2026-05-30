import api from './api';

export const getList = (params?: any) => {
  return api.get('/storage-locations', { params });
};

export const getById = (id: number) => {
  return api.get(`/storage-locations/${id}`);
};

export const create = (data: any) => {
  return api.post('/storage-locations', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/storage-locations/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/storage-locations/${id}`);
};

export const getRooms = () => {
  return api.get('/storage-locations/rooms');
};

export const getStats = () => {
  return api.get('/storage-locations/stats');
};

export const getStorageRecords = (params?: any) => {
  return api.get('/storage-records', { params });
};

export const storeSample = (data: any) => {
  return api.post('/storage-records', data);
};

export const retrieveSample = (id: number, remark?: string) => {
  return api.put(`/storage-records/${id}/retrieve`, { remark });
};
