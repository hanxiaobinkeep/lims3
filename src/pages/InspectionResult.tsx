import { useEffect, useState } from 'react';
import { getList, create, update, remove } from '../services/inspectionResult';
import { getList as getTasks } from '../services/inspectionTask';
import { getList as getInstruments } from '../services/instrument';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';

interface InspectionResult {
  id: number;
  task_id: number;
  task_no: string;
  sample_name: string;
  sample_no: string;
  test_item: string;
  result: string;
  unit: string;
  specification: string;
  is_oos: boolean;
  instrument_name: string;
  test_date: string;
  tester_name: string;
  remark: string;
  created_at: string;
  status: string;
}

export default function InspectionResultPage() {
  const [data, setData] = useState<InspectionResult[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [oosFilter, setOosFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    taskId: '',
    testItem: '',
    result: '',
    unit: '',
    specification: '',
    isOOS: false,
    instrumentId: '',
    testDate: '',
    remark: ''
  });

  const pageSize = 10;

  useEffect(() => {
    loadData();
    loadTasks();
    loadInstruments();
  }, [page, keyword, oosFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      pending: { text: '待复核', class: 'bg-amber-100 text-amber-700' },
      reviewing: { text: '复核中', class: 'bg-blue-100 text-blue-700' },
      reviewed: { text: '已复核', class: 'bg-green-100 text-green-700' },
      approved: { text: '已批准', class: 'bg-purple-100 text-purple-700' }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getList({ page, pageSize, keyword, isOOS: oosFilter });
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

  const loadTasks = async () => {
    try {
      const res: any = await getTasks({ pageSize: 100, status: 'in_progress' });
      if (res.code === 200) setTasks(res.data.list);
    } catch (error) {
      console.error('Load tasks error:', error);
    }
  };

  const loadInstruments = async () => {
    try {
      const res: any = await getInstruments({ pageSize: 100, status: 'active' });
      if (res.code === 200) setInstruments(res.data.list);
    } catch (error) {
      console.error('Load instruments error:', error);
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
      taskId: '',
      testItem: '',
      result: '',
      unit: '',
      specification: '',
      isOOS: false,
      instrumentId: '',
      testDate: '',
      remark: ''
    });
  };

  const handleEdit = (item: InspectionResult) => {
    setEditingId(item.id);
    setFormData({
      taskId: String(item.task_id || ''),
      testItem: item.test_item,
      result: item.result || '',
      unit: item.unit || '',
      specification: item.specification || '',
      isOOS: item.is_oos ? true : false,
      instrumentId: '',
      testDate: item.test_date || '',
      remark: item.remark || ''
    });
    setShowModal(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">结果录入</h1>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          录入结果
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
              placeholder="搜索检测项目、结果..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部状态</option>
            <option value="pending">待复核</option>
            <option value="reviewing">复核中</option>
            <option value="reviewed">已复核</option>
            <option value="approved">已批准</option>
          </select>
          <select
            value={oosFilter}
            onChange={(e) => setOosFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部结果</option>
            <option value="true">超标(OOS)</option>
            <option value="false">正常</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">结果</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">规格标准</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">仪器</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">检测日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">检测人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50 ${item.is_oos ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.task_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{item.sample_name}</div>
                      <div className="text-xs text-slate-400">{item.sample_no}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.test_item}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={item.is_oos ? 'text-red-600 font-medium' : 'text-slate-800'}>
                        {item.result} {item.unit}
                      </span>
                      {item.is_oos && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          OOS
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.specification}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.instrument_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.test_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.tester_name}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
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
                  <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-400">
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
                {editingId ? '编辑结果' : '录入结果'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">检验任务</label>
                <select
                  value={formData.taskId}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                >
                  <option value="">请选择任务</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.task_no} - {t.test_item}</option>
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
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">结果值</label>
                  <input
                    type="text"
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="% mg/L..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">规格标准</label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="如：≥95.0%"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOOS"
                  checked={formData.isOOS}
                  onChange={(e) => setFormData({ ...formData, isOOS: e.target.checked })}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="isOOS" className="text-sm text-slate-700">超标(OOS)</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">使用仪器</label>
                  <select
                    value={formData.instrumentId}
                    onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {instruments.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">检测日期</label>
                  <input
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={2}
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
                  {editingId ? '保存' : '录入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
