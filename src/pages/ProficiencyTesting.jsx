import React, { useState, useEffect } from 'react';
import {
  getProficiencyTestingPlans,
  getProficiencyTestingPlanById,
  createProficiencyTestingPlan,
  updateProficiencyTestingPlan,
  addProficiencyTestingResult,
  reviewProficiencyTestingResult,
  getProficiencyTestingStats
} from '../services/proficiencyTesting.js';

const ProficiencyTesting = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({});
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
  }, [filters]);

  const loadPlans = async () => {
    try {
      const response = await getProficiencyTestingPlans(filters);
      setPlans(response.data.list);
    } catch (error) {
      console.error('加载计划列表失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getProficiencyTestingStats();
      setStats(response.data);
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await getProficiencyTestingPlanById(id);
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

  const handleAddResult = (plan) => {
    setCurrentPlan(plan);
    setModalType('result');
    setShowModal(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (modalType === 'create') {
        await createProficiencyTestingPlan(data);
      } else if (modalType === 'edit') {
        await updateProficiencyTestingPlan(currentPlan.id, data);
      } else if (modalType === 'result') {
        await addProficiencyTestingResult({ ...data, plan_id: currentPlan.id });
      }
      setShowModal(false);
      alert('操作成功');
      loadPlans();
      loadStats();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'planned': '计划中',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getEvaluationColor = (evaluation) => {
    const colorMap = {
      'satisfactory': 'bg-green-100 text-green-800',
      'questionable': 'bg-yellow-100 text-yellow-800',
      'unsatisfactory': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800'
    };
    return colorMap[evaluation] || 'bg-gray-100 text-gray-800';
  };

  const getEvaluationText = (evaluation) => {
    const textMap = {
      'satisfactory': '满意',
      'questionable': '可疑',
      'unsatisfactory': '不满意',
      'pending': '待评价'
    };
    return textMap[evaluation] || evaluation;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">能力验证管理</h1>
        <p className="text-gray-600 mt-1">管理实验室能力验证计划和结果</p>
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
          <h3 className="text-sm font-medium text-gray-500">满意结果</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.evaluation_stats?.find(item => item.evaluation === 'satisfactory')?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">不满意结果</h3>
          <p className="text-2xl font-bold text-red-600">
            {stats.evaluation_stats?.find(item => item.evaluation === 'unsatisfactory')?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">待处理措施</h3>
          <p className="text-2xl font-bold text-orange-600">
            {stats.action_stats?.find(item => item.status === 'pending')?.count || 0}
          </p>
        </div>
      </div>

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
              验证计划
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
                  placeholder="搜索计划名称或编号"
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
                  <option value="in_progress">进行中</option>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">组织者</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">验证类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">计划日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">截止日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{plan.plan_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.plan_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.organizer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.testing_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.plan_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.deadline_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button onClick={() => handleView(plan.id)} className="text-blue-600 hover:text-blue-900">查看</button>
                          <button onClick={() => handleEdit(plan)} className="text-green-600 hover:text-green-900">编辑</button>
                          <button onClick={() => handleAddResult(plan)} className="text-purple-600 hover:text-purple-900">录入结果</button>
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
                  <h3 className="font-semibold text-gray-900 mb-4">评价结果分布</h3>
                  <div className="space-y-2">
                    {stats.evaluation_stats?.map((item) => (
                      <div key={item.evaluation} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{getEvaluationText(item.evaluation)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.evaluation === 'satisfactory' ? 'bg-green-600' :
                                item.evaluation === 'unsatisfactory' ? 'bg-red-600' :
                                item.evaluation === 'questionable' ? 'bg-yellow-600' : 'bg-gray-600'
                              }`}
                              style={{ width: `${(item.count / (stats.evaluation_stats?.reduce((sum, i) => sum + i.count, 0) || 1)) * 100}%` }}
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
        <ProficiencyTestingModal
          type={modalType}
          plan={currentPlan}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const ProficiencyTestingModal = ({ type, plan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    plan_code: '',
    plan_name: '',
    organizer: '',
    testing_type: '',
    testing_items: '',
    sample_description: '',
    plan_date: '',
    deadline_date: '',
    remark: '',
    sample_code: '',
    test_item: '',
    test_method: '',
    lab_result: '',
    reference_value: '',
    uncertainty: '',
    test_date: ''
  });

  useEffect(() => {
    if (plan && type === 'edit') {
      setFormData({
        ...plan,
        plan_date: plan.plan_date?.split('T')[0],
        deadline_date: plan.deadline_date?.split('T')[0]
      });
    }
  }, [plan, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTitle = () => {
    switch (type) {
      case 'create': return '新增能力验证计划';
      case 'edit': return '编辑能力验证计划';
      case 'view': return '计划详情';
      case 'result': return '录入验证结果';
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
                <label className="block text-sm font-medium text-gray-700 mb-1">组织者</label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">验证类型</label>
                <select
                  value={formData.testing_type}
                  onChange={(e) => setFormData({...formData, testing_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">请选择</option>
                  <option value="实验室间比对">实验室间比对</option>
                  <option value="测量审核">测量审核</option>
                  <option value="标准物质检测">标准物质检测</option>
                  <option value="留样再测">留样再测</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">检测项目</label>
                <textarea
                  value={formData.testing_items}
                  onChange={(e) => setFormData({...formData, testing_items: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">样品描述</label>
                <textarea
                  value={formData.sample_description}
                  onChange={(e) => setFormData({...formData, sample_description: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <input
                  type="date"
                  value={formData.deadline_date}
                  onChange={(e) => setFormData({...formData, deadline_date: e.target.value})}
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

          {type === 'result' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">样品编号 *</label>
                <input
                  type="text"
                  value={formData.sample_code}
                  onChange={(e) => setFormData({...formData, sample_code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检测项目 *</label>
                <input
                  type="text"
                  value={formData.test_item}
                  onChange={(e) => setFormData({...formData, test_item: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检测方法</label>
                <input
                  type="text"
                  value={formData.test_method}
                  onChange={(e) => setFormData({...formData, test_method: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检测日期</label>
                <input
                  type="date"
                  value={formData.test_date}
                  onChange={(e) => setFormData({...formData, test_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">实验室结果 *</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lab_result}
                  onChange={(e) => setFormData({...formData, lab_result: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">不确定度 *</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.uncertainty}
                  onChange={(e) => setFormData({...formData, uncertainty: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          )}

          {type === 'view' && plan && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{plan.plan_name}</h3>
                <p className="text-sm text-gray-600">编号: {plan.plan_code}</p>
                <p className="text-sm text-gray-600">组织者: {plan.organizer}</p>
                <p className="text-sm text-gray-600">类型: {plan.testing_type}</p>
              </div>
              
              {plan.results && plan.results.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">验证结果</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">样品编号</th>
                        <th className="px-4 py-2 text-left">检测项目</th>
                        <th className="px-4 py-2 text-left">实验室结果</th>
                        <th className="px-4 py-2 text-left">参考值</th>
                        <th className="px-4 py-2 text-left">Z值</th>
                        <th className="px-4 py-2 text-left">评价</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.results.map((result) => (
                        <tr key={result.id} className="border-t">
                          <td className="px-4 py-2">{result.sample_code}</td>
                          <td className="px-4 py-2">{result.test_item}</td>
                          <td className="px-4 py-2">{result.lab_result}</td>
                          <td className="px-4 py-2">{result.reference_value}</td>
                          <td className="px-4 py-2">{result.z_score}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              result.evaluation === 'satisfactory' ? 'bg-green-100 text-green-800' :
                              result.evaluation === 'unsatisfactory' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getEvaluationText(result.evaluation)}
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

const getEvaluationText = (evaluation) => {
  const textMap = {
    'satisfactory': '满意',
    'questionable': '可疑',
    'unsatisfactory': '不满意',
    'pending': '待评价'
  };
  return textMap[evaluation] || evaluation;
};

export default ProficiencyTesting;
