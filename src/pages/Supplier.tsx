import { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Save,
  FileText,
  Star,
  Eye,
  Award
} from 'lucide-react';
import {
  getList,
  getById,
  create,
  update,
  remove,
  addQualification,
  removeQualification,
  addEvaluation,
  removeEvaluation,
  type Supplier,
  type SupplierQualification,
  type SupplierEvaluation
} from '../services/supplier';

const supplierTypes = [
  { value: '原料', label: '原料' },
  { value: '辅料', label: '辅料' },
  { value: '试剂', label: '试剂' },
  { value: '设备', label: '设备' },
  { value: '服务', label: '服务' }
];

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    supplier_name: '',
    supplier_type: '',
    is_qualified: ''
  });

  // 弹窗相关
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    supplier_code: '',
    supplier_name: '',
    short_name: '',
    supplier_type: '',
    address: '',
    contact_person: '',
    contact_phone: '',
    email: '',
    website: '',
    is_qualified: true,
    qualification_deadline: '',
    status: 'active',
    remark: ''
  });

  // 资质表单
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [qualificationForm, setQualificationForm] = useState({
    qualification_name: '',
    qualification_type: '',
    certificate_no: '',
    issue_date: '',
    expiry_date: '',
    file_path: '',
    remark: ''
  });

  // 评价表单
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    evaluation_date: new Date().toISOString().split('T')[0],
    evaluation_period: '',
    quality_score: 80,
    delivery_score: 80,
    service_score: 80,
    price_score: 80,
    remark: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, [page, filters]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res: any = await getList({
        page,
        pageSize: 20,
        ...(filters.supplier_name && { supplier_name: filters.supplier_name }),
        ...(filters.supplier_type && { supplier_type: filters.supplier_type }),
        ...(filters.is_qualified && { is_qualified: filters.is_qualified === 'true' })
      });
      if (res?.code === 200) {
        setSuppliers(res?.data.list);
        setTotal(res?.data.total);
      }
    } catch (error) {
      console.error('加载供应商失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierDetail = async (id: number) => {
    try {
      const res: any = await getById(id);
      if (res?.code === 200) {
        setSelectedSupplier(res?.data);
      }
    } catch (error) {
      console.error('加载供应商详情失败:', error);
    }
  };

  const handleViewDetail = (supplier: Supplier) => {
    loadSupplierDetail(supplier.id);
    setShowDetailModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      supplier_code: supplier.supplier_code,
      supplier_name: supplier.supplier_name,
      short_name: supplier.short_name || '',
      supplier_type: supplier.supplier_type || '',
      address: supplier.address || '',
      contact_person: supplier.contact_person || '',
      contact_phone: supplier.contact_phone || '',
      email: supplier.email || '',
      website: supplier.website || '',
      is_qualified: supplier.is_qualified,
      qualification_deadline: supplier.qualification_deadline || '',
      status: supplier.status,
      remark: supplier.remark || ''
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该供应商吗？')) return;
    try {
      await remove(id);
      loadSuppliers();
    } catch (error) {
      console.error('删除供应商失败:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.supplier_code || !formData.supplier_name) {
      alert('请填写供应商编码和名称');
      return;
    }
    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      setShowFormModal(false);
      resetForm();
      loadSuppliers();
    } catch (error) {
      console.error('保存供应商失败:', error);
    }
  };

  const handleAddQualification = async () => {
    if (!selectedSupplier || !qualificationForm.qualification_name) {
      alert('请填写资质名称');
      return;
    }
    try {
      await addQualification(selectedSupplier.id, qualificationForm);
      setShowQualificationModal(false);
      resetQualificationForm();
      loadSupplierDetail(selectedSupplier.id);
    } catch (error) {
      console.error('添加资质失败:', error);
    }
  };

  const handleDeleteQualification = async (id: number) => {
    if (!confirm('确定要删除该资质吗？')) return;
    try {
      await removeQualification(id);
      if (selectedSupplier) {
        loadSupplierDetail(selectedSupplier.id);
      }
    } catch (error) {
      console.error('删除资质失败:', error);
    }
  };

  const handleAddEvaluation = async () => {
    if (!selectedSupplier) return;
    try {
      await addEvaluation(selectedSupplier.id, evaluationForm);
      setShowEvaluationModal(false);
      resetEvaluationForm();
      loadSupplierDetail(selectedSupplier.id);
    } catch (error) {
      console.error('添加评价失败:', error);
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    if (!confirm('确定要删除该评价吗？')) return;
    try {
      await removeEvaluation(id);
      if (selectedSupplier) {
        loadSupplierDetail(selectedSupplier.id);
      }
    } catch (error) {
      console.error('删除评价失败:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      supplier_code: '',
      supplier_name: '',
      short_name: '',
      supplier_type: '',
      address: '',
      contact_person: '',
      contact_phone: '',
      email: '',
      website: '',
      is_qualified: true,
      qualification_deadline: '',
      status: 'active',
      remark: ''
    });
  };

  const resetQualificationForm = () => {
    setQualificationForm({
      qualification_name: '',
      qualification_type: '',
      certificate_no: '',
      issue_date: '',
      expiry_date: '',
      file_path: '',
      remark: ''
    });
  };

  const resetEvaluationForm = () => {
    setEvaluationForm({
      evaluation_date: new Date().toISOString().split('T')[0],
      evaluation_period: '',
      quality_score: 80,
      delivery_score: 80,
      service_score: 80,
      price_score: 80,
      remark: ''
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">启用</span>
    ) : (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">停用</span>
    );
  };

  const getQualifiedBadge = (isQualified: boolean) => {
    return isQualified ? (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
        <Award className="w-3 h-3" />
        合格
      </span>
    ) : (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">未合格</span>
    );
  };

  const getEvaluationResultBadge = (result: string) => {
    const colors: Record<string, string> = {
      '优秀': 'bg-green-100 text-green-700',
      '良好': 'bg-blue-100 text-blue-700',
      '合格': 'bg-gray-100 text-gray-700',
      '不合格': 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-1 ${colors[result] || 'bg-gray-100 text-gray-700'} text-xs rounded-full`}>{result}</span>;
  };

  const renderStars = (score: number) => {
    const filledStars = Math.round(score / 20);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= filledStars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600">{score}分</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">供应商管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理供应商信息、资质和评价</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加供应商
        </button>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">供应商名称</label>
            <input
              type="text"
              value={filters.supplier_name}
              onChange={(e) => setFilters({ ...filters, supplier_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="请输入供应商名称"
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">供应商类型</label>
            <select
              value={filters.supplier_type}
              onChange={(e) => setFilters({ ...filters, supplier_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">全部类型</option>
              {supplierTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">资质状态</label>
            <select
              value={filters.is_qualified}
              onChange={(e) => setFilters({ ...filters, is_qualified: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">全部状态</option>
              <option value="true">合格供应商</option>
              <option value="false">未合格</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ supplier_name: '', supplier_type: '', is_qualified: '' })}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            重置
          </button>
        </div>
      </div>

      {/* 供应商列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无供应商数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">供应商编码</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">供应商名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">联系人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">资质状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{supplier.supplier_code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{supplier.supplier_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{supplier.supplier_type || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{supplier.contact_person || '-'}</div>
                      <div className="text-xs text-slate-400">{supplier.contact_phone || ''}</div>
                    </td>
                    <td className="px-6 py-4">{getQualifiedBadge(supplier.is_qualified)}</td>
                    <td className="px-6 py-4">{getStatusBadge(supplier.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(supplier)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">共 {total} 条记录</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-slate-700">第 {page} 页</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 供应商表单弹窗 */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? '编辑供应商' : '添加供应商'}
              </h2>
              <button
                onClick={() => { setShowFormModal(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商编码 <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.supplier_code}
                    onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商名称 <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商简称</label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商类型</label>
                  <select
                    value={formData.supplier_type}
                    onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {supplierTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系人</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">网站</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">资质有效期</label>
                  <input
                    type="date"
                    value={formData.qualification_deadline}
                    onChange={(e) => setFormData({ ...formData, qualification_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="active">启用</option>
                    <option value="inactive">停用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_qualified"
                  checked={formData.is_qualified}
                  onChange={(e) => setFormData({ ...formData, is_qualified: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="is_qualified" className="text-sm text-slate-700">合格供应商</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowFormModal(false); resetForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 供应商详情弹窗 */}
      {showDetailModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">供应商详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              {/* 基本信息 */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <span className="text-sm text-slate-500">供应商编码</span>
                    <p className="font-medium text-slate-800">{selectedSupplier.supplier_code}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">供应商名称</span>
                    <p className="font-medium text-slate-800">{selectedSupplier.supplier_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">供应商简称</span>
                    <p className="text-slate-700">{selectedSupplier.short_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">供应商类型</span>
                    <p className="text-slate-700">{selectedSupplier.supplier_type || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">联系人</span>
                    <p className="text-slate-700">{selectedSupplier.contact_person || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">联系电话</span>
                    <p className="text-slate-700">{selectedSupplier.contact_phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">邮箱</span>
                    <p className="text-slate-700">{selectedSupplier.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">资质状态</span>
                    <p>{getQualifiedBadge(selectedSupplier.is_qualified)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-500">地址</span>
                    <p className="text-slate-700">{selectedSupplier.address || '-'}</p>
                  </div>
                  {selectedSupplier.remark && (
                    <div className="col-span-2">
                      <span className="text-sm text-slate-500">备注</span>
                      <p className="text-slate-700">{selectedSupplier.remark}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 资质管理 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    资质管理
                  </h3>
                  <button
                    onClick={() => { resetQualificationForm(); setShowQualificationModal(true); }}
                    className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    添加资质
                  </button>
                </div>
                {!selectedSupplier.qualifications || selectedSupplier.qualifications.length === 0 ? (
                  <div className="text-center py-4 text-slate-400">暂无资质信息</div>
                ) : (
                  <div className="space-y-3">
                    {selectedSupplier.qualifications.map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">{q.qualification_name}</p>
                          <div className="text-sm text-slate-500 flex gap-4">
                            <span>证书号: {q.certificate_no || '-'}</span>
                            <span>有效期: {q.issue_date} 至 {q.expiry_date}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQualification(q.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 评价记录 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    评价记录
                  </h3>
                  <button
                    onClick={() => { resetEvaluationForm(); setShowEvaluationModal(true); }}
                    className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    添加评价
                  </button>
                </div>
                {!selectedSupplier.evaluations || selectedSupplier.evaluations.length === 0 ? (
                  <div className="text-center py-4 text-slate-400">暂无评价记录</div>
                ) : (
                  <div className="space-y-3">
                    {selectedSupplier.evaluations.map((e) => (
                      <div key={e.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-800">{e.evaluation_period || '评价'}</span>
                            <span className="text-sm text-slate-500">{e.evaluation_date}</span>
                            {getEvaluationResultBadge(e.evaluation_result)}
                          </div>
                          <button
                            onClick={() => handleDeleteEvaluation(e.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-slate-500">质量</span>
                            {renderStars(e.quality_score)}
                          </div>
                          <div>
                            <span className="text-xs text-slate-500">交货</span>
                            {renderStars(e.delivery_score)}
                          </div>
                          <div>
                            <span className="text-xs text-slate-500">服务</span>
                            {renderStars(e.service_score)}
                          </div>
                          <div>
                            <span className="text-xs text-slate-500">价格</span>
                            {renderStars(e.price_score)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-slate-500">综合评分: </span>
                          <span className="text-lg font-bold text-teal-600">{e.total_score}分</span>
                        </div>
                        {e.remark && (
                          <p className="text-sm text-slate-600 mt-2">备注: {e.remark}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 资质表单弹窗 */}
      {showQualificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">添加资质</h2>
              <button
                onClick={() => { setShowQualificationModal(false); resetQualificationForm(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">资质名称 <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={qualificationForm.qualification_name}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">资质类型</label>
                <input
                  type="text"
                  value={qualificationForm.qualification_type}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">证书编号</label>
                <input
                  type="text"
                  value={qualificationForm.certificate_no}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, certificate_no: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">发证日期</label>
                  <input
                    type="date"
                    value={qualificationForm.issue_date}
                    onChange={(e) => setQualificationForm({ ...qualificationForm, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">有效期至</label>
                  <input
                    type="date"
                    value={qualificationForm.expiry_date}
                    onChange={(e) => setQualificationForm({ ...qualificationForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={qualificationForm.remark}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowQualificationModal(false); resetQualificationForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleAddQualification}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评价表单弹窗 */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">添加评价</h2>
              <button
                onClick={() => { setShowEvaluationModal(false); resetEvaluationForm(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">评价日期</label>
                  <input
                    type="date"
                    value={evaluationForm.evaluation_date}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluation_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">评价周期</label>
                  <input
                    type="text"
                    value={evaluationForm.evaluation_period}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluation_period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="如: 2024年第1季度"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">质量评分: {evaluationForm.quality_score}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluationForm.quality_score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, quality_score: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">交货评分: {evaluationForm.delivery_score}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluationForm.delivery_score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, delivery_score: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">服务评分: {evaluationForm.service_score}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluationForm.service_score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, service_score: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">价格评分: {evaluationForm.price_score}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluationForm.price_score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, price_score: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg text-center">
                <span className="text-sm text-teal-700">预计综合评分: </span>
                <span className="text-xl font-bold text-teal-600">
                  {Math.round((evaluationForm.quality_score + evaluationForm.delivery_score + evaluationForm.service_score + evaluationForm.price_score) / 4)}分
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={evaluationForm.remark}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowEvaluationModal(false); resetEvaluationForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleAddEvaluation}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
