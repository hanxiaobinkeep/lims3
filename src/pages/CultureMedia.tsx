import { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Search,
  FlaskConical,
  ClipboardCheck,
  Beaker,
  Thermometer,
  HandHelping,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  getCultureMediaList,
  createCultureMedia,
  updateCultureMedia,
  deleteCultureMedia,
  getAcceptanceRecords,
  createAcceptanceRecord,
  updateAcceptanceRecord,
  deleteAcceptanceRecord,
  getPreparationRecords,
  createPreparationRecord,
  updatePreparationRecord,
  deletePreparationRecord,
  confirmSterilization,
  getPreIncubationRecords,
  createPreIncubationRecord,
  updatePreIncubationRecord,
  deletePreIncubationRecord,
  confirmSterilityResult,
  getUsageRecords,
  createUsageRecord,
  updateUsageRecord,
  deleteUsageRecord,
  getInactivationRecords,
  createInactivationRecord,
  updateInactivationRecord,
  deleteInactivationRecord,
  verifyInactivation
} from '../services/cultureMedia';

const mediaTypeMap: Record<string, string> = {
  liquid: '液体培养基',
  solid: '固体培养基',
  semiSolid: '半固体培养基',
  selective: '选择性培养基',
  differential: '鉴别培养基',
  enriched: '增菌培养基',
  other: '其他'
};

const statusMap: Record<string, { text: string; class: string }> = {
  active: { text: '可用', class: 'bg-green-100 text-green-700' },
  inactive: { text: '停用', class: 'bg-gray-100 text-gray-700' },
  pending: { text: '待验收', class: 'bg-yellow-100 text-yellow-700' },
  qualified: { text: '合格', class: 'bg-green-100 text-green-700' },
  unqualified: { text: '不合格', class: 'bg-red-100 text-red-700' }
};

const acceptanceResultMap: Record<string, { text: string; class: string }> = {
  pass: { text: '通过', class: 'bg-green-100 text-green-700' },
  fail: { text: '不通过', class: 'bg-red-100 text-red-700' },
  pending: { text: '待检', class: 'bg-yellow-100 text-yellow-700' }
};

const sterilizationStatusMap: Record<string, { text: string; class: string }> = {
  pending: { text: '待灭菌', class: 'bg-yellow-100 text-yellow-700' },
  done: { text: '已灭菌', class: 'bg-green-100 text-green-700' }
};

const sterilityResultMap: Record<string, { text: string; class: string }> = {
  pass: { text: '无菌', class: 'bg-green-100 text-green-700' },
  fail: { text: '有菌', class: 'bg-red-100 text-red-700' },
  pending: { text: '待判读', class: 'bg-yellow-100 text-yellow-700' }
};

const inactivationStatusMap: Record<string, { text: string; class: string }> = {
  pending: { text: '待灭活', class: 'bg-yellow-100 text-yellow-700' },
  done: { text: '已灭活', class: 'bg-green-100 text-green-700' },
  verified: { text: '已确认', class: 'bg-blue-100 text-blue-700' }
};

type TabKey = 'media' | 'acceptance' | 'preparation' | 'preincubation' | 'usage' | 'inactivation';

