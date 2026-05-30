import api from './api';

export interface SamplingRecord {
  id: number;
  requestId: number;
  requestNo?: string;
  sampleNo: string;
  sampleName: string;
  batchNo?: string;
  samplingPersonId: number;
  samplingPersonName?: string;
  samplingTime: string;
  samplingQuantity: number;
  samplingUnit: string;
  samplingLocation?: string;
  samplingMethod?: string;
  storageLocation?: string;
  status: 'pending' | 'sampled' | 'received' | 'rejected';
  remark?: string;
  createdBy?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  handoverRecords?: any[];
  labelRecords?: any[];
}

export const getList = (params?: any) => {
  return api.get('/sampling-records', { params });
};

export const getById = (id: number) => {
  return api.get(`/sampling-records/${id}`);
};

export const create = (data: Partial<SamplingRecord>) => {
  return api.post('/sampling-records', data);
};

export const update = (id: number, data: Partial<SamplingRecord>) => {
  return api.put(`/sampling-records/${id}`, data);
};

export const remove = (id: number) => {
  return api.delete(`/sampling-records/${id}`);
};

export const recordSampling = (id: number, data: any) => {
  return api.post(`/sampling-records/${id}/sampling`, data);
};

export const recordHandover = (id: number, data: any) => {
  return api.post(`/sampling-records/${id}/handover`, data);
};

export const confirmHandover = (handoverId: number, data: any) => {
  return api.put(`/sampling-records/handover/${handoverId}/confirm`, data);
};

export const printLabel = (id: number, data: any) => {
  return api.post(`/sampling-records/${id}/print-label`, data);
};
