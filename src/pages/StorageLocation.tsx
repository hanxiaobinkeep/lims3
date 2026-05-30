import { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Warehouse,
  Package,
  ArrowRightLeft,
  BarChart3,
  Search,
  MapPin
} from 'lucide-react';
import {
  getList,
  getById,
  create,
  update,
  remove,
  getRooms,
  getStats,
  getStorageRecords,
  storeSample,
  retrieveSample
} from '../services/storageLocation';
import { getList as getSamples } from '../services/sample';

const locationTypeMap: Record<string, string> = {
  raw: '原料留样',
  finished: '成品留样',
  stability: '稳定性样品',
  environmental: '环境样品',
  other: '其他'
};

const statusMap: Record<string, { text: string; class: string }> = {
  active: { text: '可用', class: 'bg-green-100 text-green-700' },
  full: { text: '已满', class: 'bg-red-100 text-red-700' },
  maintenance: { text: '维护中', class: 'bg-yellow-100 text-yellow-700' },
  inactive: { text: '停用', class: 'bg-gray-100 text-gray-700' }
};

const storageStatusMap: Record<string, { text: string; class: string }> = {
  stored: { text: '在库', class: 'bg-blue-100 text-blue-700' },
  retrieved: { text: '已出库', class: 'bg-gray-100 text-gray-700' },
  expired: { text: '已过期', class: 'bg-red-100 text-red-700' }
};

