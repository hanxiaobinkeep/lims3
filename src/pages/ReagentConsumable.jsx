import React, { useState, useEffect } from 'react';
import {
  getReagentList,
  getReagentById,
  createReagent,
  updateReagent,
  deleteReagent,
  addReagentIn,
  addReagentOut,
  addReagentReturn,
  getSolutionList,
  createSolution,
  getReagentAlerts
} from '../services/reagent_consumable.js';

const ReagentConsumable = () => {
  const [activeTab, setActiveTab] = useState('reagents');
  const [reagents, setReagents] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [currentReagent, setCurrentReagent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    is_hazardous: ''
  });
  const [solutionFilters, setSolutionFilters] = useState({
    keyword: '',
    solution_type: ''
  });

  useEffect(() => {
    loadReagents();
    loadAlerts();
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'solutions') {
      loadSolutions();
    }
  }, [activeTab, solutionFilters]);

  const loadReagents = async () => {
    try {
      const response = await getReagentList(filters);
      setReagents(response.data.list);
    } catch (error) {
      console.error('加载试剂列表失败:', error);
    }
  };

  const loadSolutions = async () => {
    try {
      const response = await getSolutionList(solutionFilters);
      setSolutions(response.data.list);
    } catch (error) {
      console.error('加载溶液列表失败:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await getReagentAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('加载预警信息失败:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await getReagentById(id);
      setCurrentReagent(response.data);
      setModalType('view');
      setShowModal(true);
    } catch (error) {
      console.error('获取试剂详情失败:', error);
    }
  };

  const handleCreate = () => {
    setCurrentReagent(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setCurrentReagent(item);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await deleteReagent(id);
      alert('删除成功');
      loadReagents();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (modalType === 'create') {
        await createReagent(data);
      } else if (modalType === 'edit') {
        await updateReagent(currentReagent.id, data);
      } else if (modalType === 'in') {
        await addReagentIn(currentReagent.id, data);
      } else if (modalType === 'out') {
        await addReagentOut(currentReagent.id, data);
      } else if (modalType === 'return') {
        await addReagentReturn(currentReagent.id, data);
      } else if (modalType === 'solution') {
        await createSolution(data);
      }
      setShowModal(false);
      alert('操作成功');
      loadReagents();
      if (activeTab === 'solutions') loadSolutions();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">试剂耗材管理</h1>
        <p className="text-gray-600 mt-1">管理实验室试剂、耗材和溶液配制</p>
      </div>

      {(alerts.expiry_reagents?.length > 0 || alerts.low_stock_reagents?.length > 0 || alerts.expiry_solutions?.length > 0) && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <h3 className="font-semibold text-yellow-800 mb-3">⚠️ 预警提醒</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.expiry_reagents?.length > 0 && (
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-red-600 font-semibold">
                  试剂即将过期: {alerts.expiry_reagents.length} 种
                </p>
              </div>
            )}
            {alerts.low_stock_reagents?.length > 0 && (
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-orange-600 font-semibold">
                  低库存试剂: {alerts.low_stock_reagents.length} 种
                </p>
              </div>
            )}
            {alerts.expiry_solutions?.length > 0 && (
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-red-600 font-semibold">
                  溶液即将过期: {alerts.expiry_solutions.length} 种
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('reagents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reagents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              试剂列表
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'solutions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              溶液配制
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'reagents' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索试剂名称、编码或CAS号"
                  value={filters.keyword}
                  onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                  className="px-4 py-2 border rounded-lg flex-1 min-w-64"
                />
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">全部分类</option>
                  <option value="有机溶剂">有机溶剂</option>
                  <option value="无机试剂">无机试剂</option>
                  <option value="指示剂">指示剂</option>
                </select>
                <select
                  value={filters.is_hazardous}
                  onChange={(e) => setFilters({...filters, is_hazardous: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">全部</option>
                  <option value="true">危险品</option>
                  <option value="false">非危险品</option>
                </select>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + 新增试剂
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">编码</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">试剂名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">规格</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">库存</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reagents.map((reagent) => (
                      <tr key={reagent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{reagent.reagent_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reagent.reagent_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reagent.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reagent.specification}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            reagent.minimum_stock && reagent.current_stock <= reagent.minimum_stock
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            {reagent.current_stock} {reagent.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {reagent.is_hazardous && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">危险品</span>
                            )}
                            {reagent.is_controlled && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">管制</span>
                            )}
                            {!reagent.is_hazardous && !reagent.is_controlled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">普通</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button onClick={() => handleView(reagent.id)} className="text-blue-600 hover:text-blue-900">查看</button>
                          <button onClick={() => handleEdit(reagent)} className="text-green-600 hover:text-green-900">编辑</button>
                          <button onClick={() => {
                            setCurrentReagent(reagent);
                            setModalType('in');
                            setShowModal(true);
                          }} className="text-purple-600 hover:text-purple-900">入库</button>
                          <button onClick={() => {
                            setCurrentReagent(reagent);
                            setModalType('out');
                            setShowModal(true);
                          }} className="text-orange-600 hover:text-orange-900">领用</button>
                          <button onClick={() => handleDelete(reagent.id)} className="text-red-600 hover:text-red-900">删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'solutions' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索溶液名称"
                  value={solutionFilters.keyword}
                  onChange={(e) => setSolutionFilters({...solutionFilters, keyword: e.target.value})}
                  className="px-4 py-2 border rounded-lg flex-1 min-w-64"
                />
                <select
                  value={solutionFilters.solution_type}
                  onChange={(e) => setSolutionFilters({...solutionFilters, solution_type: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">全部类型</option>
                  <option value="试液">试液</option>
                  <option value="流动相">流动相</option>
                  <option value="滴定液">滴定液</option>
                </select>
                <button
                  onClick={() => {
                    setCurrentReagent(null);
                    setModalType('solution');
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + 新建配制
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">溶液名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浓度</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">配制日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">配制人</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {solutions.map((solution) => (
                      <tr key={solution.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{solution.solution_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solution.solution_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solution.concentration}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solution.preparation_date?.split('T')[0]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solution.expiry_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solution.prepared_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {solution.is_standard ? (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">标准溶液</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">普通</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ReagentModal
          type={modalType}
          reagent={currentReagent}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const ReagentModal = ({ type, reagent, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    reagent_code: '',
    reagent_name: '',
    category: '',
    specification: '',
    unit: '',
    brand: '',
    cas_number: '',
    grade: '',
    storage_condition: '',
    is_hazardous: false,
    is_controlled: false,
    safety_info: '',
    minimum_stock: 0,
    current_stock: 0,
    remark: '',
    batch_number: '',
    quantity: 0,
    receive_date: '',
    expiry_date: '',
    inspection_status: 'pending',
    purpose: '',
    out_date: '',
    user_id: '',
    solution_name: '',
    solution_type: '',
    formula: '',
    concentration: '',
    preparation_date: '',
    volume: 0,
    storage_location: '',
    is_standard: false
  });

  useEffect(() => {
    if (reagent && (type === 'edit' || type === 'view')) {
      setFormData({
        ...reagent,
        is_hazardous: !!reagent.is_hazardous,
        is_controlled: !!reagent.is_controlled
      });
    } else if (reagent && (type === 'in' || type === 'out' || type === 'return')) {
      setFormData(prev => ({
        ...prev,
        unit: reagent.unit
      }));
    }
  }, [reagent, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTitle = () => {
    switch (type) {
      case 'view': return '试剂详情';
      case 'create': return '新增试剂';
      case 'edit': return '编辑试剂';
      case 'in': return '试剂入库';
      case 'out': return '试剂领用';
      case 'return': return '试剂归还';
      case 'solution': return '溶液配制';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {(type === 'create' || type === 'edit' || type === 'view') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">试剂编码 *</label>
                <input
                  type="text"
                  value={formData.reagent_code}
                  onChange={(e) => setFormData({...formData, reagent_code: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">试剂名称 *</label>
                <input
                  type="text"
                  value={formData.reagent_name}
                  onChange={(e) => setFormData({...formData, reagent_name: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">请选择</option>
                  <option value="有机溶剂">有机溶剂</option>
                  <option value="无机试剂">无机试剂</option>
                  <option value="指示剂">指示剂</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">规格</label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({...formData, specification: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAS号</label>
                <input
                  type="text"
                  value={formData.cas_number}
                  onChange={(e) => setFormData({...formData, cas_number: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">级别</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
                <input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({...formData, minimum_stock: parseFloat(e.target.value)})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前库存</label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({...formData, current_stock: parseFloat(e.target.value)})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">存储条件</label>
                <input
                  type="text"
                  value={formData.storage_condition}
                  onChange={(e) => setFormData({...formData, storage_condition: e.target.value})}
                  disabled={type === 'view'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_hazardous}
                    onChange={(e) => setFormData({...formData, is_hazardous: e.target.checked})}
                    disabled={type === 'view'}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">危险品</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_controlled}
                    onChange={(e) => setFormData({...formData, is_controlled: e.target.checked})}
                    disabled={type === 'view'}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">管制药品</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">安全信息</label>
                <textarea
                  value={formData.safety_info}
                  onChange={(e) => setFormData({...formData, safety_info: e.target.value})}
                  disabled={type === 'view'}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  disabled={type === 'view'}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type === 'in' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">批号 *</label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量 *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">接收日期 *</label>
                <input
                  type="date"
                  value={formData.receive_date}
                  onChange={(e) => setFormData({...formData, receive_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">验收状态</label>
                <select
                  value={formData.inspection_status}
                  onChange={(e) => setFormData({...formData, inspection_status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pending">待验收</option>
                  <option value="completed">已验收</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type === 'out' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量 *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">用途 *</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">领用日期 *</label>
                <input
                  type="date"
                  value={formData.out_date}
                  onChange={(e) => setFormData({...formData, out_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type === 'solution' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">溶液名称 *</label>
                <input
                  type="text"
                  value={formData.solution_name}
                  onChange={(e) => setFormData({...formData, solution_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">溶液类型 *</label>
                <select
                  value={formData.solution_type}
                  onChange={(e) => setFormData({...formData, solution_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">请选择</option>
                  <option value="试液">试液</option>
                  <option value="流动相">流动相</option>
                  <option value="滴定液">滴定液</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">浓度</label>
                <input
                  type="text"
                  value={formData.concentration}
                  onChange={(e) => setFormData({...formData, concentration: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">配方 *</label>
                <textarea
                  value={formData.formula}
                  onChange={(e) => setFormData({...formData, formula: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">体积</label>
                <input
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData({...formData, volume: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">配制日期 *</label>
                <input
                  type="datetime-local"
                  value={formData.preparation_date}
                  onChange={(e) => setFormData({...formData, preparation_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">存放地点</label>
                <input
                  type="text"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({...formData, storage_location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_standard}
                    onChange={(e) => setFormData({...formData, is_standard: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">标准溶液</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type !== 'view' && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确认
              </button>
            </div>
          )}
          {type === 'view' && (
            <div className="flex justify-end mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReagentConsumable;