export default function CultureMediaPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('media');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [cultureMediaList, setCultureMediaList] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filters, setFilters] = useState({ keyword: '', status: '' });

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setPage(1);
    setFilters({ keyword: '', status: '' });
  }, [activeTab]);

  useEffect(() => {
    loadData();
    if (activeTab !== 'media') {
      loadCultureMediaList();
    }
  }, [activeTab, page, filters]);

  const loadCultureMediaList = async () => {
    try {
      const res: any = await getCultureMediaList({ pageSize: 1000 });
      if (res?.code === 200) {
        setCultureMediaList(res.data.list || []);
      }
    } catch (error) {
      console.error('加载培养基列表失败:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let res: any;
      const params = { page, pageSize: 20, ...filters };
      switch (activeTab) {
        case 'media':
          res = await getCultureMediaList(params);
          break;
        case 'acceptance':
          res = await getAcceptanceRecords(params);
          break;
        case 'preparation':
          res = await getPreparationRecords(params);
          break;
        case 'preincubation':
          res = await getPreIncubationRecords(params);
          break;
        case 'usage':
          res = await getUsageRecords(params);
          break;
        case 'inactivation':
          res = await getInactivationRecords(params);
          break;
      }
      if (res?.code === 200) {
        setItems(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformForm = (formData: any, tab: TabKey) => {
    switch (tab) {
      case 'media':
        return {
          mediaCode: formData.mediaCode,
          mediaName: formData.mediaName,
          mediaType: formData.mediaType,
          manufacturer: formData.supplierName || formData.manufacturer,
          batchNo: formData.batchNo,
          specification: formData.specification,
          quantity: formData.quantity,
          unit: formData.unit || 'g',
          storageCondition: formData.storageCondition,
          expiryDate: formData.expiryDate,
          status: formData.status === 'active' ? 'in_stock' : (formData.status === 'inactive' ? 'disposed' : formData.status),
          remark: formData.remark
        };
      case 'acceptance':
        return {
          mediaId: formData.mediaId,
          acceptanceDate: formData.acceptanceDate,
          acceptanceResult: formData.acceptanceResult,
          appearanceCheck: formData.appearanceCheck,
          sterilityCheck: formData.sterilityCheck,
          growthTest: formData.growthTest,
          remark: formData.remark
        };
      case 'preparation':
        return {
          mediaId: formData.mediaId,
          preparationDate: formData.preparationDate,
          preparedQuantity: formData.preparationVolume || formData.preparedQuantity,
          unit: formData.volumeUnit || formData.unit || 'mL',
          sterilizationMethod: formData.sterilizationMethod || 'autoclave',
          sterilizationTemp: formData.sterilizationTemp,
          sterilizationDuration: formData.sterilizationDuration,
          phValue: formData.phValue,
          remark: formData.remark
        };
      case 'preincubation':
        return {
          preparationId: formData.preparationId || formData.mediaId,
          incubatorId: formData.incubatorId,
          incubatorModel: formData.incubatorModel,
          incubationTemp: formData.incubationTemp,
          incubationStart: formData.startDate || formData.incubationStart,
          incubationEnd: formData.endDate || formData.incubationEnd,
          incubationDuration: formData.incubationDuration,
          remark: formData.remark
        };
      case 'usage':
        return {
          preparationId: formData.preparationId || formData.mediaId,
          usedQuantity: formData.usageQuantity || formData.usedQuantity,
          unit: formData.unit || 'mL',
          usedDate: formData.usageDate || formData.usedDate,
          purpose: formData.usagePurpose || formData.purpose,
          testSampleNo: formData.testSampleNo,
          remark: formData.remark
        };
      case 'inactivation':
        return {
          preparationId: formData.preparationId || formData.mediaId,
          inactivationDate: formData.inactivationDate,
          inactivationMethod: formData.inactivationMethod || 'autoclave',
          inactivationTemp: formData.inactivationTemp,
          inactivationDuration: formData.inactivationDuration,
          remark: formData.remark
        };
      default:
        return formData;
    }
  };

  const handleSave = async () => {
    try {
      let res: any;
      const submitData = transformForm(form, activeTab);
      if (editingId) {
        switch (activeTab) {
          case 'media':
            res = await updateCultureMedia(editingId, submitData);
            break;
          case 'acceptance':
            res = await updateAcceptanceRecord(editingId, submitData);
            break;
          case 'preparation':
            res = await updatePreparationRecord(editingId, submitData);
            break;
          case 'preincubation':
            res = await updatePreIncubationRecord(editingId, submitData);
            break;
          case 'usage':
            res = await updateUsageRecord(editingId, submitData);
            break;
          case 'inactivation':
            res = await updateInactivationRecord(editingId, submitData);
            break;
        }
      } else {
        switch (activeTab) {
          case 'media':
            res = await createCultureMedia(submitData);
            break;
          case 'acceptance':
            res = await createAcceptanceRecord(submitData);
            break;
          case 'preparation':
            res = await createPreparationRecord(submitData);
            break;
          case 'preincubation':
            res = await createPreIncubationRecord(submitData);
            break;
          case 'usage':
            res = await createUsageRecord(submitData);
            break;
          case 'inactivation':
            res = await createInactivationRecord(submitData);
            break;
        }
      }
      if (res?.code === 200) {
        setShowModal(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该记录吗？')) return;
    try {
      let res: any;
      switch (activeTab) {
        case 'media':
          res = await deleteCultureMedia(id);
          break;
        case 'acceptance':
          res = await deleteAcceptanceRecord(id);
          break;
        case 'preparation':
          res = await deletePreparationRecord(id);
          break;
        case 'preincubation':
          res = await deletePreIncubationRecord(id);
          break;
        case 'usage':
          res = await deleteUsageRecord(id);
          break;
        case 'inactivation':
          res = await deleteInactivationRecord(id);
          break;
      }
      if (res?.code === 200) {
        loadData();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleConfirmSterilization = async (id: number) => {
    const sterilizationTemp = prompt('请输入灭菌温度:');
    if (sterilizationTemp === null) return;
    const sterilizationTime = prompt('请输入灭菌时间(分钟):');
    if (sterilizationTime === null) return;
    try {
      const res: any = await confirmSterilization(id, {
        sterilizationTemp: sterilizationTemp ? parseFloat(sterilizationTemp) : null,
        sterilizationTime: sterilizationTime ? parseFloat(sterilizationTime) : null
      });
      if (res?.code === 200) {
        loadData();
      }
    } catch (error) {
      console.error('确认灭菌失败:', error);
    }
  };

  const handleConfirmSterility = async (id: number) => {
    const result = confirm('预培养结果是否无菌？\n确定=无菌，取消=有菌');
    try {
      const res: any = await confirmSterilityResult(id, {
        sterilityResult: result ? 'pass' : 'fail'
      });
      if (res?.code === 200) {
        loadData();
      }
    } catch (error) {
      console.error('确认无菌结果失败:', error);
    }
  };

  const handleVerifyInactivation = async (id: number) => {
    if (!confirm('确认该灭活记录已核验通过？')) return;
    try {
      const res: any = await verifyInactivation(id, { verifyStatus: 'verified' });
      if (res?.code === 200) {
        loadData();
      }
    } catch (error) {
      console.error('核验灭活失败:', error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ ...item });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const tabs = [
    { key: 'media' as TabKey, label: '培养基信息', icon: FlaskConical },
    { key: 'acceptance' as TabKey, label: '验收记录', icon: ClipboardCheck },
    { key: 'preparation' as TabKey, label: '配制记录', icon: Beaker },
    { key: 'preincubation' as TabKey, label: '预培养记录', icon: Thermometer },
    { key: 'usage' as TabKey, label: '领用记录', icon: HandHelping },
    { key: 'inactivation' as TabKey, label: '灭活记录', icon: Flame }
  ];

  const renderTable = () => {
    if (loading) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="p-8 text-center text-slate-400">
          <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无数据</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>{getTableHeaders()}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                {getTableCells(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'media':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">编码</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">名称</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">规格</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">供应商</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
          </>
        );
      case 'acceptance':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">培养基</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">批号</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">验收日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">验收数量</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">验收人</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">结果</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
          </>
        );
      case 'preparation':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">培养基</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制批号</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制量</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制人</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">灭菌状态</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
          </>
        );
      case 'preincubation':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">培养基</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制批号</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">开始日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">结束日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">培养条件</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">无菌结果</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
          </>
        );
      case 'usage':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">培养基</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制批号</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">领用日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">领用数量</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">领用人</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">用途</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
          </>
        );
      case 'inactivation':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">培养基</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">配制批号</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">灭活日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">灭活方式</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">灭活人</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
          </>
        );
    }
  };

  const getTableCells = (item: any) => {
    switch (activeTab) {
      case 'media':
        return (
          <>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.mediaCode}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.mediaName}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{mediaTypeMap[item.mediaType] || item.mediaType}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.specification || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.supplierName || '-'}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${statusMap[item.status]?.class || 'bg-gray-100 text-gray-700'}`}>
                {statusMap[item.status]?.text || item.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(item)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </>
        );
      case 'acceptance':
        return (
          <>
            <td className="px-6 py-4 text-sm text-slate-800">{item.mediaName || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.batchNo || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.acceptanceDate || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.quantity || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.acceptanceByName || '-'}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${acceptanceResultMap[item.acceptanceResult]?.class || 'bg-gray-100 text-gray-700'}`}>
                {acceptanceResultMap[item.acceptanceResult]?.text || item.acceptanceResult}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(item)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </>
        );
      case 'preparation':
        return (
          <>
            <td className="px-6 py-4 text-sm text-slate-800">{item.mediaName || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparationBatchNo || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparationDate || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparationVolume ? `${item.preparationVolume} ${item.volumeUnit || ''}` : '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparedByName || '-'}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${sterilizationStatusMap[item.sterilizationStatus]?.class || 'bg-gray-100 text-gray-700'}`}>
                {sterilizationStatusMap[item.sterilizationStatus]?.text || item.sterilizationStatus}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                {item.sterilizationStatus === 'pending' && (
                  <button onClick={() => handleConfirmSterilization(item.id)} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded hover:bg-teal-200" title="确认灭菌">灭菌</button>
                )}
                <button onClick={() => handleEdit(item)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </>
        );
      case 'preincubation':
        return (
          <>
            <td className="px-6 py-4 text-sm text-slate-800">{item.mediaName || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparationBatchNo || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.startDate || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.endDate || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.incubationCondition || '-'}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${sterilityResultMap[item.sterilityResult]?.class || 'bg-gray-100 text-gray-700'}`}>
                {sterilityResultMap[item.sterilityResult]?.text || item.sterilityResult}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                {item.sterilityResult === 'pending' && (
                  <button onClick={() => handleConfirmSterility(item.id)} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded hover:bg-teal-200" title="确认无菌结果">判读</button>
                )}
                <button onClick={() => handleEdit(item)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </>
        );
      case 'usage':
        return (
          <>
            <td className="px-6 py-4 text-sm text-slate-800">{item.mediaName || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparationBatchNo || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.usageDate || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.usageQuantity || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.usedByName || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.usagePurpose || '-'}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(item)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </>
        );
      case 'inactivation':
        return (
          <>
            <td className="px-6 py-4 text-sm text-slate-800">{item.mediaName || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.preparationBatchNo || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.inactivationDate || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.inactivationMethod || '-'}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.inactivatedByName || '-'}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${inactivationStatusMap[item.inactivationStatus]?.class || 'bg-gray-100 text-gray-700'}`}>
                {inactivationStatusMap[item.inactivationStatus]?.text || item.inactivationStatus}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                {item.inactivationStatus === 'done' && (
                  <button onClick={() => handleVerifyInactivation(item.id)} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200" title="核验"><CheckCircle2 className="w-3 h-3 inline" /> 核验</button>
                )}
                <button onClick={() => handleEdit(item)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </>
        );
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'media':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">培养基编码 <span className="text-red-600">*</span></label>
                <input type="text" value={form.mediaCode || ''} onChange={(e) => setForm({ ...form, mediaCode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：TSA-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">培养基名称 <span className="text-red-600">*</span></label>
                <input type="text" value={form.mediaName || ''} onChange={(e) => setForm({ ...form, mediaName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：胰酪大豆胨琼脂培养基" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
                <select value={form.mediaType || 'other'} onChange={(e) => setForm({ ...form, mediaType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  {Object.entries(mediaTypeMap).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">规格</label>
                <input type="text" value={form.specification || ''} onChange={(e) => setForm({ ...form, specification: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：250g/瓶" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">供应商</label>
                <input type="text" value={form.supplierName || ''} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  {Object.entries(statusMap).map(([key, value]) => (
                    <option key={key} value={key}>{value.text}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
            </div>
          </>
        );
      case 'acceptance':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">培养基 <span className="text-red-600">*</span></label>
              <select value={form.mediaId || ''} onChange={(e) => setForm({ ...form, mediaId: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">请选择</option>
                {cultureMediaList.map(m => (
                  <option key={m.id} value={m.id}>{m.mediaName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">批号 <span className="text-red-600">*</span></label>
                <input type="text" value={form.batchNo || ''} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">验收日期</label>
                <input type="date" value={form.acceptanceDate || ''} onChange={(e) => setForm({ ...form, acceptanceDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">验收数量</label>
                <input type="number" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: e.target.value ? Number(e.target.value) : '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">验收结果</label>
                <select value={form.acceptanceResult || 'pending'} onChange={(e) => setForm({ ...form, acceptanceResult: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  {Object.entries(acceptanceResultMap).map(([key, value]) => (
                    <option key={key} value={key}>{value.text}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
            </div>
          </>
        );
      case 'preparation':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">培养基 <span className="text-red-600">*</span></label>
              <select value={form.mediaId || ''} onChange={(e) => setForm({ ...form, mediaId: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">请选择</option>
                {cultureMediaList.map(m => (
                  <option key={m.id} value={m.id}>{m.mediaName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">配制批号 <span className="text-red-600">*</span></label>
                <input type="text" value={form.preparationBatchNo || ''} onChange={(e) => setForm({ ...form, preparationBatchNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">配制日期</label>
                <input type="date" value={form.preparationDate || ''} onChange={(e) => setForm({ ...form, preparationDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">配制量</label>
                <input type="number" step="0.01" value={form.preparationVolume || ''} onChange={(e) => setForm({ ...form, preparationVolume: e.target.value ? parseFloat(e.target.value) : '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                <select value={form.volumeUnit || 'mL'} onChange={(e) => setForm({ ...form, volumeUnit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
            </div>
          </>
        );
      case 'preincubation':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">培养基 <span className="text-red-600">*</span></label>
              <select value={form.mediaId || ''} onChange={(e) => setForm({ ...form, mediaId: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">请选择</option>
                {cultureMediaList.map(m => (
                  <option key={m.id} value={m.id}>{m.mediaName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">配制批号 <span className="text-red-600">*</span></label>
              <input type="text" value={form.preparationBatchNo || ''} onChange={(e) => setForm({ ...form, preparationBatchNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
                <input type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
                <input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">培养条件</label>
              <input type="text" value={form.incubationCondition || ''} onChange={(e) => setForm({ ...form, incubationCondition: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：30-35℃，5天" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
            </div>
          </>
        );
      case 'usage':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">培养基 <span className="text-red-600">*</span></label>
              <select value={form.mediaId || ''} onChange={(e) => setForm({ ...form, mediaId: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">请选择</option>
                {cultureMediaList.map(m => (
                  <option key={m.id} value={m.id}>{m.mediaName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">配制批号 <span className="text-red-600">*</span></label>
              <input type="text" value={form.preparationBatchNo || ''} onChange={(e) => setForm({ ...form, preparationBatchNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">领用日期</label>
                <input type="date" value={form.usageDate || ''} onChange={(e) => setForm({ ...form, usageDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">领用数量</label>
                <input type="number" value={form.usageQuantity || ''} onChange={(e) => setForm({ ...form, usageQuantity: e.target.value ? Number(e.target.value) : '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">用途</label>
              <input type="text" value={form.usagePurpose || ''} onChange={(e) => setForm({ ...form, usagePurpose: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：微生物限度检查" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
            </div>
          </>
        );
      case 'inactivation':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">培养基 <span className="text-red-600">*</span></label>
              <select value={form.mediaId || ''} onChange={(e) => setForm({ ...form, mediaId: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">请选择</option>
                {cultureMediaList.map(m => (
                  <option key={m.id} value={m.id}>{m.mediaName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">配制批号 <span className="text-red-600">*</span></label>
              <input type="text" value={form.preparationBatchNo || ''} onChange={(e) => setForm({ ...form, preparationBatchNo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">灭活日期</label>
                <input type="date" value={form.inactivationDate || ''} onChange={(e) => setForm({ ...form, inactivationDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">灭活方式</label>
                <select value={form.inactivationMethod || ''} onChange={(e) => setForm({ ...form, inactivationMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="">请选择</option>
                  <option value="autoclave">高压蒸汽灭菌</option>
                  <option value="incineration">焚烧</option>
                  <option value="chemical">化学灭活</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
            </div>
          </>
        );
    }
  };

  const getModalTitle = () => {
    const action = editingId ? '编辑' : '新增';
    const titles: Record<TabKey, string> = {
      media: '培养基信息',
      acceptance: '验收记录',
      preparation: '配制记录',
      preincubation: '预培养记录',
      usage: '领用记录',
      inactivation: '灭活记录'
    };
    return `${action}${titles[activeTab]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">培养基管理</h1>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === tab.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索关键词..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
          {activeTab === 'media' && (
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
          )}
          <button
            onClick={() => { setFilters({ keyword: '', status: '' }); setPage(1); }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            重置
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {renderTable()}

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
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{getModalTitle()}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {renderFormFields()}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