export default function StorageLocationPage() {
  const [activeTab, setActiveTab] = useState<'locations' | 'records' | 'stats'>('locations');
  const [locations, setLocations] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    room: '',
    locationType: '',
    status: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    room: '',
    cabinet: '',
    shelf: '',
    box: '',
    locationType: 'other',
    capacity: '1',
    temperature: '',
    humidity: '',
    remark: ''
  });

  const [storeForm, setStoreForm] = useState({
    sampleId: '',
    locationId: '',
    storageType: 'other',
    quantity: '',
    unit: 'g',
    remark: ''
  });

  useEffect(() => {
    loadRooms();
    if (activeTab === 'locations') {
      loadLocations();
    } else if (activeTab === 'records') {
      loadRecords();
    } else if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab, page, filters]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res: any = await getList({ page, pageSize: 20, ...filters });
      if (res?.code === 200) {
        setLocations(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('加载存样地点失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res: any = await getStorageRecords({ page, pageSize: 20 });
      if (res?.code === 200) {
        setRecords(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('加载存样记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res: any = await getStats();
      if (res?.code === 200) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const res: any = await getRooms();
      if (res?.code === 200) {
        setRooms(res.data);
      }
    } catch (error) {
      console.error('加载房间列表失败:', error);
    }
  };

  const loadSamples = async () => {
    try {
      const res: any = await getSamples({ pageSize: 100 });
      if (res?.code === 200) {
        setSamples(res.data.list);
      }
    } catch (error) {
      console.error('加载样品列表失败:', error);
    }
  };

  const handleSave = async () => {
    if (!form.room || !form.cabinet || !form.shelf || !form.box) {
      alert('请填写完整的位置信息');
      return;
    }
    try {
      const data = {
        ...form,
        capacity: Number(form.capacity)
      };
      if (editingId) {
        await update(editingId, data);
      } else {
        await create(data);
      }
      setShowModal(false);
      resetForm();
      loadLocations();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleStore = async () => {
    if (!storeForm.sampleId || !storeForm.locationId) {
      alert('请选择样品和存样地点');
      return;
    }
    try {
      await storeSample({
        sampleId: Number(storeForm.sampleId),
        locationId: Number(storeForm.locationId),
        storageType: storeForm.storageType,
        quantity: storeForm.quantity ? parseFloat(storeForm.quantity) : null,
        unit: storeForm.unit,
        remark: storeForm.remark
      });
      setShowStoreModal(false);
      resetStoreForm();
      loadRecords();
      if (activeTab === 'locations') loadLocations();
    } catch (error) {
      console.error('入库失败:', error);
    }
  };

  const handleRetrieve = async (id: number) => {
    if (!confirm('确定要出库吗？')) return;
    try {
      await retrieveSample(id, '手动出库');
      loadRecords();
      if (activeTab === 'locations') loadLocations();
    } catch (error) {
      console.error('出库失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个存样地点吗？')) return;
    try {
      await remove(id);
      loadLocations();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleEdit = (location: any) => {
    setEditingId(location.id);
    setForm({
      room: location.room,
      cabinet: location.cabinet,
      shelf: location.shelf,
      box: location.box,
      locationType: location.location_type,
      capacity: String(location.capacity),
      temperature: location.temperature || '',
      humidity: location.humidity || '',
      remark: location.remark || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      room: '',
      cabinet: '',
      shelf: '',
      box: '',
      locationType: 'other',
      capacity: '1',
      temperature: '',
      humidity: '',
      remark: ''
    });
  };

  const resetStoreForm = () => {
    setStoreForm({
      sampleId: '',
      locationId: '',
      storageType: 'other',
      quantity: '',
      unit: 'g',
      remark: ''
    });
  };

  const openStoreModal = () => {
    loadSamples();
    setShowStoreModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">存样地点管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'locations' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <Warehouse className="w-4 h-4" />
            存样地点
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'records' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <Package className="w-4 h-4" />
            存样记录
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'stats' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <BarChart3 className="w-4 h-4" />
            统计
          </button>
        </div>
      </div>

      {activeTab === 'locations' && (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索编码、房间、柜号..."
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={filters.room}
                  onChange={(e) => setFilters({ ...filters, room: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">全部房间</option>
                  {rooms.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={filters.locationType}
                  onChange={(e) => setFilters({ ...filters, locationType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">全部类型</option>
                  {Object.entries(locationTypeMap).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
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
                onClick={() => { setFilters({ keyword: '', room: '', locationType: '', status: '' }); setPage(1); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                重置
              </button>
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增地点
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
              </div>
            ) : locations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无存样地点</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">编码</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">位置</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">容量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">环境条件</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {locations.map(location => (
                      <tr key={location.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{location.location_code}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-600" />
                            {location.room} / {location.cabinet} / {location.shelf} / {location.box}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{locationTypeMap[location.location_type] || location.location_type}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full ${location.current_count >= location.capacity ? 'bg-red-500' : 'bg-teal-500'}`}
                              style={{ width: `${Math.min((location.current_count / location.capacity) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{location.current_count}/{location.capacity}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {location.temperature && <span>{location.temperature}</span>}
                          {location.humidity && <span> / {location.humidity}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusMap[location.status]?.class || 'bg-gray-100 text-gray-700'}`}>
                            {statusMap[location.status]?.text || location.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(location)}
                              className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(location.id)}
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
        </>
      )}

      {activeTab === 'records' && (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">存样记录</h2>
              <button
                onClick={openStoreModal}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                样品入库
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
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无存样记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">存放位置</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">存放人/时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-slate-800">{record.sample_no}</div>
                          <div className="text-slate-500">{record.sample_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-600" />
                            {record.room} / {record.cabinet} / {record.shelf} / {record.box}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {record.quantity ? `${record.quantity} ${record.unit}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div>{record.stored_by_name || '-'}</div>
                          <div className="text-xs text-slate-400">
                            {record.stored_at ? new Date(record.stored_at).toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${storageStatusMap[record.status]?.class || 'bg-gray-100 text-gray-700'}`}>
                            {storageStatusMap[record.status]?.text || record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {record.status === 'stored' && (
                            <button
                              onClick={() => handleRetrieve(record.id)}
                              className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded hover:bg-orange-200"
                            >
                              出库
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">总体概览</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">总存样地点</span>
                <span className="text-2xl font-bold text-teal-600">{stats.overview?.total_locations || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">可用</span>
                <span className="text-lg font-semibold text-green-600">{stats.overview?.active_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">已满</span>
                <span className="text-lg font-semibold text-red-600">{stats.overview?.full_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">维护中</span>
                <span className="text-lg font-semibold text-yellow-600">{stats.overview?.maintenance_count || 0}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">已存放/总容量</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats.overview?.total_stored || 0} / {stats.overview?.total_capacity || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full"
                    style={{ width: `${stats.overview?.total_capacity ? (stats.overview.total_stored / stats.overview.total_capacity) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">按类型统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.byType?.map((type: any) => (
                <div key={type.location_type} className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-500 mb-1">{locationTypeMap[type.location_type] || type.location_type}</div>
                  <div className="text-2xl font-bold text-teal-600">{type.count}</div>
                  <div className="text-xs text-slate-400 mt-1">已存放: {type.stored_count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 新增/编辑存样地点弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? '编辑存样地点' : '新增存样地点'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">房间 <span className="text-red-600">*</span></label>
                  <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：留样室A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">柜号 <span className="text-red-600">*</span></label>
                  <input type="text" value={form.cabinet} onChange={(e) => setForm({ ...form, cabinet: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：A01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">层号 <span className="text-red-600">*</span></label>
                  <input type="text" value={form.shelf} onChange={(e) => setForm({ ...form, shelf: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">格子/盒号 <span className="text-red-600">*</span></label>
                  <input type="text" value={form.box} onChange={(e) => setForm({ ...form, box: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">存样类型</label>
                  <select value={form.locationType} onChange={(e) => setForm({ ...form, locationType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                    {Object.entries(locationTypeMap).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">容量</label>
                  <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">温度条件</label>
                  <input type="text" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：常温" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">湿度条件</label>
                  <input type="text" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：≤60%RH" />
                </div>
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

      {/* 样品入库弹窗 */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">样品入库</h2>
              <button onClick={() => { setShowStoreModal(false); resetStoreForm(); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">样品 <span className="text-red-600">*</span></label>
                <select
                  value={storeForm.sampleId}
                  onChange={(e) => setStoreForm({ ...storeForm, sampleId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">请选择</option>
                  {samples.map(s => (
                    <option key={s.id} value={s.id}>{s.sample_no} - {s.sample_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">存样地点 <span className="text-red-600">*</span></label>
                <select
                  value={storeForm.locationId}
                  onChange={(e) => setStoreForm({ ...storeForm, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">请选择</option>
                  {locations.filter(l => l.status === 'active').map(l => (
                    <option key={l.id} value={l.id}>
                      {l.location_code} - {l.room}/{l.cabinet}/{l.shelf}/{l.box} ({l.current_count}/{l.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">数量</label>
                  <input type="number" step="0.01" value={storeForm.quantity} onChange={(e) => setStoreForm({ ...storeForm, quantity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                  <select value={storeForm.unit} onChange={(e) => setStoreForm({ ...storeForm, unit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="mL">mL</option>
                    <option value="L">L</option>
                    <option value="个">个</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea value={storeForm.remark} onChange={(e) => setStoreForm({ ...storeForm, remark: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={2} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowStoreModal(false); resetStoreForm(); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleStore} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" />确认入库</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
