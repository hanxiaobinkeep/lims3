import React, { useState, useEffect } from 'react';
import {
  getIntermediateCheckPlans,
  getIntermediateCheckPlanById,
  createIntermediateCheckPlan,
  updateIntermediateCheckPlan,
  addIntermediateCheckRecord,
  reviewIntermediateCheckRecord,
  getIntermediateCheckAlerts,
  resolveIntermediateCheckAlert,
  getIntermediateCheckStats
} from '../services/intermediateCheck.js';

const IntermediateCheck = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    status: ''
  });

  useEffect(() => {
    loadPlans();
    loadStats();
    loadAlerts();
  }, [filters]);

  const loadPlans = async () => {
    try {
      const response = await getIntermediateCheckPlans(filters);
      setPlans(response.data.list);
    } catch (error) {
      console.error('加载计划列表失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getIntermediateCheckStats();
      setStats(response.data);
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await getIntermediateCheckAlerts({ is_resolved: false });
      setAlerts(response.data.list);
    } catch (error) {
      console.error('加载预警信息失败:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await getIntermediateCheckPlanById(id);
      setCurrentPlan(response.data);
      setModalType('view');
      setShowModal(true);
    } catch (error) {
      console.error('获取计划详情失败:', error);
    }
  };

  const handleCreate = () => {
    setCurrentPlan(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setCurrentPlan(plan);
    setModalType('edit');
    setShowModal(true);
  };

  const handleAddRecord = (plan) => {
    setCurrentPlan(plan);
    setModalType('record');
    setShowModal(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (modalType === 'create') {
        await createIntermediateCheckPlan(data);
      } else if (modalType === 'edit') {
        await updateIntermediateCheckPlan(currentPlan.id, data);
      } else if (modalType === 'record') {
        await addIntermediateCheckRecord({ ...data, plan_id: currentPlan.id });
      }
      setShowModal(false);
      alert('操作成功');
      loadPlans();
      loadStats();
      loadAlerts();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await resolveIntermediateCheckAlert(id);
      alert('预警已处理');
      loadAlerts();
      loadStats();
    } catch (error) {
      console.error('处理预警失败:', error);
      alert('处理失败');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'planned': '计划中',
      'active': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'planned': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">期间核查管理</h1>
        <p className="text-gray-600 mt-1">管理仪器设备期间核查计划和记录</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">计划总数</h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.plan_stats?.reduce((sum, item) => sum + item.count, 0) || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">合格记录</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.conclusion_stats?.find(item => item.conclusion === '合格')?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">不合格记录</h3>
          <p className="text-2xl font-bold text-red-600">
            {stats.conclusion_stats?.find(item => item.conclusion === '不合格')?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">待处理预警</h3>
          <p className="text-2xl font-bold text-orange-600">
            {stats.alert_stats?.find(item => item.is_resolved === 0)?.count || 0}
          </p>
        </div>
      </div>

      {/* 预警提醒 */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <h3 className="font-semibold text-yellow-800 mb-3">⚠️ 核查预警</h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded">
                <div>
                  <p className="text-sm font-medium">{alert.plan_name} - {alert.instrument_name}</p>
                  <p className="text-xs text-gray-600">{alert.alert_content}</p>
                </div>
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  处理
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 即将到期的核查 */}
      {stats.upcoming_checks?.length > 0 && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-3">📅 即将到期的核查（30天内）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.upcoming_checks.map((check) => (
              <div key={check.id} className="bg-white p-3 rounded shadow">
                <p className="text-sm font-medium">{check.plan_name}</p>
                <p className="text-xs text-gray-600">下次核查: {check.next_check_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              核查计划
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              统计分析
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'plans' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索计划名称、编号或仪器"
                  value={filters.keyword}
                  onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                  className="px-4 py-2 border rounded-lg flex-1 min-w-64"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">全部状态</option>
                  <option value="planned">计划中</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + 新增计划
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">计划编号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">计划名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">仪器设备</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">核查项目</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">频率</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下次核查</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{plan.plan_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.plan_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.instrument_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.check_item}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.check_frequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.next_check_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button onClick={() => handleView(plan.id)} className="text-blue-600 hover:text-blue-900">查看</button>
                          <button onClick={() => handleEdit(plan)} className="text-green-600 hover:text-green-900">编辑</button>
                          <button onClick={() => handleAddRecord(plan)} className="text-purple-600 hover:text-purple-900">录入记录</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">计划状态分布</h3>
                  <div className="space-y-2">
                    {stats.plan_stats?.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{getStatusText(item.status)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / (stats.plan_stats?.reduce((sum, i) => sum + i.count, 0) || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">核查结论分布</h3>
                  <div className="space-y-2">
                    {stats.conclusion_stats?.map((item) => (
                      <div key={item.conclusion} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.conclusion}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.conclusion === '合格' ? 'bg-green-600' :
                                item.conclusion === '不合格' ? 'bg-red-600' : 'bg-gray-600'
                              }`}
                              style={{ width: `${(item.count / (stats.conclusion_stats?.reduce((sum, i) => sum + i.count, 0) || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <IntermediateCheckModal
          type={modalType}
          plan={currentPlan}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const IntermediateCheckModal = ({ type, plan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    plan_code: '',
    plan_name: '',
    instrument_id: '',
    instrument_name: '',
    instrument_code: '',
    check_item: '',
    check_method: '',
    check_frequency: '',
    check_criteria: '',
    tolerance_range: '',
    plan_date: '',
    next_check_date: '',
    remark: '',
    check_code: '',
    check_date: '',
    check_result: '',
    reference_value: '',
    conclusion: '',
    conclusion_comment: '',
    corrective_action: ''
  });

  useEffect(() => {
    if (plan && type === 'edit') {
      setFormData({
        ...plan,
        plan_date: plan.plan_date?.split('T')[0],
        next_check_date: plan.next_check_date?.split('T')[0]
      });
    }
  }, [plan, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTitle = () => {
    switch (type) {
      case 'create': return '新增期间核查计划';
      case 'edit': return '编辑期间核查计划';
      case 'view': return '计划详情';
      case 'record': return '录入核查记录';
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
          {(type === 'create' || type === 'edit') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">计划编号 *</label>
                <input
                  type="text"
                  value={formData.plan_code}
                  onChange={(e) => setFormData({...formData, plan_code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">计划名称 *</label>
                <input
                  type="text"
                  value={formData.plan_name}
                  onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">仪器设备名称</label>
                <input
                  type="text"
                  value={formData.instrument_name}
                  onChange={(e) => setFormData({...formData, instrument_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">仪器设备编号</label>
                <input
                  type="text"
                  value={formData.instrument_code}
                  onChange={(e) => setFormData({...formData, instrument_code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核查项目</label>
                <input
                  type="text"
                  value={formData.check_item}
                  onChange={(e) => setFormData({...formData, check_item: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核查方法</label>
                <input
                  type="text"
                  value={formData.check_method}
                  onChange={(e) => setFormData({...formData, check_method: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核查频率</label>
                <select
                  value={formData.check_frequency}
                  onChange={(e) => setFormData({...formData, check_frequency: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">请选择</option>
                  <option value="每周">每周</option>
                  <option value="每月">每月</option>
                  <option value="每季度">每季度</option>
                  <option value="每半年">每半年</option>
                  <option value="每年">每年</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">允差范围</label>
                <input
                  type="text"
                  value={formData.tolerance_range}
                  onChange={(e) => setFormData({...formData, tolerance_range: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">核查标准</label>
                <textarea
                  value={formData.check_criteria}
                  onChange={(e) => setFormData({...formData, check_criteria: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">计划日期</label>
                <input
                  type="date"
                  value={formData.plan_date}
                  onChange={(e) => setFormData({...formData, plan_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">下次核查日期</label>
                <input
                  type="date"
                  value={formData.next_check_date}
                  onChange={(e) => setFormData({...formData, next_check_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
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

          {type === 'record' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核查编号 *</label>
                <input
                  type="text"
                  value={formData.check_code}
                  onChange={(e) => setFormData({...formData, check_code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核查日期 *</label>
                <input
                  type="date"
                  value={formData.check_date}
                  onChange={(e) => setFormData({...formData, check_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核查结果 *</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.check_result}
                  onChange={(e) => setFormData({...formData, check_result: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参考值 *</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.reference_value}
                  onChange={(e) => setFormData({...formData, reference_value: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结论</label>
                <select
                  value={formData.conclusion}
                  onChange={(e) => setFormData({...formData, conclusion: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">请选择</option>
                  <option value="合格">合格</option>
                  <option value="不合格">不合格</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">结论说明</label>
                <textarea
                  value={formData.conclusion_comment}
                  onChange={(e) => setFormData({...formData, conclusion_comment: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">纠正措施</label>
                <textarea
                  value={formData.corrective_action}
                  onChange={(e) => setFormData({...formData, corrective_action: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type === 'view' && plan && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{plan.plan_name}</h3>
                <p className="text-sm text-gray-600">编号: {plan.plan_code}</p>
                <p className="text-sm text-gray-600">仪器: {plan.instrument_name} ({plan.instrument_code})</p>
                <p className="text-sm text-gray-600">核查项目: {plan.check_item}</p>
                <p className="text-sm text-gray-600">核查标准: {plan.check_criteria}</p>
              </div>
              
              {plan.records && plan.records.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">核查记录</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">核查编号</th>
                        <th className="px-4 py-2 text-left">核查日期</th>
                        <th className="px-4 py-2 text-left">结果</th>
                        <th className="px-4 py-2 text-left">参考值</th>
                        <th className="px-4 py-2 text-left">偏差</th>
                        <th className="px-4 py-2 text-left">结论</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.records.map((record) => (
                        <tr key={record.id} className="border-t">
                          <td className="px-4 py-2">{record.check_code}</td>
                          <td className="px-4 py-2">{record.check_date}</td>
                          <td className="px-4 py-2">{record.check_result}</td>
                          <td className="px-4 py-2">{record.reference_value}</td>
                          <td className="px-4 py-2">{record.deviation_percentage?.toFixed(2)}%</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              record.conclusion === '合格' ? 'bg-green-100 text-green-800' :
                              record.conclusion === '不合格' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.conclusion}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

export default IntermediateCheck;
