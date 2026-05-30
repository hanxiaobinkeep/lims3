import React, { useState, useEffect } from 'react';
import {
  getValidationPlans,
  getValidationPlanById,
  createValidationPlan,
  updateValidationPlan,
  addValidationDocument,
  reviewValidationDocument,
  approveValidationDocument,
  addValidationTest,
  reviewValidationTest,
  addTraceabilityMatrix,
  addValidationDeviation,
  updateValidationDeviation,
  getValidationStats
} from '../services/validation.js';
import {
  Plus, Search, Eye, Edit, FileText, Beaker, GitBranch, AlertTriangle,
  CheckCircle, XCircle, Clock, ChevronLeft, Save, X, Check
} from 'lucide-react';

const ValidationManagement = () => {
  const [listTab, setListTab] = useState('plans');
  const [detailTab, setDetailTab] = useState('documents');
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({});
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    validation_type: ''
  });
  const [formData, setFormData] = useState({});
  const [detailView, setDetailView] = useState(false);

  useEffect(() => {
    loadPlans();
    loadStats();
  }, [filters]);

  const loadPlans = async () => {
    try {
      const response = await getValidationPlans(filters);
      setPlans(response.data.list || []);
    } catch (error) {
      console.error('加载验证计划列表失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getValidationStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await getValidationPlanById(id);
      setCurrentPlan(response.data);
      setDetailView(true);
    } catch (error) {
      console.error('获取计划详情失败:', error);
    }
  };

  const handleCreate = () => {
    setFormData({
      plan_code: '',
      plan_name: '',
      validation_type: '设备验证',
      category: '',
      description: '',
      target_system: '',
      planned_start_date: '',
      planned_end_date: '',
      priority: 'normal',
      risk_level: 'medium',
      validation_scope: '',
      acceptance_criteria: '',
      remark: ''
    });
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setFormData({ ...plan });
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await createValidationPlan(formData);
      } else if (modalType === 'edit') {
        await updateValidationPlan(formData.id, formData);
      }
      setShowModal(false);
      loadPlans();
      loadStats();
    } catch (error) {
      console.error('提交失败:', error);
      alert('操作失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      await addValidationDocument({
        plan_id: currentPlan.id,
        ...formData
      });
      setShowModal(false);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('添加文档失败:', error);
      alert('操作失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      await addValidationTest({
        plan_id: currentPlan.id,
        ...formData
      });
      setShowModal(false);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('添加测试记录失败:', error);
      alert('操作失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddMatrix = async (e) => {
    e.preventDefault();
    try {
      await addTraceabilityMatrix({
        plan_id: currentPlan.id,
        ...formData
      });
      setShowModal(false);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('添加矩阵记录失败:', error);
      alert('操作失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddDeviation = async (e) => {
    e.preventDefault();
    try {
      await addValidationDeviation({
        plan_id: currentPlan.id,
        ...formData
      });
      setShowModal(false);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('添加偏差记录失败:', error);
      alert('操作失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReviewDoc = async (docId) => {
    if (!confirm('确认审核该文档？')) return;
    try {
      await reviewValidationDocument(docId);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('审核失败:', error);
    }
  };

  const handleApproveDoc = async (docId) => {
    if (!confirm('确认批准该文档？')) return;
    try {
      await approveValidationDocument(docId);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('批准失败:', error);
    }
  };

  const handleReviewTest = async (testId) => {
    if (!confirm('确认审核该测试记录？')) return;
    try {
      await reviewValidationTest(testId);
      handleView(currentPlan.id);
    } catch (error) {
      console.error('审核失败:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      planned: { color: 'bg-blue-100 text-blue-800', label: '计划中' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: '进行中' },
      completed: { color: 'bg-green-100 text-green-800', label: '已完成' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: '已取消' },
      draft: { color: 'bg-gray-100 text-gray-800', label: '草稿' },
      reviewed: { color: 'bg-purple-100 text-purple-800', label: '已审核' },
      approved: { color: 'bg-green-100 text-green-800', label: '已批准' },
      pass: { color: 'bg-green-100 text-green-800', label: '通过' },
      fail: { color: 'bg-red-100 text-red-800', label: '失败' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '待处理' },
      open: { color: 'bg-red-100 text-red-800', label: '打开' },
      resolved: { color: 'bg-green-100 text-green-800', label: '已解决' }
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.label}</span>;
  };

  const getValidationTypeLabel = (type) => {
    const typeMap = {
      '设备验证': '设备验证',
      '计算机化系统验证': '计算机化系统验证',
      '方法验证': '方法验证',
      '清洁验证': '清洁验证',
      '工艺验证': '工艺验证'
    };
    return typeMap[type] || type;
  };

  if (detailView && currentPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDetailView(false)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            返回列表
          </button>
          <h2 className="text-xl font-bold">{currentPlan.plan_name}</h2>
          <div>{getStatusBadge(currentPlan.status)}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">计划编号:</span> {currentPlan.plan_code}</div>
            <div><span className="text-slate-500">验证类型:</span> {getValidationTypeLabel(currentPlan.validation_type)}</div>
            <div><span className="text-slate-500">分类:</span> {currentPlan.category || '-'}</div>
            <div><span className="text-slate-500">目标系统:</span> {currentPlan.target_system || '-'}</div>
            <div><span className="text-slate-500">负责人:</span> {currentPlan.responsible_name || '-'}</div>
            <div><span className="text-slate-500">优先级:</span> {currentPlan.priority || '-'}</div>
            <div><span className="text-slate-500">风险等级:</span> {currentPlan.risk_level || '-'}</div>
            <div><span className="text-slate-500">计划开始:</span> {currentPlan.planned_start_date || '-'}</div>
            <div><span className="text-slate-500">计划结束:</span> {currentPlan.planned_end_date || '-'}</div>
          </div>
          {currentPlan.description && (
            <div className="mt-4">
              <span className="text-slate-500">描述:</span>
              <p className="mt-1 text-sm">{currentPlan.description}</p>
            </div>
          )}
          {currentPlan.validation_scope && (
            <div className="mt-4">
              <span className="text-slate-500">验证范围:</span>
              <p className="mt-1 text-sm">{currentPlan.validation_scope}</p>
            </div>
          )}
          {currentPlan.acceptance_criteria && (
            <div className="mt-4">
              <span className="text-slate-500">接受标准:</span>
              <p className="mt-1 text-sm">{currentPlan.acceptance_criteria}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { key: 'documents', label: '验证文档', icon: FileText },
                { key: 'tests', label: '测试记录', icon: Beaker },
                { key: 'matrices', label: '可追溯性矩阵', icon: GitBranch },
                { key: 'deviations', label: '偏差记录', icon: AlertTriangle }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === tab.key
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {detailTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">验证文档列表</h3>
                  <button
                    onClick={() => {
                      setFormData({ document_code: '', document_name: '', document_type: '方案', version: '1.0', content: '', remark: '' });
                      setModalType('addDocument');
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加文档
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">文档编号</th>
                      <th className="px-4 py-3 text-left">文档名称</th>
                      <th className="px-4 py-3 text-left">类型</th>
                      <th className="px-4 py-3 text-left">版本</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">编制人</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(currentPlan.documents || []).map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{doc.document_code}</td>
                        <td className="px-4 py-3">{doc.document_name}</td>
                        <td className="px-4 py-3">{doc.document_type}</td>
                        <td className="px-4 py-3">{doc.version}</td>
                        <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                        <td className="px-4 py-3">{doc.author_name}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {doc.status === 'draft' && (
                              <button onClick={() => handleReviewDoc(doc.id)} className="text-purple-600 hover:text-purple-800 text-xs">审核</button>
                            )}
                            {doc.status === 'reviewed' && (
                              <button onClick={() => handleApproveDoc(doc.id)} className="text-green-600 hover:text-green-800 text-xs">批准</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(currentPlan.documents || []).length === 0 && (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">暂无文档</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'tests' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">测试记录列表</h3>
                  <button
                    onClick={() => {
                      setFormData({ test_code: '', test_name: '', test_type: 'IQ', test_objective: '', test_procedure: '', expected_result: '', actual_result: '', test_result: 'pass', deviation_description: '', test_date: '', remark: '' });
                      setModalType('addTest');
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加测试
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">测试编号</th>
                      <th className="px-4 py-3 text-left">测试名称</th>
                      <th className="px-4 py-3 text-left">类型</th>
                      <th className="px-4 py-3 text-left">测试结果</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">测试人</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(currentPlan.tests || []).map(test => (
                      <tr key={test.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{test.test_code}</td>
                        <td className="px-4 py-3">{test.test_name}</td>
                        <td className="px-4 py-3">{test.test_type}</td>
                        <td className="px-4 py-3">{getStatusBadge(test.test_result)}</td>
                        <td className="px-4 py-3">{getStatusBadge(test.status)}</td>
                        <td className="px-4 py-3">{test.tester_name}</td>
                        <td className="px-4 py-3">
                          {test.status !== 'approved' && (
                            <button onClick={() => handleReviewTest(test.id)} className="text-purple-600 hover:text-purple-800 text-xs">审核</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(currentPlan.tests || []).length === 0 && (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">暂无测试记录</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'matrices' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">可追溯性矩阵</h3>
                  <button
                    onClick={() => {
                      setFormData({ requirement_id: '', requirement_description: '', test_case_id: '', test_case_description: '', test_result: 'pass', risk_level: 'medium', verification_method: '', remark: '' });
                      setModalType('addMatrix');
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加矩阵记录
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">需求ID</th>
                      <th className="px-4 py-3 text-left">需求描述</th>
                      <th className="px-4 py-3 text-left">测试用例ID</th>
                      <th className="px-4 py-3 text-left">测试用例描述</th>
                      <th className="px-4 py-3 text-left">测试结果</th>
                      <th className="px-4 py-3 text-left">风险等级</th>
                      <th className="px-4 py-3 text-left">验证方法</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(currentPlan.matrices || []).map(matrix => (
                      <tr key={matrix.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{matrix.requirement_id}</td>
                        <td className="px-4 py-3">{matrix.requirement_description}</td>
                        <td className="px-4 py-3">{matrix.test_case_id}</td>
                        <td className="px-4 py-3">{matrix.test_case_description}</td>
                        <td className="px-4 py-3">{getStatusBadge(matrix.test_result)}</td>
                        <td className="px-4 py-3">{matrix.risk_level}</td>
                        <td className="px-4 py-3">{matrix.verification_method}</td>
                      </tr>
                    ))}
                    {(currentPlan.matrices || []).length === 0 && (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">暂无矩阵记录</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'deviations' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">偏差记录列表</h3>
                  <button
                    onClick={() => {
                      setFormData({ deviation_code: '', deviation_type: '测试偏差', description: '', root_cause: '', impact_assessment: '', corrective_action: '', preventive_action: '', deadline: '', remark: '' });
                      setModalType('addDeviation');
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加偏差
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">偏差编号</th>
                      <th className="px-4 py-3 text-left">偏差类型</th>
                      <th className="px-4 py-3 text-left">描述</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">负责人</th>
                      <th className="px-4 py-3 text-left">截止日期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(currentPlan.deviations || []).map(dev => (
                      <tr key={dev.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{dev.deviation_code}</td>
                        <td className="px-4 py-3">{dev.deviation_type}</td>
                        <td className="px-4 py-3">{dev.description}</td>
                        <td className="px-4 py-3">{getStatusBadge(dev.status)}</td>
                        <td className="px-4 py-3">{dev.responsible_name}</td>
                        <td className="px-4 py-3">{dev.deadline || '-'}</td>
                      </tr>
                    ))}
                    {(currentPlan.deviations || []).length === 0 && (
                      <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">暂无偏差记录</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">验证管理</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          新建验证计划
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-500">验证计划总数</div>
          <div className="text-2xl font-bold mt-1">
            {(stats.plan_stats || []).reduce((sum, s) => sum + s.count, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-500">进行中</div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">
            {(stats.plan_stats || []).find(s => s.status === 'in_progress')?.count || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-500">已完成</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {(stats.plan_stats || []).find(s => s.status === 'completed')?.count || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-500">待处理偏差</div>
          <div className="text-2xl font-bold mt-1 text-red-600">
            {(stats.deviation_stats || []).filter(s => s.status === 'open').reduce((sum, s) => sum + s.count, 0)}
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索计划编号、名称或目标系统..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">全部状态</option>
            <option value="planned">计划中</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
          <select
            value={filters.validation_type}
            onChange={(e) => setFilters({ ...filters, validation_type: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">全部类型</option>
            <option value="设备验证">设备验证</option>
            <option value="计算机化系统验证">计算机化系统验证</option>
            <option value="方法验证">方法验证</option>
            <option value="清洁验证">清洁验证</option>
            <option value="工艺验证">工艺验证</option>
          </select>
        </div>
      </div>

      {/* 计划列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">计划编号</th>
              <th className="px-4 py-3 text-left">计划名称</th>
              <th className="px-4 py-3 text-left">验证类型</th>
              <th className="px-4 py-3 text-left">目标系统</th>
              <th className="px-4 py-3 text-left">负责人</th>
              <th className="px-4 py-3 text-left">计划时间</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{plan.plan_code}</td>
                <td className="px-4 py-3">{plan.plan_name}</td>
                <td className="px-4 py-3">{getValidationTypeLabel(plan.validation_type)}</td>
                <td className="px-4 py-3">{plan.target_system || '-'}</td>
                <td className="px-4 py-3">{plan.responsible_name || '-'}</td>
                <td className="px-4 py-3">
                  {plan.planned_start_date || '-'} ~ {plan.planned_end_date || '-'}
                </td>
                <td className="px-4 py-3">{getStatusBadge(plan.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleView(plan.id)} className="text-teal-600 hover:text-teal-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                  暂无验证计划
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold">
                {modalType === 'create' && '新建验证计划'}
                {modalType === 'edit' && '编辑验证计划'}
                {modalType === 'addDocument' && '添加验证文档'}
                {modalType === 'addTest' && '添加测试记录'}
                {modalType === 'addMatrix' && '添加可追溯性矩阵'}
                {modalType === 'addDeviation' && '添加偏差记录'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={
              modalType === 'create' || modalType === 'edit' ? handleSubmit :
              modalType === 'addDocument' ? handleAddDocument :
              modalType === 'addTest' ? handleAddTest :
              modalType === 'addMatrix' ? handleAddMatrix :
              handleAddDeviation
            } className="p-6 space-y-4">

              {(modalType === 'create' || modalType === 'edit') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">计划编号 <span className="text-red-500">*</span></label>
                      <input required value={formData.plan_code || ''} onChange={e => setFormData({...formData, plan_code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">计划名称 <span className="text-red-500">*</span></label>
                      <input required value={formData.plan_name || ''} onChange={e => setFormData({...formData, plan_name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">验证类型</label>
                      <select value={formData.validation_type || ''} onChange={e => setFormData({...formData, validation_type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="设备验证">设备验证</option>
                        <option value="计算机化系统验证">计算机化系统验证</option>
                        <option value="方法验证">方法验证</option>
                        <option value="清洁验证">清洁验证</option>
                        <option value="工艺验证">工艺验证</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">分类</label>
                      <input value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">目标系统/设备</label>
                    <input value={formData.target_system || ''} onChange={e => setFormData({...formData, target_system: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">计划开始日期</label>
                      <input type="date" value={formData.planned_start_date || ''} onChange={e => setFormData({...formData, planned_start_date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">计划结束日期</label>
                      <input type="date" value={formData.planned_end_date || ''} onChange={e => setFormData({...formData, planned_end_date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">优先级</label>
                      <select value={formData.priority || 'normal'} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="low">低</option>
                        <option value="normal">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">风险等级</label>
                      <select value={formData.risk_level || 'medium'} onChange={e => setFormData({...formData, risk_level: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">描述</label>
                    <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">验证范围</label>
                    <textarea value={formData.validation_scope || ''} onChange={e => setFormData({...formData, validation_scope: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">接受标准</label>
                    <textarea value={formData.acceptance_criteria || ''} onChange={e => setFormData({...formData, acceptance_criteria: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">备注</label>
                    <textarea value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              {modalType === 'addDocument' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">文档编号 <span className="text-red-500">*</span></label>
                      <input required value={formData.document_code || ''} onChange={e => setFormData({...formData, document_code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">文档名称 <span className="text-red-500">*</span></label>
                      <input required value={formData.document_name || ''} onChange={e => setFormData({...formData, document_name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">文档类型</label>
                      <select value={formData.document_type || '方案'} onChange={e => setFormData({...formData, document_type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="方案">验证方案</option>
                        <option value="报告">验证报告</option>
                        <option value="记录">测试记录</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">版本</label>
                      <input value={formData.version || ''} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">内容</label>
                    <textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} rows="4" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">备注</label>
                    <textarea value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              {modalType === 'addTest' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">测试编号 <span className="text-red-500">*</span></label>
                      <input required value={formData.test_code || ''} onChange={e => setFormData({...formData, test_code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">测试名称 <span className="text-red-500">*</span></label>
                      <input required value={formData.test_name || ''} onChange={e => setFormData({...formData, test_name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">测试类型</label>
                      <select value={formData.test_type || 'IQ'} onChange={e => setFormData({...formData, test_type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="IQ">IQ（安装确认）</option>
                        <option value="OQ">OQ（运行确认）</option>
                        <option value="PQ">PQ（性能确认）</option>
                        <option value="CSV">CSV（计算机化系统验证）</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">测试日期</label>
                      <input type="date" value={formData.test_date || ''} onChange={e => setFormData({...formData, test_date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">测试目的</label>
                    <textarea value={formData.test_objective || ''} onChange={e => setFormData({...formData, test_objective: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">测试步骤</label>
                    <textarea value={formData.test_procedure || ''} onChange={e => setFormData({...formData, test_procedure: e.target.value})} rows="3" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">预期结果</label>
                      <textarea value={formData.expected_result || ''} onChange={e => setFormData({...formData, expected_result: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">实际结果</label>
                      <textarea value={formData.actual_result || ''} onChange={e => setFormData({...formData, actual_result: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">测试结果</label>
                      <select value={formData.test_result || 'pass'} onChange={e => setFormData({...formData, test_result: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="pass">通过</option>
                        <option value="fail">失败</option>
                        <option value="pending">待定</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">偏差描述</label>
                      <input value={formData.deviation_description || ''} onChange={e => setFormData({...formData, deviation_description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">备注</label>
                    <textarea value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              {modalType === 'addMatrix' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">需求ID <span className="text-red-500">*</span></label>
                      <input required value={formData.requirement_id || ''} onChange={e => setFormData({...formData, requirement_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">测试用例ID <span className="text-red-500">*</span></label>
                      <input required value={formData.test_case_id || ''} onChange={e => setFormData({...formData, test_case_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">需求描述</label>
                    <textarea value={formData.requirement_description || ''} onChange={e => setFormData({...formData, requirement_description: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">测试用例描述</label>
                    <textarea value={formData.test_case_description || ''} onChange={e => setFormData({...formData, test_case_description: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">测试结果</label>
                      <select value={formData.test_result || 'pass'} onChange={e => setFormData({...formData, test_result: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="pass">通过</option>
                        <option value="fail">失败</option>
                        <option value="pending">待定</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">风险等级</label>
                      <select value={formData.risk_level || 'medium'} onChange={e => setFormData({...formData, risk_level: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">验证方法</label>
                    <input value={formData.verification_method || ''} onChange={e => setFormData({...formData, verification_method: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">备注</label>
                    <textarea value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              {modalType === 'addDeviation' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">偏差编号 <span className="text-red-500">*</span></label>
                      <input required value={formData.deviation_code || ''} onChange={e => setFormData({...formData, deviation_code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">偏差类型</label>
                      <select value={formData.deviation_type || '测试偏差'} onChange={e => setFormData({...formData, deviation_type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="测试偏差">测试偏差</option>
                        <option value="文档偏差">文档偏差</option>
                        <option value="设备偏差">设备偏差</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">偏差描述 <span className="text-red-500">*</span></label>
                    <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">根本原因</label>
                    <textarea value={formData.root_cause || ''} onChange={e => setFormData({...formData, root_cause: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">影响评估</label>
                    <textarea value={formData.impact_assessment || ''} onChange={e => setFormData({...formData, impact_assessment: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">纠正措施</label>
                      <textarea value={formData.corrective_action || ''} onChange={e => setFormData({...formData, corrective_action: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">预防措施</label>
                      <textarea value={formData.preventive_action || ''} onChange={e => setFormData({...formData, preventive_action: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">截止日期</label>
                    <input type="date" value={formData.deadline || ''} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">备注</label>
                    <textarea value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationManagement;
