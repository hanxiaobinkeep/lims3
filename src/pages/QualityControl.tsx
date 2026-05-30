import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  getQCPlans,
  getQCData,
  getQCOOCRecords,
  createQCPlan,
  updateQCPlan,
  deleteQCPlan,
  createQCData,
  type QCPlan,
  type QCData,
  type QCOOC
} from '../services/qualityControl';

const QualityControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<QCPlan[]>([]);
  const [qcData, setQcData] = useState<QCData[]>([]);
  const [oocRecords, setOocRecords] = useState<QCOOC[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<QCPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'add-data'>('create');
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (activeTab === 'plans') {
      loadPlans();
    } else if (activeTab === 'data') {
      loadQCData();
    } else if (activeTab === 'ooc') {
      loadOocRecords();
    }
  }, [activeTab]);

  const loadPlans = async () => {
    try {
      const res: any = await getQCPlans();
      if (res.code === 200) {
        setPlans(res.data);
      }
    } catch (error) {
      console.error('加载质控计划失败:', error);
    }
  };

  const loadQCData = async () => {
    try {
      const res: any = await getQCData();
      if (res.code === 200) {
        setQcData(res.data);
      }
    } catch (error) {
      console.error('加载质控数据失败:', error);
    }
  };

  const loadOocRecords = async () => {
    try {
      const res: any = await getQCOOCRecords();
      if (res.code === 200) {
        setOocRecords(res.data);
      }
    } catch (error) {
      console.error('加载失控记录失败:', error);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePlan = () => {
    setModalType('create');
    setFormData({
      plan_name: '',
      plan_type: 'control_chart',
      inspection_item: '',
      chart_type: 'x_bar_r',
      sample_size: 5,
      sample_interval: '',
      center_line: 0,
      upper_control_limit: 0,
      lower_control_limit: 0,
      upper_spec_limit: 0,
      lower_spec_limit: 0,
      target_value: 0,
      unit: '',
      description: '',
      status: 'draft'
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan: QCPlan) => {
    setModalType('edit');
    setFormData({ ...plan });
    setShowModal(true);
  };

  const handleAddData = (plan: QCPlan) => {
    setSelectedPlan(plan);
    setModalType('add-data');
    setFormData({
      plan_id: plan.id,
      subgroup_no: 1,
      sample_time: new Date().toISOString().slice(0, 16),
      sample_values: '[]',
      remark: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'create') {
        const res: any = await createQCPlan(formData);
        if (res.code === 200) {
          showToastMessage('创建成功', 'success');
          loadPlans();
          setShowModal(false);
        }
      } else if (modalType === 'edit') {
        const res: any = await updateQCPlan(formData.id, formData);
        if (res.code === 200) {
          showToastMessage('更新成功', 'success');
          loadPlans();
          setShowModal(false);
        }
      } else if (modalType === 'add-data') {
        const res: any = await createQCData(formData);
        if (res.code === 200) {
          showToastMessage('添加成功', 'success');
          loadQCData();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      showToastMessage('操作失败', 'error');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('确定要删除这个质控计划吗？')) return;
    try {
      const res: any = await deleteQCPlan(id);
      if (res.code === 200) {
        showToastMessage('删除成功', 'success');
        loadPlans();
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToastMessage('删除失败', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    analyzed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    action_taken: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const chartTypeLabels: Record<string, string> = {
    'x_bar_r': 'X-bar-R图',
    'x_bar_s': 'X-bar-S图',
    'p': 'P图',
    'np': 'NP图',
    'c': 'C图',
    'u': 'U图'
  };

  return (
    <div className="space-y-6">
      {/* 提示框 */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">质量控制</h1>
        {activeTab === 'plans' && (
          <button
            onClick={handleCreatePlan}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新建质控计划
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'plans', label: '质控计划' },
            { key: 'data', label: '质控数据' },
            { key: 'ooc', label: '失控记录' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'plans' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检验项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">控制图类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">中心限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.plan_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.inspection_item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chartTypeLabels[plan.chart_type]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.center_line} {plan.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[plan.status]}`}>
                      {plan.status === 'draft' ? '草稿' : plan.status === 'active' ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddData(plan)}
                        className="text-green-600 hover:text-green-900"
                        title="添加数据"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">质控计划</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">子组号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取样时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">子组均值</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失控</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qcData.map((data) => {
                const plan = plans.find(p => p.id === data.plan_id);
                return (
                  <tr key={data.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan?.plan_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.subgroup_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(data.sample_time).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.subgroup_mean?.toFixed(4)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.is_out_of_control ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[data.status || '']}`}>
                        {data.status === 'pending' ? '待处理' : data.status === 'analyzed' ? '已分析' : '已解决'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ooc' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">质控计划</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失控时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失控类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {oocRecords.map((record) => {
                const plan = plans.find(p => p.id === record.plan_id);
                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan?.plan_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.ooc_time).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.ooc_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[record.status || '']}`}>
                        {record.status === 'open' ? '待处理' : record.status === 'investigating' ? '调查中' : record.status === 'action_taken' ? '已采取措施' : '已关闭'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === 'create' ? '新建质控计划' : 
               modalType === 'edit' ? '编辑质控计划' : 
               '添加质控数据'}
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              {modalType === 'add-data' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">质控计划</label>
                      <input
                        type="text"
                        value={selectedPlan?.plan_name}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">子组号</label>
                      <input
                        type="number"
                        value={formData.subgroup_no}
                        onChange={(e) => setFormData({ ...formData, subgroup_no: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">取样时间</label>
                      <input
                        type="datetime-local"
                        value={formData.sample_time}
                        onChange={(e) => setFormData({ ...formData, sample_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">样本值 (JSON数组，例如 [99.5, 99.4, 99.6, 99.3, 99.5])</label>
                      <textarea
                        value={formData.sample_values}
                        onChange={(e) => setFormData({ ...formData, sample_values: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                      <textarea
                        value={formData.remark}
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">计划名称</label>
                    <input
                      type="text"
                      value={formData.plan_name}
                      onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">计划类型</label>
                    <select
                      value={formData.plan_type}
                      onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="control_chart">控制图</option>
                      <option value="quality_monitor">质量监控</option>
                      <option value="capability_analysis">能力分析</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">检验项目</label>
                    <input
                      type="text"
                      value={formData.inspection_item}
                      onChange={(e) => setFormData({ ...formData, inspection_item: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">控制图类型</label>
                    <select
                      value={formData.chart_type}
                      onChange={(e) => setFormData({ ...formData, chart_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="x_bar_r">X-bar-R图</option>
                      <option value="x_bar_s">X-bar-S图</option>
                      <option value="p">P图</option>
                      <option value="np">NP图</option>
                      <option value="c">C图</option>
                      <option value="u">U图</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">样本大小</label>
                    <input
                      type="number"
                      value={formData.sample_size}
                      onChange={(e) => setFormData({ ...formData, sample_size: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">取样间隔</label>
                    <input
                      type="text"
                      value={formData.sample_interval}
                      onChange={(e) => setFormData({ ...formData, sample_interval: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="例如：4小时"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">中心限</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.center_line}
                      onChange={(e) => setFormData({ ...formData, center_line: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目标值</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.target_value}
                      onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">上控制限</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.upper_control_limit}
                      onChange={(e) => setFormData({ ...formData, upper_control_limit: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">下控制限</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lower_control_limit}
                      onChange={(e) => setFormData({ ...formData, lower_control_limit: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">上规格限</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.upper_spec_limit}
                      onChange={(e) => setFormData({ ...formData, upper_spec_limit: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">下规格限</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lower_spec_limit}
                      onChange={(e) => setFormData({ ...formData, lower_spec_limit: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="draft">草稿</option>
                      <option value="active">启用</option>
                      <option value="inactive">停用</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityControl;
