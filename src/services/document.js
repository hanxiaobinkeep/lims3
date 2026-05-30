import api from './api.ts';

export const getDocumentCategories = () => {
  return api.get('/document-categories');
};

export const createDocumentCategory = (data) => {
  return api.post('/document-categories', data);
};

export const getDocuments = (params) => {
  return api.get('/documents', { params });
};

export const getDocumentById = (id) => {
  return api.get(`/documents/${id}`);
};

export const createDocument = (data) => {
  return api.post('/documents', data);
};

export const updateDocument = (id, data) => {
  return api.put(`/documents/${id}`, data);
};

export const reviewDocument = (id, data) => {
  return api.post(`/documents/${id}/review`, data);
};

export const approveDocument = (id) => {
  return api.post(`/documents/${id}/approve`);
};

export const distributeDocument = (data) => {
  return api.post('/document-distributions', data);
};

export const returnDocument = (id) => {
  return api.put(`/document-distributions/${id}/return`);
};

export const createDocumentChange = (data) => {
  return api.post('/document-changes', data);
};

export const reviewDocumentChange = (id, data) => {
  return api.put(`/document-changes/${id}/review`, data);
};

export const recordDocumentRead = (data) => {
  return api.post('/document-read-records', data);
};
