import api from './api';

export interface PendingReviewResult {
  id: number;
  task_id: number;
  task_no: string;
  sample_no: string;
  sample_name: string;
  test_item: string;
  test_value: string;
  tester_id: number;
  tester_name: string;
  status: string;
  is_oos: boolean;
  created_at: string;
}

export interface ReviewHistory {
  id: number;
  inspection_result_id: number;
  reviewer_id: number;
  reviewer_name: string;
  review_type: string;
  review_status: string;
  review_comment: string;
  reviewed_at: string;
  created_at: string;
}

export const getPendingReviews = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}) => {
  return api.get('/data-reviews/pending', { params });
};

export const getReviewHistory = (id: number) => {
  return api.get(`/data-reviews/history/${id}`);
};

export const createReview = (data: {
  inspection_result_id: number;
  review_type: string;
  review_comment?: string;
}) => {
  return api.post('/data-reviews', data);
};

export const executeReview = (id: number, data: {
  review_status: string;
  review_comment?: string;
}) => {
  return api.put(`/data-reviews/${id}/execute`, data);
};

export const approveResult = (id: number) => {
  return api.put(`/inspection-results/${id}/approve`);
};
