import { useEffect, useState } from 'react';
import {
  PenTool,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  History
} from 'lucide-react';
import {
  getSignatureConfig,
  setupSignature,
  updateSignature,
  getSignatureHistory,
  verifySignature,
  type SignatureConfig,
  type SignatureRecord
} from '../services/electronicSignature';

const signatureTypes = [
  { value: 'approval', label: '批准签名' },
  { value: 'review', label: '复核签名' },
  { value: 'verification', label: '审核签名' },
  { value: 'cancellation', label: '撤销签名' }
];

export default function ElectronicSignaturePage() {
  const [configs, setConfigs] = useState<SignatureConfig[]>([]);
  const [history, setHistory] = useState<SignatureRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [selectedType, setSelectedType] = useState('approval');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signatureImage, setSignatureImage] = useState('');
  const [editingConfig, setEditingConfig] = useState<SignatureConfig | null>(null);
  const [verifyingRecord, setVerifyingRecord] = useState<SignatureRecord | null>(null);

  useEffect(() => {
    loadConfig();
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res: any = await getSignatureConfig();
      if (res?.code === 200) {
        setConfigs(res?.data);
      }
    } catch (error) {
      console.error('加载签名配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res: any = await getSignatureHistory({ pageSize: 50 });
      if (res?.code === 200) {
        setHistory(res?.data.list);
      }
    } catch (error) {
      console.error('加载签名历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (password.length < 6) {
      alert('签名密码至少需要6位');
      return;
    }
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    try {
      await setupSignature({
        signatureType: selectedType,
        signatureImage,
        password
      });
      alert('签名设置成功！');
      setPassword('');
      setConfirmPassword('');
      loadConfig();
    } catch (error) {
      console.error('设置签名失败:', error);
      alert('设置失败，请重试');
    }
  };

  const handleUpdate = async () => {
    if (newPassword && newPassword.length < 6) {
      alert('新签名密码至少需要6位');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }

    try {
      await updateSignature({
        signatureType: selectedType,
        signatureImage,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined
      });
      alert('签名更新成功！');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditingConfig(null);
      loadConfig();
    } catch (error: any) {
      console.error('更新签名失败:', error);
      alert(error.response?.data?.message || '更新失败，请重试');
    }
  };

  const handleVerify = async (record: SignatureRecord) => {
    try {
      const res: any = await verifySignature(record.id);
      if (res?.code === 200) {
        setVerifyingRecord(res?.data);
      }
    } catch (error) {
      console.error('验证签名失败:', error);
    }
  };

  const getConfigByType = (type: string) => {
    return configs.find(c => c.signatureType === type);
  };

  const currentConfig = getConfigByType(selectedType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">电子签名管理</h1>
      </div>

      <div className="bg-white rounded-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          签名设置
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          签名历史
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-md font-semibold text-slate-700 mb-4">签名类型</h3>
              <div className="space-y-2">
                {signatureTypes.map(type => {
                  const config = getConfigByType(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-colors ${
                        selectedType === type.value
                          ? 'bg-teal-100 text-teal-700 border-2 border-teal-500'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-slate-500">
                          {config ? '已配置' : '未配置'}
                        </div>
                      </div>
                      {config && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {currentConfig && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-md font-semibold text-slate-700 mb-4">当前配置</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">签名图片</div>
                    {currentConfig.signatureImage ? (
                      <img
                        src={currentConfig.signatureImage}
                        alt="签名"
                        className="w-32 h-16 object-contain border rounded"
                      />
                    ) : (
                      <div className="text-sm text-slate-400">未设置</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">状态</div>
                    <div className="text-sm font-medium">
                      {currentConfig.isActive ? (
                        <span className="text-green-600">已激活</span>
                      ) : (
                        <span className="text-red-600">未激活</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditingConfig(currentConfig)}
                  className="mt-4 w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  修改配置
                </button>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {editingConfig ? '修改签名配置' : '设置新签名'}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">签名类型</label>
                  <div className="px-4 py-3 bg-slate-100 rounded-lg text-slate-700">
                    {signatureTypes.find(t => t.value === selectedType)?.label}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    签名图片（可选）
                  </label>
                  <input
                    type="text"
                    value={signatureImage}
                    onChange={(e) => setSignatureImage(e.target.value)}
                    placeholder="输入签名图片URL"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    可以上传签名图片或输入图片URL地址
                  </p>
                </div>

                {editingConfig && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      原签名密码 <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="输入原签名密码"
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {editingConfig ? '新签名密码' : '签名密码'} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingConfig ? '不修改请留空' : '输入签名密码（至少6位）'}
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    确认密码 <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="再次输入密码"
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <div className="font-medium mb-1">电子签名说明</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>电子签名用于确认重要操作，需谨慎保管</li>
                          <li>签名密码应与登录密码不同</li>
                          <li>签名具有法律效力，不可抵赖</li>
                          <li>符合GMP、GALP及21 CFR Part 11要求</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {editingConfig && (
                      <button
                        onClick={() => {
                          setEditingConfig(null);
                          setOldPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        取消
                      </button>
                    )}
                    <button
                      onClick={editingConfig ? handleUpdate : handleSetup}
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      {editingConfig ? '保存修改' : '设置签名'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700">签名历史记录</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无签名记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">记录类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">签名类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">签名人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">签名时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">有效性</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">{record.recordType}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {signatureTypes.find(t => t.value === record.signatureType)?.label || record.signatureType}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{record.signerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(record.signedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {record.isValid !== undefined && (
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${
                            record.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.isValid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {record.isValid ? '有效' : '已撤销'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleVerify(record)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          验证
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {verifyingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">签名验证结果</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500">签名人</div>
                  <div className="font-medium">{verifyingRecord.signerName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">签名类型</div>
                  <div className="font-medium">
                    {signatureTypes.find(t => t.value === verifyingRecord.signatureType)?.label}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">签名时间</div>
                  <div className="font-medium">{new Date(verifyingRecord.signedAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">验证结果</div>
                  <div className={`font-medium ${verifyingRecord.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {verifyingRecord.isValid ? '签名有效' : '签名已失效'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">签名哈希</div>
                <div className="text-xs font-mono bg-slate-100 p-2 rounded break-all">
                  {verifyingRecord.signatureHash}
                </div>
              </div>
              {verifyingRecord.remark && (
                <div>
                  <div className="text-xs text-slate-500">备注</div>
                  <div className="text-sm">{verifyingRecord.remark}</div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setVerifyingRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
