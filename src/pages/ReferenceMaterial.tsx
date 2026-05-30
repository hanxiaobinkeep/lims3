import { useEffect, useState } from 'react';
import {
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import {
  getList,
  getById,
  create,
  update,
  remove,
  addCheck,
  getSolutions,
  createSolution,
  removeSolution,
  type ReferenceMaterial,
  type Solution
} from '../services/referenceMaterial';

const rmTypes = ['标准物质', '标准溶液'];
const rmStatusMap: Record<string, { text: string; class: string; icon: any }> = {
  in_stock: { text: '正常库存', class: 'bg-green-100 text-green-700', icon: CheckCircle },
  expiring: { text: '即将过期', class: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  expired: { text: '已过期', class: 'bg-red-100 text-red-700', icon: AlertTriangle }
};

export default function ReferenceMaterialPage() {
  const [activeTab, setActiveTab] = useState<'materials' | 'solutions'>('materials');
  const [materials, setMaterials] = useState<ReferenceMaterial[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    rm_name: '',
    rm_type: '',
    status: ''
  });

  // 弹窗状态
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<ReferenceMaterial | null>(null);

  const [materialForm, setMaterialForm] = useState({
    rm_code: '',
    rm_name: '',
    rm_type: '',
    specification: '',
    purity: '',
    concentration: '',
    unit: '',
    manufacturer: '',
    supplier_id: '',
    batch_number: '',
    certificate_no: '',
    manufacture_date: '',
    expiry_date: '',
    storage_condition: '',
    initial_amount: '',
    current_amount: '',
    unit_amount: '',
    status: 'in_stock',
    remark: ''
  });

  const [solutionForm, setSolutionForm] = useState({
    solution_code: '',
    solution_name: '',
    concentration: '',
    concentration_unit: 'mol/L',
    preparation_method: '',
    raw_material_id: '',
    raw_material_amount: '',
    solvent: '',
    solvent_amount: '',
    total_volume: '',
    preparation_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    prepared_by: '',
    checked_by: '',
    calibration_required: false,
    calibration_result: '',
    status: 'valid',
    remark: ''
  });

  const [checkForm, setCheckForm] = useState({
    check_date: new Date().toISOString().split('T')[0],
    check_type: '',
    check_method: '',
    check_result: 'pass',
    deviation_description: '',
    file_path: '',
    checked_by: '',
    next_check_date: '',
    remark: ''
  });

  useEffect(() => {
    if (activeTab === 'materials') {
      loadMaterials();
    } else {
      loadSolutions();
    }
  }, [page, filters, activeTab]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res: any = await getList({
        page,
        pageSize: 20,
        ...(filters.rm_name && { rm_name: filters.rm_name }),
        ...(filters.rm_type && { rm_type: filters.rm_type }),
        ...(filters.status && { status: filters.status })
      });
      if (res?.code === 200) {
        setMaterials(res?.data.list);
        setTotal(res?.data.total);
      }
    } catch (error) {
      console.error('加载标准物质失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSolutions = async () => {
    setLoading(true);
    try {
      const res: any = await getSolutions({
        page,
        pageSize: 20,
        solution_name: filters.rm_name,
        status: filters.status
      });
      if (res?.code === 200) {
        setSolutions(res?.data.list);
        setTotal(res?.data.total);
      }
    } catch (error) {
      console.error('加载标准溶液失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterialDetail = async (id: number) => {
    try {
      const res: any = await getById(id);
      if (res?.code === 200) {
        setSelectedMaterial(res?.data);
      }
    } catch (error) {
      console.error('加载标准物质详情失败:', error);
    }
  };

  const handleSaveMaterial = async () => {
    if (!materialForm.rm_code || !materialForm.rm_name) {
      alert('请填写标准物质编号和名称');
      return;
    }
    try {
      const data = {
        ...materialForm,
        purity: materialForm.purity ? parseFloat(materialForm.purity) : null,
        initial_amount: materialForm.initial_amount ? parseFloat(materialForm.initial_amount) : null,
        current_amount: materialForm.current_amount ? parseFloat(materialForm.current_amount) : null
      };
      if (editingId) {
        await update(editingId, data);
      } else {
        await create(data);
      }
      setShowMaterialModal(false);
      resetMaterialForm();
      loadMaterials();
    } catch (error) {
      console.error('保存标准物质失败:', error);
    }
  };

  const handleSaveSolution = async () => {
    if (!solutionForm.solution_code || !solutionForm.solution_name) {
      alert('请填写溶液编号和名称');
      return;
    }
    try {
      const data = {
        ...solutionForm,
        concentration: solutionForm.concentration ? parseFloat(solutionForm.concentration) : null,
        raw_material_amount: solutionForm.raw_material_amount ? parseFloat(solutionForm.raw_material_amount) : null,
        solvent_amount: solutionForm.solvent_amount ? parseFloat(solutionForm.solvent_amount) : null,
        total_volume: solutionForm.total_volume ? parseFloat(solutionForm.total_volume) : null
      };
      await createSolution(data);
      setShowSolutionModal(false);
      resetSolutionForm();
      loadSolutions();
    } catch (error) {
      console.error('保存标准溶液失败:', error);
    }
  };

  const handleSaveCheck = async () => {
    if (!selectedMaterial || !checkForm.check_date || !checkForm.check_result) {
      alert('请填写必填项');
      return;
    }
    try {
      await addCheck(selectedMaterial.id, checkForm);
      setShowCheckModal(false);
      resetCheckForm();
      loadMaterialDetail(selectedMaterial.id);
    } catch (error) {
      console.error('保存核查记录失败:', error);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('确定要删除这个标准物质吗？')) return;
    try {
      await remove(id);
      loadMaterials();
    } catch (error) {
      console.error('删除标准物质失败:', error);
    }
  };

  const handleDeleteSolution = async (id: number) => {
    if (!confirm('确定要删除这个标准溶液吗？')) return;
    try {
      await removeSolution(id);
      loadSolutions();
    } catch (error) {
      console.error('删除标准溶液失败:', error);
    }
  };

  const handleEditMaterial = (material: ReferenceMaterial) => {
    setEditingId(material.id);
    setMaterialForm({
      rm_code: material.rm_code,
      rm_name: material.rm_name,
      rm_type: material.rm_type || '',
      specification: material.specification || '',
      purity: material.purity ? String(material.purity) : '',
      concentration: material.concentration || '',
      unit: material.unit || '',
      manufacturer: material.manufacturer || '',
      supplier_id: material.supplier_id ? String(material.supplier_id) : '',
      batch_number: material.batch_number || '',
      certificate_no: material.certificate_no || '',
      manufacture_date: material.manufacture_date || '',
      expiry_date: material.expiry_date || '',
      storage_condition: material.storage_condition || '',
      initial_amount: material.initial_amount ? String(material.initial_amount) : '',
      current_amount: material.current_amount ? String(material.current_amount) : '',
      unit_amount: material.unit_amount || '',
      status: material.status,
      remark: material.remark || ''
    });
    setShowMaterialModal(true);
  };

  const handleViewDetail = (material: ReferenceMaterial) => {
    loadMaterialDetail(material.id);
    setShowDetailModal(true);
  };

  const resetMaterialForm = () => {
    setEditingId(null);
    setMaterialForm({
      rm_code: '',
      rm_name: '',
      rm_type: '',
      specification: '',
      purity: '',
      concentration: '',
      unit: '',
      manufacturer: '',
      supplier_id: '',
      batch_number: '',
      certificate_no: '',
      manufacture_date: '',
      expiry_date: '',
      storage_condition: '',
      initial_amount: '',
      current_amount: '',
      unit_amount: '',
      status: 'in_stock',
      remark: ''
    });
  };

  const resetSolutionForm = () => {
    setSolutionForm({
      solution_code: '',
      solution_name: '',
      concentration: '',
      concentration_unit: 'mol/L',
      preparation_method: '',
      raw_material_id: '',
      raw_material_amount: '',
      solvent: '',
      solvent_amount: '',
      total_volume: '',
      preparation_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      prepared_by: '',
      checked_by: '',
      calibration_required: false,
      calibration_result: '',
      status: 'valid',
      remark: ''
    });
  };

  const resetCheckForm = () => {
    setCheckForm({
      check_date: new Date().toISOString().split('T')[0],
      check_type: '',
      check_method: '',
      check_result: 'pass',
      deviation_description: '',
      file_path: '',
      checked_by: '',
      next_check_date: '',
      remark: ''
    });
  };

  const renderStatusBadge = (status: string) => {
    const config = rmStatusMap[status] || rmStatusMap['in_stock'];
    const Icon = config.icon;
    return (
      <span className={`px-2 py-1 ${config.class} text-xs rounded-full flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const checkResultColors: Record<string, string> = {
    pass: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">标准物质管理</h1>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg p-2 flex gap-2">
        <button
          onClick={() => { setActiveTab('materials'); setPage(1); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'materials' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <FlaskConical className="w-4 h-4" />
          标准物质
        </button>
        <button
          onClick={() => { setActiveTab('solutions'); setPage(1); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'solutions' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <FlaskConical className="w-4 h-4" />
          标准溶液
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索名称..."
              value={filters.rm_name}
              onChange={(e) => setFilters({ ...filters, rm_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          {activeTab === 'materials' && (
            <div className="min-w-[150px]">
              <select
                value={filters.rm_type}
                onChange={(e) => setFilters({ ...filters, rm_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">全部类型</option>
                {rmTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">全部状态</option>
              <option value="in_stock">正常库存</option>
              <option value="expiring">即将过期</option>
              <option value="expired">已过期</option>
            </select>
          </div>
          <button
            onClick={() => { setFilters({ rm_name: '', rm_type: '', status: '' }); setPage(1); }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            重置
          </button>
          <button
            onClick={() => activeTab === 'materials' ? (resetMaterialForm(), setShowMaterialModal(true)) : (resetSolutionForm(), setShowSolutionModal(true))}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'materials' ? '添加标准物质' : '添加标准溶液'}
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
          </div>
        ) : activeTab === 'materials' && materials.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无标准物质数据</p>
          </div>
        ) : activeTab === 'solutions' && solutions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无标准溶液数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">规格</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">批号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">有效期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'materials' ? (
                  materials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{m.rm_code}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.rm_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.specification || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.batch_number || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {m.expiry_date}
                        </div>
                      </td>
                      <td className="px-6 py-4">{renderStatusBadge(m.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(m)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditMaterial(m)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(m.id)}
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
                  solutions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{s.solution_code}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.solution_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.concentration} {s.concentration_unit}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.total_volume} mL</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {s.expiry_date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 ${s.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs rounded-full`}>
                          {s.status === 'valid' ? '有效' : '无效'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteSolution(s.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* 标准物质表单弹窗 */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? '编辑标准物质' : '添加标准物质'}</h2>
              <button onClick={() => { setShowMaterialModal(false); resetMaterialForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">编号 <span className="text-red-600">*</span></label><input type="text" value={materialForm.rm_code} onChange={e => setMaterialForm({ ...materialForm, rm_code: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">名称 <span className="text-red-600">*</span></label><input type="text" value={materialForm.rm_name} onChange={e => setMaterialForm({ ...materialForm, rm_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">类型</label><select value={materialForm.rm_type} onChange={e => setMaterialForm({ ...materialForm, rm_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">{rmTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">规格</label><input type="text" value={materialForm.specification} onChange={e => setMaterialForm({ ...materialForm, specification: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">纯度(%)</label><input type="number" step="0.01" value={materialForm.purity} onChange={e => setMaterialForm({ ...materialForm, purity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">浓度</label><input type="text" value={materialForm.concentration} onChange={e => setMaterialForm({ ...materialForm, concentration: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">生产厂家</label><input type="text" value={materialForm.manufacturer} onChange={e => setMaterialForm({ ...materialForm, manufacturer: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">批号</label><input type="text" value={materialForm.batch_number} onChange={e => setMaterialForm({ ...materialForm, batch_number: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">证书编号</label><input type="text" value={materialForm.certificate_no} onChange={e => setMaterialForm({ ...materialForm, certificate_no: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">生产日期</label><input type="date" value={materialForm.manufacture_date} onChange={e => setMaterialForm({ ...materialForm, manufacture_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">有效期</label><input type="date" value={materialForm.expiry_date} onChange={e => setMaterialForm({ ...materialForm, expiry_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">储存条件</label><input type="text" value={materialForm.storage_condition} onChange={e => setMaterialForm({ ...materialForm, storage_condition: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">初始数量</label><input type="number" step="0.01" value={materialForm.initial_amount} onChange={e => setMaterialForm({ ...materialForm, initial_amount: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">当前数量</label><input type="number" step="0.01" value={materialForm.current_amount} onChange={e => setMaterialForm({ ...materialForm, current_amount: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">单位</label><input type="text" value={materialForm.unit_amount} onChange={e => setMaterialForm({ ...materialForm, unit_amount: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">状态</label><select value={materialForm.status} onChange={e => setMaterialForm({ ...materialForm, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">{Object.entries(rmStatusMap).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">备注</label><textarea value={materialForm.remark} onChange={e => setMaterialForm({ ...materialForm, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} /></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowMaterialModal(false); resetMaterialForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleSaveMaterial} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 标准溶液表单弹窗 */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">添加标准溶液</h2>
              <button onClick={() => { setShowSolutionModal(false); resetSolutionForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">溶液编号 <span className="text-red-600">*</span></label><input type="text" value={solutionForm.solution_code} onChange={e => setSolutionForm({ ...solutionForm, solution_code: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">溶液名称 <span className="text-red-600">*</span></label><input type="text" value={solutionForm.solution_name} onChange={e => setSolutionForm({ ...solutionForm, solution_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">浓度</label><input type="number" step="0.0001" value={solutionForm.concentration} onChange={e => setSolutionForm({ ...solutionForm, concentration: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">单位</label><input type="text" value={solutionForm.concentration_unit} onChange={e => setSolutionForm({ ...solutionForm, concentration_unit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">溶剂</label><input type="text" value={solutionForm.solvent} onChange={e => setSolutionForm({ ...solutionForm, solvent: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">总体积(mL)</label><input type="number" step="0.01" value={solutionForm.total_volume} onChange={e => setSolutionForm({ ...solutionForm, total_volume: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">配制日期</label><input type="date" value={solutionForm.preparation_date} onChange={e => setSolutionForm({ ...solutionForm, preparation_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">有效期</label><input type="date" value={solutionForm.expiry_date} onChange={e => setSolutionForm({ ...solutionForm, expiry_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">配制方法</label><textarea value={solutionForm.preparation_method} onChange={e => setSolutionForm({ ...solutionForm, preparation_method: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="calibration-required" checked={solutionForm.calibration_required} onChange={e => setSolutionForm({ ...solutionForm, calibration_required: e.target.checked })} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                <label htmlFor="calibration-required" className="text-sm text-slate-700">需要标定</label>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">备注</label><textarea value={solutionForm.remark} onChange={e => setSolutionForm({ ...solutionForm, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} /></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowSolutionModal(false); resetSolutionForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleSaveSolution} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">标准物质详情</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div>
                <h3 className="text-md font-semibold text-slate-700 mb-4">基本信息</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div><span className="text-sm text-slate-500">编号</span><p className="font-medium">{selectedMaterial.rm_code}</p></div>
                  <div><span className="text-sm text-slate-500">名称</span><p className="font-medium">{selectedMaterial.rm_name}</p></div>
                  <div><span className="text-sm text-slate-500">类型</span><p>{selectedMaterial.rm_type}</p></div>
                  <div><span className="text-sm text-slate-500">规格</span><p>{selectedMaterial.specification || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">纯度</span><p>{selectedMaterial.purity ? `${selectedMaterial.purity}%` : '-'}</p></div>
                  <div><span className="text-sm text-slate-500">浓度</span><p>{selectedMaterial.concentration || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">批号</span><p>{selectedMaterial.batch_number || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">证书号</span><p>{selectedMaterial.certificate_no || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">生产厂家</span><p>{selectedMaterial.manufacturer || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">储存条件</span><p>{selectedMaterial.storage_condition || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">有效期</span><p>{selectedMaterial.expiry_date}</p></div>
                  <div><span className="text-sm text-slate-500">状态</span><p>{renderStatusBadge(selectedMaterial.status)}</p></div>
                  <div className="col-span-2"><span className="text-sm text-slate-500">当前库存</span><p>{selectedMaterial.current_amount} {selectedMaterial.unit_amount}</p></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-slate-700">期间核查记录</h3>
                  <button onClick={() => { resetCheckForm(); setShowCheckModal(true); }} className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 flex items-center gap-1"><Plus className="w-3 h-3" />添加记录</button>
                </div>
                {!selectedMaterial.checks || selectedMaterial.checks.length === 0 ? (
                  <div className="text-center py-4 text-slate-400">暂无核查记录</div>
                ) : (
                  <div className="space-y-3">
                    {selectedMaterial.checks.map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{c.check_date}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${checkResultColors[c.check_result] || checkResultColors.pass}`}>
                              {c.check_result === 'pass' ? '合格' : '不合格'}
                            </span>
                          </div>
                        </div>
                        {c.check_type && <p className="text-sm text-slate-600"><span className="font-medium">核查类型:</span> {c.check_type}</p>}
                        {c.check_method && <p className="text-sm text-slate-600"><span className="font-medium">方法:</span> {c.check_method}</p>}
                        {c.deviation_description && <p className="text-sm text-red-600"><span className="font-medium">偏差说明:</span> {c.deviation_description}</p>}
                        {c.next_check_date && <p className="text-sm text-slate-600"><span className="font-medium">下次核查:</span> {c.next_check_date}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 核查记录表单 */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">添加核查记录</h2>
              <button onClick={() => { setShowCheckModal(false); resetCheckForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">核查日期 <span className="text-red-600">*</span></label><input type="date" value={checkForm.check_date} onChange={e => setCheckForm({ ...checkForm, check_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">核查结果 <span className="text-red-600">*</span></label><select value={checkForm.check_result} onChange={e => setCheckForm({ ...checkForm, check_result: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"><option value="pass">合格</option><option value="fail">不合格</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">核查类型</label><input type="text" value={checkForm.check_type} onChange={e => setCheckForm({ ...checkForm, check_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">核查方法</label><input type="text" value={checkForm.check_method} onChange={e => setCheckForm({ ...checkForm, check_method: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              {checkForm.check_result === 'fail' && (
                <div><label className="block text-sm font-medium text-slate-700 mb-1">偏差说明</label><textarea value={checkForm.deviation_description} onChange={e => setCheckForm({ ...checkForm, deviation_description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} /></div>
              )}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">下次核查日期</label><input type="date" value={checkForm.next_check_date} onChange={e => setCheckForm({ ...checkForm, next_check_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">备注</label><textarea value={checkForm.remark} onChange={e => setCheckForm({ ...checkForm, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} /></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowCheckModal(false); resetCheckForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleSaveCheck} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
