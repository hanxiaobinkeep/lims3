import api from './api.ts';

export const getReportTemplates = (params) => {
  return api.get('/report-templates', { params });
};

export const getReportTemplateById = (id) => {
  return api.get(`/report-templates/${id}`);
};

export const generateReport = (data) => {
  return api.post('/reports/generate', data);
};

export const getReportInstances = (params) => {
  return api.get('/report-instances', { params });
};

export const getStatisticsConfigs = (params) => {
  return api.get('/statistics-configs', { params });
};

export const calculateStatistics = (data) => {
  return api.post('/statistics/calculate', data);
};

export const getStatisticsCategories = () => {
  return api.get('/statistics/categories');
};

export const getDashboardStatistics = () => {
  return api.get('/dashboard/statistics');
};
