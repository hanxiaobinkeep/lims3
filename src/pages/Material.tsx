import { useEffect, useState } from 'react';
import { getList, create, update, remove } from '../services/material';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface Material {
  id: number;
  code: string;
  name: string;
  category: string;
  specification: string;
  cas_no: string;
  supplier: string;
  stock_quantity: number;
  warning_threshold: number;
  expiry_date: string;
  status: string;
}

export default function MaterialPage() {
  const [data, setData] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'raw',
    specification: '',
    casNo: '',
    supplier: '',
    stockQuantity: '',
    warningThreshold: '',
    expiryDate: '',
    status: 'active'
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
      code: '',
      name: '',
      category: 'raw',
      specification: '',
      casNo: '',
      supplier: '',
      stockQuantity: '',
      warningThreshold: '',
      expiryDate: '',
      status: 'active'
    });
  };

  const handleEdit = (item: Material) => {
    setEditingId(item.id);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      specification: item.specification || '',
      casNo: item.cas_no || '',
      supplier: item.supplier || '',
      stockQuantity: String(item.stock_quantity || ''),
      warningThreshold: String(item.warning_threshold || ''),
      expiryDate: item.expiry_date || '',
      status: item.status
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

  const getCategoryText = (category: string) => {
    const map: Record<string, string> = {
      raw: '原料',
      auxiliary: '辅料',
      intermediate: '中间体',
      finished: '成品',
      reagent: '试剂',
      standard: '标准品'
    };
    return map[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      active: { text: '有效', class: 'bg-green-100 text-green-700' },
      inactive: { text: '无效', class: 'bg-gray-100 text-gray-700' }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">物料管理</h1>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增物料
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
              placeholder="搜索物料编码、名称、CAS号..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">物料编码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">物料名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">规格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">CAS号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">供应商</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">库存</th>
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
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{getCategoryText(item.category)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.specification}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.cas_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.stock_quantity}
                      {item.stock_quantity <= item.warning_threshold && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">低库存</span>
                      )}
                    </td>
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
                {editingId ? '编辑物料' : '新增物料'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">物料编码</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">物料名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="raw">原料</option>
                  <option value="auxiliary">辅料</option>
                  <option value="intermediate">中间体</option>
                  <option value="finished">成品</option>
                  <option value="reagent">试剂</option>
                  <option value="standard">标准品</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">规格</label>
                  <input
                    type="text"
                    value={formData.specification}
                    onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CAS号</label>
                  <input
                    type="text"
                    value={formData.casNo}
                    onChange={(e) => setFormData({ ...formData, casNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">有效期</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">库存数量</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">预警阈值</label>
                  <input
                    type="number"
                    value={formData.warningThreshold}
                    onChange={(e) => setFormData({ ...formData, warningThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
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
