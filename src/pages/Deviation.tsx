import { useEffect, useState } from 'react';
import { getList, create, update, updateStatus, remove } from '../services/deviation';
import { Plus, Search, Edit2, Trash2, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Deviation {
  id: number;
  deviation_no: string;
  deviation_type: string;
  source: string;
  description: string;
  investigator_id: number;
  investigator_name: string;
  investigation_result: string;
  corrective_action: string;
  status: string;
  created_at: string;
  closed_at: string;
}

export default function DeviationPage() {
  const [data, setData] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    deviationType: 'OOS',
    source: '',
    description: '',
    investigatorId: '',
    investigationResult: '',
    correctiveAction: ''
  });

  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, [page, keyword, typeFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getList({ page, pageSize, keyword, deviationType: typeFilter, status: statusFilter });
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await update(editingId, formData);
      else await create(formData);
      setShowModal(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error) { console.error(error); }
  };

  const resetForm = () => {
    setFormData({ deviationType: 'OOS', source: '', description: '', investigatorId: '', investigationResult: '', correctiveAction: '' });
  };

  const handleEdit = (item: Deviation) => {
    setEditingId(item.id);
    setFormData({
      deviationType: item.deviation_type,
      source: item.source || '',
      description: item.description || '',
      investigatorId: String(item.investigator_id || ''),
      investigationResult: item.investigation_result || '',
      correctiveAction: item.corrective_action || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该偏差记录？')) return;
    try { await remove(id); loadData(); } catch (error) { console.error(error); }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try { await updateStatus(id, status); loadData(); } catch (error) { console.error(error); }
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { text: string; class: string }> = {
      OOS: { text: 'OOS', class: 'bg-red-100 text-red-700' },
      OOT: { text: 'OOT', class: 'bg-orange-100 text-orange-700' },
      AD: { text: '异常', class: 'bg-yellow-100 text-yellow-700' }
    };
    const config = map[type] || { text: type, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>{config.text}</span>;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string; icon: any }> = {
      open: { text: '待调查', class: 'bg-red-100 text-red-700', icon: AlertTriangle },
      investigating: { text: '调查中', class: 'bg-blue-100 text-blue-700', icon: Clock },
      closed: { text: '已关闭', class: 'bg-green-100 text-green-700', icon: CheckCircle }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700', icon: Clock };
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">偏差调查</h1>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建偏差
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索偏差编号、来源、描述..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部类型</option>
            <option value="OOS">OOS</option>
            <option value="OOT">OOT</option>
            <option value="AD">异常</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部状态</option>
            <option value="open">待调查</option>
            <option value="investigating">调查中</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">偏差编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">来源</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">调查人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div></td></tr>
              ) : data.length > 0 ? data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.deviation_no}</td>
                  <td className="px-6 py-4">{getTypeBadge(item.deviation_type)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.source}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.investigator_name}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                      {item.status === 'open' && (
                        <button onClick={() => handleChangeStatus(item.id, 'investigating')} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="开始调查">调查</button>
                      )}
                      {item.status === 'investigating' && (
                        <button onClick={() => handleChangeStatus(item.id, 'closed')} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100" title="关闭">关闭</button>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">共 {total} 条记录，第 {page} 页</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50">上一页</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50">下一页</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? '编辑偏差' : '新建偏差'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">偏差类型</label>
                  <select value={formData.deviationType} onChange={(e) => setFormData({ ...formData, deviationType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="OOS">OOS (超标)</option>
                    <option value="OOT">OOT (超趋势)</option>
                    <option value="AD">AD (异常)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">来源</label>
                  <input type="text" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：稳定性检验、原料检验" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">偏差描述</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调查人ID</label>
                <input type="number" value={formData.investigatorId} onChange={(e) => setFormData({ ...formData, investigatorId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调查结果</label>
                <textarea value={formData.investigationResult} onChange={(e) => setFormData({ ...formData, investigationResult: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">纠正措施</label>
                <textarea value={formData.correctiveAction} onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg">{editingId ? '保存' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
