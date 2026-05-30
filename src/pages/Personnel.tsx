import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, GraduationCap, Award } from 'lucide-react';
import {
  getPersonnelList,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  addTraining,
  updateTraining,
  deleteTraining,
  addQualification,
  updateQualification,
  deleteQualification,
  getExpiringSoon,
  type Personnel,
  type TrainingRecord,
  type QualificationCertificate
} from '../services/personnel';

const PersonnelManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'expiring'>('list');
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [expiring, setExpiring] = useState<{
    expiring_trainings: (TrainingRecord & { real_name: string; employee_no: string })[],
    expiring_qualifications: (QualificationCertificate & { real_name: string; employee_no: string })[]
  }>({ expiring_trainings: [], expiring_qualifications: [] });
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel & {
    trainings: TrainingRecord[],
    qualifications: QualificationCertificate[]
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create_personnel' | 'edit_personnel' | 'add_training' | 'add_qualification' | 'edit_training' | 'edit_qualification' | 'view_personnel'>('create_personnel');
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (activeTab === 'list') {
      loadPersonnel();
    } else {
      loadExpiring();
    }
  }, [activeTab]);

  const loadPersonnel = async () => {
    try {
      const res: any = await getPersonnelList();
      if (res.code === 200) {
        setPersonnel(res.data.list || res.data);
      }
    } catch (error) {
      console.error('加载人员列表失败:', error);
    }
  };

  const loadExpiring = async () => {
    try {
      const res: any = await getExpiringSoon();
      if (res.code === 200) {
        setExpiring(res.data);
      }
    } catch (error) {
      console.error('加载即将到期记录失败:', error);
    }
  };

  const loadPersonnelDetail = async (id: number) => {
    try {
      const res: any = await getPersonnelById(id);
      if (res.code === 200) {
        setSelectedPersonnel(res.data);
      }
    } catch (error) {
      console.error('加载人员详情失败:', error);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePersonnel = () => {
    setModalType('create_personnel');
    setFormData({
      employee_no: '',
      real_name: '',
      gender: '',
      phone: '',
      email: '',
      department: '',
      position: '',
      entry_date: new Date().toISOString().split('T')[0],
      status: 'active',
      education: '',
      major: '',
      resume: ''
    });
    setShowModal(true);
  };

  const handleEditPersonnel = (p: Personnel) => {
    setModalType('edit_personnel');
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleViewPersonnel = async (p: Personnel) => {
    await loadPersonnelDetail(p.id!);
    setModalType('view_personnel');
    setShowModal(true);
  };

  const handleAddTraining = (personnelId: number) => {
    setModalType('add_training');
    setFormData({
      personnel_id: personnelId,
      training_name: '',
      training_type: '',
      training_content: '',
      training_date: new Date().toISOString().split('T')[0],
      training_hours: 0,
      trainer: '',
      training_organization: '',
      assessment_method: '',
      assessment_result: '',
      certificate_no: '',
      certificate_date: '',
      valid_until: '',
      certificate_file: '',
      remark: ''
    });
    setShowModal(true);
  };

  const handleAddQualification = (personnelId: number) => {
    setModalType('add_qualification');
    setFormData({
      personnel_id: personnelId,
      certificate_name: '',
      certificate_type: '',
      certificate_no: '',
      certificate_level: '',
      issue_date: '',
      valid_until: '',
      issue_organization: '',
      scope_of_authorization: '',
      status: 'valid',
      certificate_file: '',
      renewal_date: '',
      next_renewal_date: '',
      remark: ''
    });
    setShowModal(true);
  };

  const handleEditTraining = (training: TrainingRecord) => {
    setModalType('edit_training');
    setFormData({ ...training });
    setShowModal(true);
  };

  const handleEditQualification = (qualification: QualificationCertificate) => {
    setModalType('edit_qualification');
    setFormData({ ...qualification });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'create_personnel') {
        const res: any = await createPersonnel(formData);
        if (res.code === 200) {
          showToastMessage('创建成功', 'success');
          loadPersonnel();
          setShowModal(false);
        }
      } else if (modalType === 'edit_personnel') {
        const res: any = await updatePersonnel(formData.id, formData);
        if (res.code === 200) {
          showToastMessage('更新成功', 'success');
          loadPersonnel();
          if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
          setShowModal(false);
        }
      } else if (modalType === 'add_training') {
        const res: any = await addTraining(formData.personnel_id, formData);
        if (res.code === 200) {
          showToastMessage('添加成功', 'success');
          if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
          setShowModal(false);
        }
      } else if (modalType === 'edit_training') {
        const res: any = await updateTraining(formData.id, formData);
        if (res.code === 200) {
          showToastMessage('更新成功', 'success');
          if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
          setShowModal(false);
        }
      } else if (modalType === 'add_qualification') {
        const res: any = await addQualification(formData.personnel_id, formData);
        if (res.code === 200) {
          showToastMessage('添加成功', 'success');
          if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
          setShowModal(false);
        }
      } else if (modalType === 'edit_qualification') {
        const res: any = await updateQualification(formData.id, formData);
        if (res.code === 200) {
          showToastMessage('更新成功', 'success');
          if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      showToastMessage('操作失败', 'error');
    }
  };

  const handleDeletePersonnel = async (id: number) => {
    if (!confirm('确定要删除这个人员吗？')) return;
    try {
      const res: any = await deletePersonnel(id);
      if (res.code === 200) {
        showToastMessage('删除成功', 'success');
        loadPersonnel();
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToastMessage('删除失败', 'error');
    }
  };

  const handleDeleteTraining = async (id: number) => {
    if (!confirm('确定要删除这个培训记录吗？')) return;
    try {
      const res: any = await deleteTraining(id);
      if (res.code === 200) {
        showToastMessage('删除成功', 'success');
        if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToastMessage('删除失败', 'error');
    }
  };

  const handleDeleteQualification = async (id: number) => {
    if (!confirm('确定要删除这个上岗证吗？')) return;
    try {
      const res: any = await deleteQualification(id);
      if (res.code === 200) {
        showToastMessage('删除成功', 'success');
        if (selectedPersonnel) await loadPersonnelDetail(selectedPersonnel.id!);
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToastMessage('删除失败', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    resigned: 'bg-red-100 text-red-800',
    valid: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    revoked: 'bg-yellow-100 text-yellow-800'
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
        <h1 className="text-2xl font-bold text-gray-900">人员管理</h1>
        {activeTab === 'list' && (
          <button
            onClick={handleCreatePersonnel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新增人员
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            人员列表
          </button>
          <button
            onClick={() => setActiveTab('expiring')}
            className={`py-4 border-b-2 font-medium text-sm ${
              activeTab === 'expiring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            即将到期
          </button>
        </nav>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {personnel.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.employee_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.real_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[p.status || '']}`}>
                      {p.status === 'active' ? '在职' : p.status === 'inactive' ? '停用' : '离职'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewPersonnel(p)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleEditPersonnel(p)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeletePersonnel(p.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'expiring' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                即将到期的培训
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">培训名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期至</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiring.expiring_trainings.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.employee_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.real_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.training_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{t.valid_until}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5" />
                即将到期的上岗证
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">证书名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期至</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiring.expiring_qualifications.map((q) => (
                  <tr key={q.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{q.employee_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.real_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.certificate_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{q.valid_until}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && modalType === 'view_personnel' && selectedPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">人员详情</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-gray-500">工号：</span>
                <span className="font-medium">{selectedPersonnel.employee_no}</span>
              </div>
              <div>
                <span className="text-gray-500">姓名：</span>
                <span className="font-medium">{selectedPersonnel.real_name}</span>
              </div>
              <div>
                <span className="text-gray-500">部门：</span>
                <span className="font-medium">{selectedPersonnel.department}</span>
              </div>
              <div>
                <span className="text-gray-500">职位：</span>
                <span className="font-medium">{selectedPersonnel.position}</span>
              </div>
              <div>
                <span className="text-gray-500">状态：</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedPersonnel.status || '']}`}>
                  {selectedPersonnel.status === 'active' ? '在职' : selectedPersonnel.status === 'inactive' ? '停用' : '离职'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  培训记录
                </h3>
                <button
                  onClick={() => handleAddTraining(selectedPersonnel.id!)}
                  className="text-blue-600 text-sm hover:text-blue-900"
                >
                  <Plus className="h-4 w-4 inline" /> 添加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">培训名称</th>
                      <th className="px-4 py-2 text-left">培训日期</th>
                      <th className="px-4 py-2 text-left">培训时长</th>
                      <th className="px-4 py-2 text-left">考核结果</th>
                      <th className="px-4 py-2 text-left">有效期至</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPersonnel.trainings.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-2">{t.training_name}</td>
                        <td className="px-4 py-2">{t.training_date}</td>
                        <td className="px-4 py-2">{t.training_hours}小时</td>
                        <td className="px-4 py-2">{t.assessment_result}</td>
                        <td className="px-4 py-2">{t.valid_until}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditTraining(t)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteTraining(t.id!)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  上岗证管理
                </h3>
                <button
                  onClick={() => handleAddQualification(selectedPersonnel.id!)}
                  className="text-blue-600 text-sm hover:text-blue-900"
                >
                  <Plus className="h-4 w-4 inline" /> 添加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">证书名称</th>
                      <th className="px-4 py-2 text-left">证书编号</th>
                      <th className="px-4 py-2 text-left">发证日期</th>
                      <th className="px-4 py-2 text-left">有效期至</th>
                      <th className="px-4 py-2 text-left">状态</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPersonnel.qualifications.map((q) => (
                      <tr key={q.id}>
                        <td className="px-4 py-2">{q.certificate_name}</td>
                        <td className="px-4 py-2">{q.certificate_no}</td>
                        <td className="px-4 py-2">{q.issue_date}</td>
                        <td className="px-4 py-2">{q.valid_until}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[q.status || '']}`}>
                            {q.status === 'valid' ? '有效' : q.status === 'expired' ? '过期' : '吊销'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditQualification(q)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteQualification(q.id!)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && modalType !== 'view_personnel' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === 'create_personnel' ? '新增人员' :
               modalType === 'edit_personnel' ? '编辑人员' :
               modalType === 'add_training' ? '添加培训记录' :
               modalType === 'edit_training' ? '编辑培训记录' :
               modalType === 'add_qualification' ? '添加上岗证' : '编辑上岗证'}
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              {(modalType === 'create_personnel' || modalType === 'edit_personnel') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工号</label>
                    <input
                      type="text"
                      value={formData.employee_no}
                      onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                    <input
                      type="text"
                      value={formData.real_name}
                      onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">请选择</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">入职日期</label>
                    <input
                      type="date"
                      value={formData.entry_date}
                      onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
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
                      <option value="active">在职</option>
                      <option value="inactive">停用</option>
                      <option value="resigned">离职</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea
                      value={formData.resume}
                      onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              {(modalType === 'add_training' || modalType === 'edit_training') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">培训名称</label>
                    <input
                      type="text"
                      value={formData.training_name}
                      onChange={(e) => setFormData({ ...formData, training_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">培训类型</label>
                    <input
                      type="text"
                      value={formData.training_type}
                      onChange={(e) => setFormData({ ...formData, training_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">培训日期</label>
                    <input
                      type="date"
                      value={formData.training_date}
                      onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">培训时长（小时）</label>
                    <input
                      type="number"
                      value={formData.training_hours}
                      onChange={(e) => setFormData({ ...formData, training_hours: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">考核结果</label>
                    <input
                      type="text"
                      value={formData.assessment_result}
                      onChange={(e) => setFormData({ ...formData, assessment_result: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              {(modalType === 'add_qualification' || modalType === 'edit_qualification') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">证书名称</label>
                    <input
                      type="text"
                      value={formData.certificate_name}
                      onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">证书类型</label>
                    <input
                      type="text"
                      value={formData.certificate_type}
                      onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">证书编号</label>
                    <input
                      type="text"
                      value={formData.certificate_no}
                      onChange={(e) => setFormData({ ...formData, certificate_no: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">发证日期</label>
                    <input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
                      <option value="valid">有效</option>
                      <option value="expired">过期</option>
                      <option value="revoked">吊销</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">授权范围</label>
                    <textarea
                      value={formData.scope_of_authorization}
                      onChange={(e) => setFormData({ ...formData, scope_of_authorization: e.target.value })}
                      rows={2}
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

export default PersonnelManagement;
