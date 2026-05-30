import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  remove,
  type Notification
} from '../services/notification';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const pageSize = 20;

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [page, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res: any = await getMyNotifications({
        page,
        pageSize,
        isRead: filter === 'unread' ? false : undefined
      });
      if (res.data.code === 200) {
        setNotifications(res.data.data.list);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res: any = await getUnreadCount();
      if (res.data.code === 200) {
        setUnreadCount(res.data.data.count);
      }
    } catch (error) {
      console.error('加载未读数量失败:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('全部标记已读失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条通知吗？')) return;
    try {
      await remove(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, { icon: any; class: string }> = {
      info: { icon: Info, class: 'bg-blue-100 text-blue-600' },
      warning: { icon: AlertTriangle, class: 'bg-amber-100 text-amber-600' },
      error: { icon: AlertCircle, class: 'bg-red-100 text-red-600' },
      success: { icon: CheckCircle, class: 'bg-green-100 text-green-600' }
    };
    return iconMap[type] || iconMap.info;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { text: string; class: string }> = {
      low: { text: '低', class: 'bg-gray-100 text-gray-600' },
      medium: { text: '中', class: 'bg-blue-100 text-blue-600' },
      high: { text: '高', class: 'bg-red-100 text-red-600' }
    };
    return map[priority] || map.medium;
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">我的通知</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">
              {unreadCount} 条未读
            </span>
          )}
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4" />
          全部已读
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部通知
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            未读通知
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无通知</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const typeConfig = getTypeIcon(notification.type);
              const TypeIcon = typeConfig.icon;
              const priority = getPriorityBadge(notification.priority);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg ${typeConfig.class} h-fit`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <h3 className="font-medium text-slate-800">{notification.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded ${priority.class}`}>
                              {priority.text}
                            </span>
                          </div>
                          {notification.content && (
                            <p className="text-sm text-slate-600 mb-2">{notification.content}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{formatTime(notification.created_at)}</span>
                            {notification.related_module && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded">
                                {notification.related_module}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="标记已读"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              共 {total} 条通知
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-slate-700">
                第 {page} 页
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= total}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
