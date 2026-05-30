import { useEffect, useState } from 'react';
import { getList, create, update, remove } from '../services/stability';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface StabilityProtocol {
  id: number;
  protocol_no: string;
  product_name: string;
  batch_no: string;
  storage_condition: string;
  test_items: string;
  duration: number;
  status: string;
  remark: string;
  created_at: string;
}

export default function StabilityPage() {
  const [data, setData] = useState<StabilityProtocol[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    batchNo: '',
    storageCondition: '',
    testItems: '',
    duration: '',
    status: 'draft',
    remark: ''
  });

  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, [page, keyword]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getList({ page, pageSize, keyword });
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
      productName: '',
      batchNo: '',
      storageCondition: '',
      testItems: '',
      duration: '',
      status: 'draft',
      remark: ''
    });
  };

  const handleEdit = (item: StabilityProtocol) => {
    setEditingId(item.id);
    setFormData({
      productName: item.product_name,
      batchNo: item.batch_no || '',
      storageCondition: item.storage_condition || '',
      testItems: item.test_items || '',
      duration: String(item.duration || ''),
      status: item.status,
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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      draft: { text: '草稿', class: 'bg-gray-100 text-gray-700' },
      approved: { text: '已批准', class: 'bg-blue-100 text-blue-700' },
      active: { text: '进行中', class: 'bg-green-100 text-green-700' },
      completed: { text: '已完成', class: 'bg-purple-100 text-purple-700' }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">稳定性方案</h1>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建方案
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
              placeholder="搜索方案编号、产品名称..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">方案编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">产品名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">批号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">贮存条件</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">检测项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">周期(月)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.protocol_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.product_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.batch_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.storage_condition}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.test_items}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.duration}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">
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
                {editingId ? '编辑方案' : '新建方案'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">产品名称</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">批号</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">研究周期(月)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">贮存条件</label>
                <input
                  type="text"
                  value={formData.storageCondition}
                  onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="如：25°C±2°C/60%RH±5%RH"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">检测项目</label>
                <textarea
                  value={formData.testItems}
                  onChange={(e) => setFormData({ ...formData, testItems: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                  placeholder="含量、水分、pH值、外观..."
                />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="draft">草稿</option>
                    <option value="approved">已批准</option>
                    <option value="active">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
              )}
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
                  {editingId ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
