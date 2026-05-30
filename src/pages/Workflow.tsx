import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, CheckCircle, XCircle, History } from 'lucide-react';
import {
  getWorkflows,
  getWorkflowInstances,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  startWorkflow,
  executeWorkflowAction,
  getWorkflowHistory,
  type Workflow,
  type WorkflowInstance,
  type WorkflowHistory
} from '../services/workflow';

const WorkflowManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('definitions');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view-history'>('create');
  const [formData, setFormData] = useState<any>({});
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [historyData, setHistoryData] = useState<WorkflowHistory[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (activeTab === 'definitions') {
      loadWorkflows();
    } else if (activeTab === 'instances') {
      loadInstances();
    }
  }, [activeTab]);

  const loadWorkflows = async () => {
    try {
      const res: any = await getWorkflows();
      if (res.code === 200) {
        setWorkflows(res.data);
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
    }
  };

  const loadInstances = async () => {
    try {
      const res: any = await getWorkflowInstances();
      if (res.code === 200) {
        setInstances(res.data.list || []);
      }
    } catch (error) {
      console.error('加载工作流实例失败:', error);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setModalType('create');
    setFormData({
      workflow_code: '',
      workflow_name: '',
      workflow_type: 'inspection',
      description: '',
      nodes: [
        { id: 'start', name: '开始', type: 'start', next: 'task' },
        { id: 'task', name: '任务', type: 'task', next: 'approval' },
        { id: 'approval', name: '审批', type: 'approval', next: 'end' },
        { id: 'end', name: '结束', type: 'end' }
      ],
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setModalType('edit');
    setFormData({ ...workflow });
    setShowModal(true);
  };

  const handleViewHistory = async (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setModalType('view-history');
    try {
      const res: any = await getWorkflowHistory(instance.id!);
      if (res.code === 200) {
        setHistoryData(res.data);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'create') {
        const res: any = await createWorkflow(formData);
        if (res.code === 200) {
          showToastMessage('创建成功', 'success');
          loadWorkflows();
          setShowModal(false);
        }
      } else if (modalType === 'edit') {
        const res: any = await updateWorkflow(formData.id, formData);
        if (res.code === 200) {
          showToastMessage('更新成功', 'success');
          loadWorkflows();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      showToastMessage('操作失败', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个工作流吗？')) return;
    try {
      const res: any = await deleteWorkflow(id);
      if (res.code === 200) {
        showToastMessage('删除成功', 'success');
        loadWorkflows();
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToastMessage('删除失败', 'error');
    }
  };

  const handleStartWorkflow = async (workflowId: number) => {
    try {
      const res: any = await startWorkflow({
        workflow_id: workflowId,
        business_type: 'test',
        business_id: `TEST-${Date.now()}`
      });
      if (res.code === 200) {
        showToastMessage('工作流启动成功', 'success');
        loadInstances();
      }
    } catch (error) {
      console.error('启动失败:', error);
      showToastMessage('启动失败', 'error');
    }
  };

  const handleApprove = async (instanceId: number, action: string) => {
    try {
      const res: any = await executeWorkflowAction(instanceId, {
        action,
        comment: ''
      });
      if (res.code === 200) {
        showToastMessage(`${action === 'approve' ? '审批通过' : '审批拒绝'}`, 'success');
        loadInstances();
      }
    } catch (error) {
      console.error('审批失败:', error);
      showToastMessage('审批失败', 'error');
    }
  };

  const workflowTypeLabels: Record<string, string> = {
    inspection: '检验审核',
    report: '报告签发',
    deviation: '偏差调查',
    approval: '审批流程'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    processing: '进行中',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
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
        <h1 className="text-2xl font-bold text-gray-900">工作流管理</h1>
        {activeTab === 'definitions' && (
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新建工作流
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'definitions', label: '工作流定义' },
            { key: 'instances', label: '工作流实例' }
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

      {activeTab === 'definitions' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作流编码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作流名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workflow.workflow_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{workflow.workflow_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {workflowTypeLabels[workflow.workflow_type || ''] || workflow.workflow_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.is_active ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartWorkflow(workflow.id!)}
                        className="text-green-600 hover:text-green-900"
                        title="启动工作流"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(workflow)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(workflow.id!)}
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

      {activeTab === 'instances' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作流</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业务类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业务ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instances.map((instance) => (
                <tr key={instance.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{instance.workflow_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instance.business_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instance.business_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[instance.status || '']}`}>
                      {statusLabels[instance.status || '']}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instance.created_at ? new Date(instance.created_at).toLocaleString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewHistory(instance)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看历史"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      {instance.status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleApprove(instance.id!, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="批准"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(instance.id!, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="拒绝"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === 'create' ? '新建工作流' : 
               modalType === 'edit' ? '编辑工作流' : 
               '工作流历史'}
            </h2>

            {modalType === 'view-history' ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">执行历史</h3>
                  {historyData.map((record, index) => (
                    <div key={record.id} className="flex items-start gap-4 py-2 border-b last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{record.node_name}</span>
                          <span className="text-sm text-gray-500">
                            {record.action === 'submit' ? '提交' :
                             record.action === 'approve' ? '批准' :
                             record.action === 'reject' ? '拒绝' :
                             record.action === 'return' ? '退回' : record.action}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          操作人: {record.operator_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          操作时间: {new Date(record.created_at!).toLocaleString()}
                        </div>
                        {record.comment && (
                          <div className="text-sm text-gray-700 mt-1">
                            意见: {record.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    关闭
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工作流编码</label>
                    <input
                      type="text"
                      value={formData.workflow_code}
                      onChange={(e) => setFormData({ ...formData, workflow_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={modalType === 'edit'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工作流名称</label>
                    <input
                      type="text"
                      value={formData.workflow_name}
                      onChange={(e) => setFormData({ ...formData, workflow_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工作流类型</label>
                    <select
                      value={formData.workflow_type}
                      onChange={(e) => setFormData({ ...formData, workflow_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="inspection">检验审核</option>
                      <option value="report">报告签发</option>
                      <option value="deviation">偏差调查</option>
                      <option value="approval">审批流程</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select
                      value={formData.is_active ? '1' : '0'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="1">启用</option>
                      <option value="0">停用</option>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;
