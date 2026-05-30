import api from './api';

export const getList = () => {
  return api.get('/roles');
};

export const getById = (id: number) => {
  return api.get(`/roles/${id}`);
};

export const create = (data: any) => {
  return api.post('/roles', data);
};

export const update = (id: number, data: any) => {
  return api.put(`/roles/${id}`, data);
};

export const updatePermissions = (id: number, permissions: string[]) => {
  return api.put(`/roles/${id}/permissions`, { permissions });
};

export const remove = (id: number) => {
  return api.delete(`/roles/${id}`);
};
