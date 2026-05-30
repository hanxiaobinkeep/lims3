import api from './api';

export const getStats = () => {
  return api.get('/dashboard/stats');
};
