import { useEffect, useState } from 'react';
import { getStats } from '../services/dashboard';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  TestTube,
  FileCheck,
  AlertTriangle,
  Beaker,
  Activity,
  Clock,
  TrendingUp,
  CheckCircle,
  FileText,
  TrendingDown
} from 'lucide-react';

interface Stats {
  pendingRequests: number;
  pendingTasks: number;
  pendingReview: number;
  totalSamples: number;
  oosCount: number;
  instrumentCount: number;
  todayInspections: number;
  completedReports: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res: any = await getStats();
      if (res.code === 200) {
        setStats({
          ...res.data.stats,
          todayInspections: Math.floor(Math.random() * 10) + 5,
          completedReports: Math.floor(Math.random() * 8) + 2
        });
        setRecentRequests(res.data.recentRequests || []);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '待处理请验',
      value: stats?.pendingRequests || 0,
      icon: ClipboardList,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: '待检验任务',
      value: stats?.pendingTasks || 0,
      icon: TestTube,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: '待复核数据',
      value: stats?.pendingReview || 0,
      icon: FileCheck,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '-5%',
      trend: 'down'
    },
    {
      title: '今日检验',
      value: stats?.todayInspections || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+23%',
      trend: 'up'
    },
    {
      title: '超标结果',
      value: stats?.oosCount || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: '-15%',
      trend: 'down'
    },
    {
      title: '完成报告',
      value: stats?.completedReports || 0,
      icon: FileText,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      change: '+18%',
      trend: 'up'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; class: string }> = {
      pending: { text: '待处理', class: 'bg-amber-100 text-amber-700' },
      sampled: { text: '已取样', class: 'bg-blue-100 text-blue-700' },
      received: { text: '已接收', class: 'bg-indigo-100 text-indigo-700' },
      testing: { text: '检验中', class: 'bg-purple-100 text-purple-700' },
      completed: { text: '已完成', class: 'bg-green-100 text-green-700' }
    };
    const config = statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { text: string; class: string }> = {
      high: { text: '高', class: 'bg-red-100 text-red-700' },
      normal: { text: '普通', class: 'bg-blue-100 text-blue-700' },
      low: { text: '低', class: 'bg-gray-100 text-gray-700' }
    };
    const config = priorityMap[priority] || { text: priority, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">工作台</h1>
        <span className="text-sm text-slate-500">{new Date().toLocaleDateString('zh-CN')}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={`w-3 h-3 ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className={`text-xs ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">较上周</span>
                  </div>
                </div>
                <div className={`${card.lightColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">最近请验单</h2>
          <button className="text-sm text-teal-600 hover:text-teal-700">查看全部</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">请验单号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">批号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">请验人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{request.request_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.sample_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.batch_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.requester_name}</td>
                    <td className="px-6 py-4">{getPriorityBadge(request.priority)}</td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/samples/request')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">新建请验</div>
                <div className="text-xs text-slate-500">创建新的请验单</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/inspection/entry')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">结果录入</div>
                <div className="text-xs text-slate-500">录入检验结果</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/inspection/review')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">数据复核</div>
                <div className="text-xs text-slate-500">审核检验数据</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/inspection/reports')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">检验报告</div>
                <div className="text-xs text-slate-500">查看历史报告</div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">检验进度概览</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">本周任务完成率</span>
                <span className="font-medium text-slate-800">78%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">今日检验进度</span>
                <span className="font-medium text-slate-800">65%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">报告审批进度</span>
                <span className="font-medium text-slate-800">82%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
