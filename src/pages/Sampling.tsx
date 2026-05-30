import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  Printer,
  PackageOpen,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  getList,
  getById,
  create,
  update,
  remove,
  recordSampling,
  recordHandover,
  confirmHandover,
  printLabel,
  type SamplingRecord
} from '../services/sampling';
import { getList as getUsers } from '../services/user';
import { getList as getRequests } from '../services/inspectionRequest';

const statusMap: Record<string, { text: string; class: string; icon: any }> = {
  pending: { text: '待取样', class: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  sampled: { text: '已取样', class: 'bg-blue-100 text-blue-700', icon: ClipboardList },
  received: { text: '已接收', class: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { text: '已拒收', class: 'bg-red-100 text-red-700', icon: X }
};

const handoverTypeMap: Record<string, string> = {
  'sampling_to_lab': '取样到实验室',
  'lab_to_storage': '实验室到存储',
  'storage_to_test': '存储到检验'
};

export default function SamplingPage() {
  const [records, setRecords] = useState<SamplingRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    status: ''
  });

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSamplingModal, setShowSamplingModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SamplingRecord | null>(null);

  const [form, setForm] = useState({
    requestId: '',
    sampleName: '',
    batchNo: '',
    samplingPersonId: '',
    samplingTime: new Date().toISOString().slice(0, 16),
    samplingQuantity: '',
    samplingUnit: 'g',
    samplingLocation: '',
    samplingMethod: '',
    storageLocation: '',
    remark: ''
  });

  const [samplingForm, setSamplingForm] = useState({
    samplingPersonId: '',
    samplingTime: new Date().toISOString().slice(0, 16),
    samplingQuantity: '',
    samplingUnit: 'g',
    samplingLocation: '',
    samplingMethod: '',
    remark: ''
  });

  const [handoverForm, setHandoverForm] = useState({
    handoverType: 'sampling_to_lab',
    fromPersonId: '',
    toPersonId: '',
    handoverTime: new Date().toISOString().slice(0, 16),
    handoverQuantity: '',
    remark: ''
  });

  useEffect(() => {
    loadData();
    loadUsers();
    loadRequests();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getList({
        page,
        pageSize: 20,
        ...filters
      });
      if (res?.code === 200) {
        setRecords(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('加载取样记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res: any = await getUsers({ pageSize: 100 });
      if (res?.code === 200) {
        setUsers(res.data.list);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const res: any = await getRequests({ pageSize: 100 });
      if (res?.code === 200) {
        setRequests(res.data.list);
      }
    } catch (error) {
      console.error('加载请验单列表失败:', error);
    }
  };

  const loadDetail = async (id: number) => {
    try {
      const res: any = await getById(id);
      if (res?.code === 200) {
        setSelectedRecord(res.data);
      }
    } catch (error) {
      console.error('加载详情失败:', error);
    }
  };

  const handleSave = async () => {
    if (!form.sampleName) {
      alert('请填写样品名称');
      return;
    }
    try {
      const data = {
        ...form,
        requestId: form.requestId ? Number(form.requestId) : null,
        samplingPersonId: form.samplingPersonId ? Number(form.samplingPersonId) : null,
        samplingQuantity: form.samplingQuantity ? parseFloat(form.samplingQuantity) : null
      };
      if (editingId) {
        await update(editingId, data);
      } else {
        await create(data);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleSampling = async () => {
    if (!selectedRecord || !samplingForm.samplingQuantity) {
      alert('请填写必填项');
      return;
    }
    try {
      await recordSampling(selectedRecord.id, {
        ...samplingForm,
        samplingPersonId: Number(samplingForm.samplingPersonId),
        samplingQuantity: parseFloat(samplingForm.samplingQuantity)
      });
      setShowSamplingModal(false);
      resetSamplingForm();
      loadData();
      if (selectedRecord) loadDetail(selectedRecord.id);
    } catch (error) {
      console.error('取样记录失败:', error);
    }
  };

  const handleHandover = async () => {
    if (!selectedRecord || !handoverForm.toPersonId) {
      alert('请填写必填项');
      return;
    }
    try {
      await recordHandover(selectedRecord.id, {
        ...handoverForm,
        fromPersonId: Number(handoverForm.fromPersonId),
        toPersonId: Number(handoverForm.toPersonId),
        handoverQuantity: handoverForm.handoverQuantity ? parseFloat(handoverForm.handoverQuantity) : null
      });
      setShowHandoverModal(false);
      resetHandoverForm();
      loadData();
      if (selectedRecord) loadDetail(selectedRecord.id);
    } catch (error) {
      console.error('交接记录失败:', error);
    }
  };

  const handleConfirmHandover = async (handoverId: number, status: string) => {
    try {
      await confirmHandover(handoverId, { status });
      loadData();
      if (selectedRecord) loadDetail(selectedRecord.id);
    } catch (error) {
      console.error('交接确认失败:', error);
    }
  };

  const handlePrintLabel = async () => {
    if (!selectedRecord) return;
    try {
      const labelContent = {
        sampleNo: selectedRecord.sampleNo,
        sampleName: selectedRecord.sampleName,
        batchNo: selectedRecord.batchNo,
        samplingTime: selectedRecord.samplingTime
      };
      await printLabel(selectedRecord.id, {
        labelType: 'sample',
        labelContent
      });
      alert('标签打印记录成功！');
      if (selectedRecord) loadDetail(selectedRecord.id);
    } catch (error) {
      console.error('打印标签失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条取样记录吗？')) return;
    try {
      await remove(id);
      loadData();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleEdit = (record: SamplingRecord) => {
    setEditingId(record.id);
    setForm({
      requestId: record.requestId ? String(record.requestId) : '',
      sampleName: record.sampleName,
      batchNo: record.batchNo || '',
      samplingPersonId: record.samplingPersonId ? String(record.samplingPersonId) : '',
      samplingTime: record.samplingTime ? record.samplingTime.slice(0, 16) : new Date().toISOString().slice(0, 16),
      samplingQuantity: record.samplingQuantity ? String(record.samplingQuantity) : '',
      samplingUnit: record.samplingUnit || 'g',
      samplingLocation: record.samplingLocation || '',
      samplingMethod: record.samplingMethod || '',
      storageLocation: record.storageLocation || '',
      remark: record.remark || ''
    });
    setShowModal(true);
  };

  const handleViewDetail = (record: SamplingRecord) => {
    loadDetail(record.id);
    setShowDetailModal(true);
  };

  const handleOpenSampling = (record: SamplingRecord) => {
    setSelectedRecord(record);
    setSamplingForm({
      samplingPersonId: record.samplingPersonId ? String(record.samplingPersonId) : '',
      samplingTime: record.samplingTime ? record.samplingTime.slice(0, 16) : new Date().toISOString().slice(0, 16),
      samplingQuantity: record.samplingQuantity ? String(record.samplingQuantity) : '',
      samplingUnit: record.samplingUnit || 'g',
      samplingLocation: record.samplingLocation || '',
      samplingMethod: record.samplingMethod || '',
      remark: record.remark || ''
    });
    setShowSamplingModal(true);
  };

  const handleOpenHandover = (record: SamplingRecord) => {
    setSelectedRecord(record);
    resetHandoverForm();
    setShowHandoverModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      requestId: '',
      sampleName: '',
      batchNo: '',
      samplingPersonId: '',
      samplingTime: new Date().toISOString().slice(0, 16),
      samplingQuantity: '',
      samplingUnit: 'g',
      samplingLocation: '',
      samplingMethod: '',
      storageLocation: '',
      remark: ''
    });
  };

  const resetSamplingForm = () => {
    setSamplingForm({
      samplingPersonId: '',
      samplingTime: new Date().toISOString().slice(0, 16),
      samplingQuantity: '',
      samplingUnit: 'g',
      samplingLocation: '',
      samplingMethod: '',
      remark: ''
    });
  };

  const resetHandoverForm = () => {
    setHandoverForm({
      handoverType: 'sampling_to_lab',
      fromPersonId: '',
      toPersonId: '',
      handoverTime: new Date().toISOString().slice(0, 16),
      handoverQuantity: '',
      remark: ''
    });
  };

  const renderStatus = (status: string) => {
    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;
    return (
      <span className={`px-2 py-1 ${config.class} text-xs rounded-full flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">取样管理</h1>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索样品编号、名称、批号..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">全部状态</option>
              {Object.entries(statusMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setFilters({ keyword: '', status: '' }); setPage(1); }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            重置
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增取样
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无取样记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">批号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">取样人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">取样时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{record.sampleNo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.sampleName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.batchNo || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.samplingPersonName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.samplingTime ? new Date(record.samplingTime).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4">{renderStatus(record.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(record)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {record.status === 'pending' && (
                          <button
                            onClick={() => handleOpenSampling(record)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                            title="执行取样"
                          >
                            <PackageOpen className="w-4 h-4" />
                          </button>
                        )}
                        {record.status === 'sampled' && (
                          <button
                            onClick={() => handleOpenHandover(record)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="样品交接"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintLabel()}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          title="打印标签"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? '编辑取样记录' : '新增取样记录'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">请验单</label>
                  <select
                    value={form.requestId}
                    onChange={(e) => setForm({ ...form, requestId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>{r.request_no || r.requestNo || '未编号'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">样品名称 <span className="text-red-600">*</span></label>
                  <input type="text" value={form.sampleName} onChange={(e) => setForm({ ...form, sampleName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">批号</label>
                  <input type="text" value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">取样人</label>
                  <select
                    value={form.samplingPersonId}
                    onChange={(e) => setForm({ ...form, samplingPersonId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.realName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">取样时间</label>
                  <input type="datetime-local" value={form.samplingTime} onChange={(e) => setForm({ ...form, samplingTime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">取样量</label>
                    <input type="number" step="0.01" value={form.samplingQuantity} onChange={(e) => setForm({ ...form, samplingQuantity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                    <select value={form.samplingUnit} onChange={(e) => setForm({ ...form, samplingUnit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="mL">mL</option>
                      <option value="L">L</option>
                      <option value="个">个</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">取样地点</label>
                  <input type="text" value={form.samplingLocation} onChange={(e) => setForm({ ...form, samplingLocation: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">存放地点</label>
                  <input type="text" value={form.storageLocation} onChange={(e) => setForm({ ...form, storageLocation: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">取样方法</label>
                <textarea value={form.samplingMethod} onChange={(e) => setForm({ ...form, samplingMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />保存</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">取样详情</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div>
                <h3 className="text-md font-semibold text-slate-700 mb-4">基本信息</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div><span className="text-sm text-slate-500">样品编号</span><p className="font-medium">{selectedRecord.sampleNo}</p></div>
                  <div><span className="text-sm text-slate-500">样品名称</span><p className="font-medium">{selectedRecord.sampleName}</p></div>
                  <div><span className="text-sm text-slate-500">批号</span><p>{selectedRecord.batchNo || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">请验单号</span><p>{selectedRecord.requestNo || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">取样人</span><p>{selectedRecord.samplingPersonName || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">取样时间</span><p>{selectedRecord.samplingTime ? new Date(selectedRecord.samplingTime).toLocaleString() : '-'}</p></div>
                  <div><span className="text-sm text-slate-500">取样量</span><p>{selectedRecord.samplingQuantity} {selectedRecord.samplingUnit}</p></div>
                  <div><span className="text-sm text-slate-500">状态</span><p>{renderStatus(selectedRecord.status)}</p></div>
                  <div><span className="text-sm text-slate-500">取样地点</span><p>{selectedRecord.samplingLocation || '-'}</p></div>
                  <div><span className="text-sm text-slate-500">存放地点</span><p>{selectedRecord.storageLocation || '-'}</p></div>
                  <div className="col-span-2"><span className="text-sm text-slate-500">取样方法</span><p>{selectedRecord.samplingMethod || '-'}</p></div>
                  <div className="col-span-2"><span className="text-sm text-slate-500">备注</span><p>{selectedRecord.remark || '-'}</p></div>
                </div>
              </div>
              
              {selectedRecord.handoverRecords && selectedRecord.handoverRecords.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-slate-700 mb-4">交接记录</h3>
                  <div className="space-y-3">
                    {selectedRecord.handoverRecords.map((h: any) => (
                      <div key={h.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{handoverTypeMap[h.handoverType]}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${h.handoverStatus === 'completed' ? 'bg-green-100 text-green-700' : h.handoverStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {h.handoverStatus === 'completed' ? '已完成' : h.handoverStatus === 'rejected' ? '已拒收' : '待接收'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-slate-500">移交人:</span> {h.fromPersonName}</div>
                          <div><span className="text-slate-500">接收人:</span> {h.toPersonName}</div>
                          <div><span className="text-slate-500">交接时间:</span> {new Date(h.handoverTime).toLocaleString()}</div>
                          {h.handoverQuantity && <div><span className="text-slate-500">交接数量:</span> {h.handoverQuantity}</div>}
                        </div>
                        {h.remark && <div className="text-sm mt-2"><span className="text-slate-500">备注:</span> {h.remark}</div>}
                        {h.handoverStatus === 'pending' && (
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => handleConfirmHandover(h.id, 'completed')} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">确认接收</button>
                            <button onClick={() => handleConfirmHandover(h.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">拒收</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.labelRecords && selectedRecord.labelRecords.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-slate-700 mb-4">标签打印记录</h3>
                  <div className="space-y-2">
                    {selectedRecord.labelRecords.map((l: any) => (
                      <div key={l.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span>打印次数: {l.printCount}</span>
                          <span>{l.printedByName} {l.printTime ? new Date(l.printTime).toLocaleString() : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">关闭</button>
            </div>
          </div>
        </div>
      )}

      {showSamplingModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">执行取样</h2>
              <button onClick={() => { setShowSamplingModal(false); resetSamplingForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">取样人 <span className="text-red-600">*</span></label>
                  <select
                    value={samplingForm.samplingPersonId}
                    onChange={(e) => setSamplingForm({ ...samplingForm, samplingPersonId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.realName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">取样时间 <span className="text-red-600">*</span></label>
                  <input type="datetime-local" value={samplingForm.samplingTime} onChange={(e) => setSamplingForm({ ...samplingForm, samplingTime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">取样量 <span className="text-red-600">*</span></label>
                    <input type="number" step="0.01" value={samplingForm.samplingQuantity} onChange={(e) => setSamplingForm({ ...samplingForm, samplingQuantity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                    <select value={samplingForm.samplingUnit} onChange={(e) => setSamplingForm({ ...samplingForm, samplingUnit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="mL">mL</option>
                      <option value="L">L</option>
                      <option value="个">个</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">取样地点</label>
                  <input type="text" value={samplingForm.samplingLocation} onChange={(e) => setSamplingForm({ ...samplingForm, samplingLocation: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">取样方法</label>
                <textarea value={samplingForm.samplingMethod} onChange={(e) => setSamplingForm({ ...samplingForm, samplingMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea value={samplingForm.remark} onChange={(e) => setSamplingForm({ ...samplingForm, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowSamplingModal(false); resetSamplingForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleSampling} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />确认取样</button>
            </div>
          </div>
        </div>
      )}

      {showHandoverModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">样品交接</h2>
              <button onClick={() => { setShowHandoverModal(false); resetHandoverForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">交接类型 <span className="text-red-600">*</span></label>
                  <select
                    value={handoverForm.handoverType}
                    onChange={(e) => setHandoverForm({ ...handoverForm, handoverType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    {Object.entries(handoverTypeMap).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">交接时间 <span className="text-red-600">*</span></label>
                  <input type="datetime-local" value={handoverForm.handoverTime} onChange={(e) => setHandoverForm({ ...handoverForm, handoverTime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">移交人 <span className="text-red-600">*</span></label>
                  <select
                    value={handoverForm.fromPersonId}
                    onChange={(e) => setHandoverForm({ ...handoverForm, fromPersonId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.realName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">接收人 <span className="text-red-600">*</span></label>
                  <select
                    value={handoverForm.toPersonId}
                    onChange={(e) => setHandoverForm({ ...handoverForm, toPersonId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">请选择</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.realName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">交接数量</label>
                  <input type="number" step="0.01" value={handoverForm.handoverQuantity} onChange={(e) => setHandoverForm({ ...handoverForm, handoverQuantity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea value={handoverForm.remark} onChange={(e) => setHandoverForm({ ...handoverForm, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowHandoverModal(false); resetHandoverForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleHandover} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />确认交接</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
