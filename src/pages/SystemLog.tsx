import { useEffect, useState } from 'react';
import { getLogs, getLogById, getLogStats } from '../services/log';
import { Search, Eye, Calendar, User, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface SystemLog {
  id: number;
  log_type: string;
  module: string;
  operation: string;
  user_id: number;
  user_name: string;
  ip_address: string;
  request_method: string;
  request_url: string;
  request_params: string;
  response_code: number;
  error_message: string;
  execution_time: number;
  created_at: string;
}

export default function SystemLogPage() {
  const [data, setData] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [logType, setLogType] = useState('');
  const [module, setModule] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [stats, setStats] = useState<any>({ today: [], yesterday: [] });

  const pageSize = 15;

  useEffect(() => {
    loadData();
    loadStats();
  }, [page, keyword, logType, module, startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (keyword) params.keyword = keyword;
      if (logType) params.logType = logType;
      if (module) params.module = module;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res: any = await getLogs(params);
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res: any = await getLogStats();
      if (res.code === 200) {
        setStats(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const res: any = await getLogById(id);
      if (res.code === 200) {
        setSelectedLog(res.data);
        setShowDetail(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { text: string; class: string; icon: any }> = {
      login: { text: '登录', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      logout: { text: '登出', class: 'bg-gray-100 text-gray-700', icon: CheckCircle },
      info: { text: '信息', class: 'bg-blue-100 text-blue-700', icon: Clock },
      warning: { text: '警告', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      error: { text: '错误', class: 'bg-red-100 text-red-700', icon: AlertCircle }
    };
    const config = map[type] || { text: type, class: 'bg-gray-100 text-gray-700', icon: Clock };
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const resetFilters = () => {
    setKeyword('');
    setLogType('');
    setModule('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getStatCount = (list: any[], type: string) => {
    const item = list.find((i: any) => i.log_type === type);
    return item ? item.count : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">系统日志</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-1">今日登录</div>
          <div className="text-2xl font-bold text-green-600">{getStatCount(stats.today, 'login')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-1">今日错误</div>
          <div className="text-2xl font-bold text-red-600">{getStatCount(stats.today, 'error')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-1">昨日登录</div>
          <div className="text-2xl font-bold text-blue-600">{getStatCount(stats.yesterday, 'login')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 mb-1">昨日错误</div>
          <div className="text-2xl font-bold text-orange-600">{getStatCount(stats.yesterday, 'error')}</div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索操作、用户、IP..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部类型</option>
            <option value="login">登录</option>
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部模块</option>
            <option value="认证">认证</option>
            <option value="请验">请验</option>
            <option value="样品">样品</option>
            <option value="任务">任务</option>
            <option value="结果">结果</option>
            <option value="报告">报告</option>
            <option value="物料">物料</option>
            <option value="仪器">仪器</option>
            <option value="方法">方法</option>
            <option value="用户">用户</option>
            <option value="稳定性">稳定性</option>
            <option value="环境">环境</option>
            <option value="偏差">偏差</option>
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            重置筛选
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">模块</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">用户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">耗时(ms)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto" />
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3">{getTypeBadge(item.log_type)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.module}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.operation}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.user_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.ip_address}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.execution_time}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无日志数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {total > 0 && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">共 {total} 条记录，第 {page} 页</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                上一页
              </button>
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

      {/* 详情弹窗 */}
      {showDetail && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">日志详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">日志ID</label>
                  <div className="text-sm text-slate-800">{selectedLog.id}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">日志类型</label>
                  <div className="text-sm">{getTypeBadge(selectedLog.log_type)}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">模块</label>
                  <div className="text-sm text-slate-800">{selectedLog.module}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">操作</label>
                  <div className="text-sm text-slate-800">{selectedLog.operation}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">操作人</label>
                  <div className="text-sm text-slate-800">{selectedLog.user_name || '-'}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">IP地址</label>
                  <div className="text-sm text-slate-800">{selectedLog.ip_address}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">请求方法</label>
                  <div className="text-sm text-slate-800">{selectedLog.request_method}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">响应状态码</label>
                  <div className="text-sm text-slate-800">{selectedLog.response_code}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">执行时间</label>
                  <div className="text-sm text-slate-800">{selectedLog.execution_time} ms</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">创建时间</label>
                  <div className="text-sm text-slate-800">{formatDate(selectedLog.created_at)}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">请求URL</label>
                <div className="text-sm text-slate-800 bg-slate-50 p-2 rounded font-mono break-all">{selectedLog.request_url}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">请求参数</label>
                <pre className="text-sm text-slate-800 bg-slate-50 p-2 rounded font-mono whitespace-pre-wrap">
                  {selectedLog.request_params || '-'}
                </pre>
              </div>
              {selectedLog.error_message && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">错误信息</label>
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedLog.error_message}</div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowDetail(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
