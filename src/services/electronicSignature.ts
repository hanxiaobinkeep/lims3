import api from './api';

export interface SignatureRecord {
  id: number;
  recordType: string;
  recordId: number;
  signatureType: string;
  signerId: number;
  signerName: string;
  signatureHash: string;
  signatureImage?: string;
  ipAddress?: string;
  userAgent?: string;
  signedAt: string;
  remark?: string;
  createdAt: string;
  isValid?: boolean;
  verifiedContent?: string;
  verificationHash?: string;
}

export interface SignatureConfig {
  id: number;
  userId: number;
  signatureType: string;
  signatureImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getSignatureConfig = () => {
  return api.get('/signatures/config');
};

export const setupSignature = (data: {
  signatureType: string;
  signatureImage?: string;
  password: string;
}) => {
  return api.post('/signatures/setup', data);
};

export const updateSignature = (data: {
  signatureType: string;
  signatureImage?: string;
  oldPassword?: string;
  newPassword?: string;
}) => {
  return api.put('/signatures/update', data);
};

export const createSignature = (data: {
  recordType: string;
  recordId: number;
  signatureType: string;
  password: string;
  content?: string;
  remark?: string;
}) => {
  return api.post('/signatures/create', data);
};

export const verifySignature = (signatureRecordId: number) => {
  return api.get(`/signatures/verify/${signatureRecordId}`);
};

export const getSignatureHistory = (params?: {
  recordType?: string;
  recordId?: number;
  page?: number;
  pageSize?: number;
}) => {
  return api.get('/signatures/history', { params });
};

export const revokeSignature = (signatureRecordId: number, data: {
  password: string;
  reason: string;
}) => {
  return api.post(`/signatures/revoke/${signatureRecordId}`, data);
};
