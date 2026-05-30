import { useEffect, useState } from 'react';
import { getList, create, update, updatePermissions, remove } from '../services/role';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Save
} from 'lucide-react';

interface Role {
  id: number;
  role_code: string;
  role_name: string;
  description: string;
  permissions: any;
  status: string;
  created_at: string;
}

const permissionGroups = [
  {
    group: '样品管理',
    permissions: [
      { key: 'samples:view', label: '查看样品' },
      { key: 'samples:create', label: '创建样品' },
      { key: 'samples:edit', label: '编辑样品' },
      { key: 'samples:delete', label: '删除样品' }
    ]
  },
  {
    group: '检验管理',
    permissions: [
      { key: 'inspection:view', label: '查看检验' },
      { key: 'inspection:request', label: '请验管理' },
      { key: 'inspection:task', label: '任务管理' },
      { key: 'inspection:result', label: '结果录入' },
      { key: 'inspection:review', label: '数据复核' },
      { key: 'inspection:report', label: '报告管理' }
    ]
  },
  {
    group: '资源管理',
    permissions: [
      { key: 'materials:view', label: '查看物料' },
      { key: 'materials:manage', label: '物料管理' },
      { key: 'instruments:view', label: '查看仪器' },
      { key: 'instruments:manage', label: '仪器管理' },
      { key: 'methods:view', label: '查看方法' },
      { key: 'methods:manage', label: '方法管理' }
    ]
  },
  {
    group: '质量管理',
    permissions: [
      { key: 'quality:stability', label: '稳定性研究' },
      { key: 'quality:environment', label: '环境监测' },
      { key: 'quality:deviation', label: '偏差调查' }
    ]
  },
  {
    group: '系统管理',
    permissions: [
      { key: 'system:users', label: '用户管理' },
      { key: 'system:roles', label: '角色管理' },
      { key: 'system:logs', label: '系统日志' },
      { key: 'system:data', label: '数据管理' },
      { key: 'system:settings', label: '系统设置' }
    ]
  }
];

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    roleCode: '',
    roleName: '',
    description: ''
  });
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res: any = await getList();
      if (res?.code === 200) {
        setRoles(res?.data);
      }
    } catch (error) {
      console.error('加载角色失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.roleCode || !formData.roleName) {
      alert('请填写角色编码和名称');
      return;
    }

    if (editingId) {
      console.log('更新角色:', editingId, formData);
    } else {
      console.log('创建角色:', formData);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (role: Role) => {
    setEditingId(role.id);
    setFormData({
      roleCode: role.role_code,
      roleName: role.role_name,
      description: role.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('确定要删除这个角色吗？')) return;
    console.log('删除角色:', id);
  };

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    const currentPermissions = role.permissions;
    if (typeof currentPermissions === 'string') {
      try {
        setPermissions(JSON.parse(currentPermissions));
      } catch {
        setPermissions(currentPermissions === '*' ? ['*'] : []);
      }
    } else if (Array.isArray(currentPermissions)) {
      setPermissions(currentPermissions);
    } else {
      setPermissions([]);
    }
    setShowPermissionModal(true);
  };

  const togglePermission = (key: string) => {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const toggleGroupPermission = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every(p => permissions.includes(p));
    if (allSelected) {
      setPermissions(prev => prev.filter(p => !groupPermissions.includes(p)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...groupPermissions])]);
    }
  };

  const handleSavePermissions = () => {
    console.log('保存权限:', selectedRole?.id, permissions);
    setShowPermissionModal(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ roleCode: '', roleName: '', description: '' });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">启用</span>
      : <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">禁用</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">权限管理</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建角色
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">角色编码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">角色名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                    暂无角色数据
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{role.role_code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{role.role_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{role.description || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(role.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPermissions(role)}
                          className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                          title="权限配置"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? '编辑角色' : '新建角色'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  角色编码 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roleCode}
                  onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="例如：admin, analyst, viewer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  角色名称 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="例如：系统管理员、检验员、观察员"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                  placeholder="请输入角色描述..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                权限配置 - {selectedRole.role_name}
              </h2>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-6">
                {permissionGroups.map(group => (
                  <div key={group.group} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-800">{group.group}</h3>
                      <button
                        onClick={() => toggleGroupPermission(group.permissions.map(p => p.key))}
                        className={`px-3 py-1 text-xs rounded ${
                          group.permissions.every(p => permissions.includes(p.key))
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {group.permissions.every(p => permissions.includes(p.key)) ? '取消全选' : '全选'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {group.permissions.map(perm => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissions.includes(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                          />
                          <span className="text-sm text-slate-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
