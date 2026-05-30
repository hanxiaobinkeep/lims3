import api from './api';

export interface Personnel {
  id?: number;
  employee_no: string;
  real_name: string;
  gender?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  entry_date?: string;
  status?: string;
  education?: string;
  major?: string;
  resume?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingRecord {
  id?: number;
  personnel_id: number;
  training_name: string;
  training_type?: string;
  training_content?: string;
  training_date?: string;
  training_hours?: number;
  trainer?: string;
  training_organization?: string;
  assessment_method?: string;
  assessment_result?: string;
  certificate_no?: string;
  certificate_date?: string;
  valid_until?: string;
  certificate_file?: string;
  remark?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QualificationCertificate {
  id?: number;
  personnel_id: number;
  certificate_name: string;
  certificate_type?: string;
  certificate_no?: string;
  certificate_level?: string;
  issue_date?: string;
  valid_until?: string;
  issue_organization?: string;
  scope_of_authorization?: string;
  status?: string;
  certificate_file?: string;
  renewal_date?: string;
  next_renewal_date?: string;
  remark?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export const getPersonnelList = (params?: {
  department?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) => {
  return api.get('/personnel', { params });
};

export const getPersonnelById = (id: number) => {
  return api.get(`/personnel/${id}`);
};

export const createPersonnel = (data: Personnel) => {
  return api.post('/personnel', data);
};

export const updatePersonnel = (id: number, data: Personnel) => {
  return api.put(`/personnel/${id}`, data);
};

export const deletePersonnel = (id: number) => {
  return api.delete(`/personnel/${id}`);
};

export const addTraining = (personnelId: number, data: Omit<TrainingRecord, 'personnel_id'>) => {
  return api.post(`/personnel/${personnelId}/trainings`, data);
};

export const updateTraining = (id: number, data: Partial<TrainingRecord>) => {
  return api.put(`/personnel/trainings/${id}`, data);
};

export const deleteTraining = (id: number) => {
  return api.delete(`/personnel/trainings/${id}`);
};

export const addQualification = (personnelId: number, data: Omit<QualificationCertificate, 'personnel_id'>) => {
  return api.post(`/personnel/${personnelId}/qualifications`, data);
};

export const updateQualification = (id: number, data: Partial<QualificationCertificate>) => {
  return api.put(`/personnel/qualifications/${id}`, data);
};

export const deleteQualification = (id: number) => {
  return api.delete(`/personnel/qualifications/${id}`);
};

export const getExpiringSoon = (days?: number) => {
  return api.get('/personnel/expiring-soon', { params: { days } });
};
