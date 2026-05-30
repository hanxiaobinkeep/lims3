import { useEffect, useState } from 'react';
import { getList, create, update, updateStatus, remove } from '../services/inspectionTask';
import { getList as getSamples } from '../services/sample';
import { getList as getMethods } from '../services/method';
import { getList as getUsers } from '../services/user';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Play,
  CheckCircle,
  RotateCcw,
  Eye
} from 'lucide-react';

interface InspectionTask {
  id: number;
  task_no: string;
  sample_id: number;
  sample_no: string;
  sample_name: string;
  batch_no: string;
  test_item: string;
  method_id: number;
  method_name: string;
  method_code: string;
  assignee_id: number;
  assignee_name: string;
  priority: string;
  status: string;
  due_date: string;
  completed_date: string;
  created_at: string;
}

export default function InspectionTaskPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<InspectionTask[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sampleId: '',
    testItem: '',
    methodId: '',
    assigneeId: '',
    priority: 'normal',
    dueDate: ''
  });

  const pageSize = 10;

  useEffect(() => {
    loadData();
    loadSamples();
    loadMethods();
    loadUsers();
  }, [page, keyword, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getList({ page, pageSize, keyword, status: statusFilter });
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSamples = async () => {
    try {
      const res: any = await getSamples({ pageSize: 100 });
      if (res.code === 200) setSamples(res.data.list);
    } catch (error) {
      console.error('Load samples error:', error);
    }
  };

  const loadMethods = async () => {
    try {
      const res: any = await getMethods({ pageSize: 100 });
      if (res.code === 200) setMethods(res.data.list);
    } catch (error) {
      console.error('Load methods error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res: any = await getUsers({ pageSize: 100 });
      if (res.code === 200) setUsers(res.data.list);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      sampleId: '',
      testItem: '',
      methodId: '',
      assigneeId: '',
      priority: 'normal',
      dueDate: ''
    });
  };

  const handleEdit = (item: InspectionTask) => {
    setEditingId(item.id);
    setFormData({
      sampleId: String(item.sample_id || ''),
      testItem: item.test_item,
      methodId: String(item.method_id || ''),
      assigneeId: String(item.assignee_id || ''),
      priority: item.priority,
      dueDate: item.due_date || ''
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus(id, status);
      loadData();
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await remove(id);
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      pending: { text: '待执行', class: 'bg-amber-100 text-amber-700' },
      in_progress: { text: '进行中', class: 'bg-blue-100 text-blue-700' },
      completed: { text: '已完成', class: 'bg-green-100 text-green-700' },
      reviewed: { text: '已复核', class: 'bg-purple-100 text-purple-700' }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { text: string; class: string }> = {
      high: { text: '高', class: 'bg-red-100 text-red-700' },
      normal: { text: '普通', class: 'bg-blue-100 text-blue-700' },
      low: { text: '低', class: 'bg-gray-100 text-gray-700' }
    };
    const config = map[priority] || { text: priority, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">检验任务</h1>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          分配任务
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索任务编号、检测项目..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部状态</option>
            <option value="pending">待执行</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="reviewed">已复核</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">任务编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">检测项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">检测方法</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">执行人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">截止日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.task_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{item.sample_name}</div>
                      <div className="text-xs text-slate-400">{item.sample_no}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.test_item}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{item.method_name}</div>
                      <div className="text-xs text-slate-400">{item.method_code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.assignee_name}</td>
                    <td className="px-6 py-4">{getPriorityBadge(item.priority)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.due_date}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'in_progress')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="开始执行"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'completed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="完成"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'completed' && (
                          <button
                            onClick={() => navigate('/inspection/entry')}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                            title="录入结果"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                        {['completed', 'reviewed'].includes(item.status) && (
                          <button
                            onClick={() => navigate('/inspection/review')}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="查看结果"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? '编辑任务' : '分配任务'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">样品</label>
                <select
                  value={formData.sampleId}
                  onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                >
                  <option value="">请选择样品</option>
                  {samples.map(s => (
                    <option key={s.id} value={s.id}>{s.sample_no} - {s.sample_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">检测项目</label>
                <input
                  type="text"
                  value={formData.testItem}
                  onChange={(e) => setFormData({ ...formData, testItem: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="如：含量测定、水分、pH值"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">检测方法</label>
                <select
                  value={formData.methodId}
                  onChange={(e) => setFormData({ ...formData, methodId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">请选择方法</option>
                  {methods.map(m => (
                    <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">执行人</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.real_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="high">高</option>
                    <option value="normal">普通</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">截止日期</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg"
                >
                  {editingId ? '保存' : '分配'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
