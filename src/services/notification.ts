import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  type: string;
  related_module: string;
  related_id: number;
  is_read: boolean;
  priority: string;
  created_at: string;
  read_at: string;
}

export const getMyNotifications = (params?: {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}) => {
  return api.get('/notifications', { params });
};

export const getUnreadCount = () => {
  return api.get('/notifications/unread-count');
};

export const markAsRead = (id: number) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put('/notifications/read-all');
};

export const remove = (id: number) => {
  return api.delete(`/notifications/${id}`);
};

export const cleanupOldNotifications = () => {
  return api.post('/notifications/cleanup');
};
