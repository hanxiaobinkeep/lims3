import { getUnreadCount as apiGetUnreadCount } from '../services/notification';

let cachedUnreadCount = 0;

export const getUnreadCount = async () => {
  try {
    const res = await apiGetUnreadCount();
    if (res.data?.code === 200) {
      cachedUnreadCount = res.data.data.count;
      return res;
    }
    return res;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    throw error;
  }
};

export const setUnreadCount = (count: number) => {
  cachedUnreadCount = count;
};

export const getCachedUnreadCount = () => cachedUnreadCount;
