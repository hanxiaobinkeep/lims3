import { useEffect, useState } from 'react';
import { getList, create, update, remove } from '../services/inspectionRequest';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ClipboardList
} from 'lucide-react';

interface InspectionRequest {
  id: number;
  request_no: string;
  sample_name: string;
  sample_type: string;
  batch_no: string;
  quantity: number;
  unit: string;
  request_dept: string;
  requester_name: string;
  request_date: string;
  priority: string;
  status: string;
  remark: string;
}

export default function InspectionRequestPage() {
  const [data, setData] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sampleName: '',
    sampleType: 'raw',
    batchNo: '',
    quantity: '',
    unit: '',
    requestDept: '',
    priority: 'normal',
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
      setFormData({
        sampleName: '',
        sampleType: 'raw',
        batchNo: '',
        quantity: '',
        unit: '',
        requestDept: '',
        priority: 'normal',
        remark: ''
      });
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (item: InspectionRequest) => {
    setEditingId(item.id);
    setFormData({
      sampleName: item.sample_name,
      sampleType: item.sample_type,
      batchNo: item.batch_no || '',
      quantity: String(item.quantity || ''),
      unit: item.unit || '',
      requestDept: item.request_dept || '',
      priority: item.priority,
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

  const getSampleTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      raw: '原料',
      auxiliary: '辅料',
      intermediate: '中间体',
      finished: '成品',
      environmental: '环境样'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">请验管理</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              sampleName: '',
              sampleType: 'raw',
              batchNo: '',
              quantity: '',
              unit: '',
              requestDept: '',
              priority: 'normal',
              remark: ''
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建请验
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索请验单号、样品名称、批号..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">请验单号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">批号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">请验部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">优先级</th>
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
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.request_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.sample_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{getSampleTypeText(item.sample_type)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.batch_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.request_dept}</td>
                    <td className="px-6 py-4">{getPriorityBadge(item.priority)}</td>
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
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              共 {total} 条记录，第 {page} 页
            </span>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? '编辑请验单' : '新建请验单'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">样品名称</label>
                <input
                  type="text"
                  value={formData.sampleName}
                  onChange={(e) => setFormData({ ...formData, sampleName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">样品类型</label>
                <select
                  value={formData.sampleType}
                  onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="raw">原料</option>
                  <option value="auxiliary">辅料</option>
                  <option value="intermediate">中间体</option>
                  <option value="finished">成品</option>
                  <option value="environmental">环境样</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">批号</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">请验部门</label>
                  <input
                    type="text"
                    value={formData.requestDept}
                    onChange={(e) => setFormData({ ...formData, requestDept: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">数量</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="kg, L, g..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="high">高</option>
                  <option value="normal">普通</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors"
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
