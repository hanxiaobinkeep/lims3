import { useEffect, useState } from 'react';
import { getPlanList, createPlan, updatePlan, removePlan, getSampleList, createSample, updateSample, removeSample } from '../services/environment';
import { Plus, Search, Edit2, Trash2, X, ClipboardList, Droplets } from 'lucide-react';

interface EnvPlan {
  id: number;
  plan_no: string;
  plan_name: string;
  monitor_type: string;
  monitor_points: string;
  frequency: string;
  status: string;
  created_at: string;
}

interface EnvSample {
  id: number;
  sample_no: string;
  plan_id: number;
  plan_name: string;
  monitor_type: string;
  sample_point: string;
  sample_date: string;
  sampler_name: string;
  status: string;
  created_at: string;
}

export default function EnvironmentPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'samples'>('plans');

  // Plans state
  const [plans, setPlans] = useState<EnvPlan[]>([]);
  const [planPage, setPlanPage] = useState(1);
  const [planTotal, setPlanTotal] = useState(0);
  const [planKeyword, setPlanKeyword] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planForm, setPlanForm] = useState({ planName: '', monitorType: 'air', monitorPoints: '', frequency: '' });

  // Samples state
  const [samples, setSamples] = useState<EnvSample[]>([]);
  const [samplePage, setSamplePage] = useState(1);
  const [sampleTotal, setSampleTotal] = useState(0);
  const [sampleKeyword, setSampleKeyword] = useState('');
  const [sampleLoading, setSampleLoading] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [editingSampleId, setEditingSampleId] = useState<number | null>(null);
  const [sampleForm, setSampleForm] = useState({ planId: '', samplePoint: '', sampleDate: '', samplerId: '' });

  const pageSize = 10;

  useEffect(() => {
    if (activeTab === 'plans') loadPlans();
    else loadSamples();
  }, [activeTab, planPage, planKeyword, samplePage, sampleKeyword]);

  const loadPlans = async () => {
    setPlanLoading(true);
    try {
      const res: any = await getPlanList({ page: planPage, pageSize, keyword: planKeyword });
      if (res.code === 200) {
        setPlans(res.data.list);
        setPlanTotal(res.data.total);
      }
    } catch (error) { console.error(error); }
    finally { setPlanLoading(false); }
  };

  const loadSamples = async () => {
    setSampleLoading(true);
    try {
      const res: any = await getSampleList({ page: samplePage, pageSize, keyword: sampleKeyword });
      if (res.code === 200) {
        setSamples(res.data.list);
        setSampleTotal(res.data.total);
      }
    } catch (error) { console.error(error); }
    finally { setSampleLoading(false); }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlanId) await updatePlan(editingPlanId, planForm);
      else await createPlan(planForm);
      setShowPlanModal(false);
      setEditingPlanId(null);
      setPlanForm({ planName: '', monitorType: 'air', monitorPoints: '', frequency: '' });
      loadPlans();
    } catch (error) { console.error(error); }
  };

  const handleSampleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSampleId) await updateSample(editingSampleId, { ...sampleForm, status: 'pending' });
      else await createSample(sampleForm);
      setShowSampleModal(false);
      setEditingSampleId(null);
      setSampleForm({ planId: '', samplePoint: '', sampleDate: '', samplerId: '' });
      loadSamples();
    } catch (error) { console.error(error); }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('确定删除该监测计划？')) return;
    try { await removePlan(id); loadPlans(); } catch (error) { console.error(error); }
  };

  const handleDeleteSample = async (id: number) => {
    if (!confirm('确定删除该样品记录？')) return;
    try { await removeSample(id); loadSamples(); } catch (error) { console.error(error); }
  };

  const getMonitorTypeText = (type: string) => {
    const map: Record<string, string> = { air: '空气', water: '水', surface: '表面', personnel: '人员' };
    return map[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      active: { text: '有效', class: 'bg-green-100 text-green-700' },
      inactive: { text: '无效', class: 'bg-gray-100 text-gray-700' },
      pending: { text: '待检', class: 'bg-yellow-100 text-yellow-700' },
      tested: { text: '已检验', class: 'bg-blue-100 text-blue-700' },
      reviewed: { text: '已复核', class: 'bg-purple-100 text-purple-700' }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">环境监测</h1>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'plans' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <ClipboardList className="w-4 h-4" />
            监测计划
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'samples' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Droplets className="w-4 h-4" />
            样品登记
          </button>
        </div>
      </div>

      {activeTab === 'plans' ? (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={planKeyword}
                onChange={(e) => setPlanKeyword(e.target.value)}
                placeholder="搜索计划编号、名称..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <button
              onClick={() => { setEditingPlanId(null); setPlanForm({ planName: '', monitorType: 'air', monitorPoints: '', frequency: '' }); setShowPlanModal(true); }}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建计划
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">计划编号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">计划名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">监测类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">监测点位</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">频率</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {planLoading ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div></td></tr>
                  ) : plans.length > 0 ? plans.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.plan_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.plan_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{getMonitorTypeText(item.monitor_type)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.monitor_points}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.frequency}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingPlanId(item.id); setPlanForm({ planName: item.plan_name, monitorType: item.monitor_type, monitorPoints: item.monitor_points || '', frequency: item.frequency || '' }); setShowPlanModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeletePlan(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {planTotal > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">共 {planTotal} 条记录，第 {planPage} 页</span>
                <div className="flex gap-2">
                  <button onClick={() => setPlanPage(p => Math.max(1, p - 1))} disabled={planPage === 1} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50">上一页</button>
                  <button onClick={() => setPlanPage(p => p + 1)} disabled={planPage * pageSize >= planTotal} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50">下一页</button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={sampleKeyword}
                onChange={(e) => setSampleKeyword(e.target.value)}
                placeholder="搜索样品编号、采样点位..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <button
              onClick={() => { setEditingSampleId(null); setSampleForm({ planId: '', samplePoint: '', sampleDate: '', samplerId: '' }); setShowSampleModal(true); }}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              登记样品
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品编号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">所属计划</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">监测类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">采样点位</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">采样日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">采样人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleLoading ? (
                    <tr><td colSpan={8} className="px-6 py-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div></td></tr>
                  ) : samples.length > 0 ? samples.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.sample_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.plan_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{getMonitorTypeText(item.monitor_type)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.sample_point}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.sample_date}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.sampler_name}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingSampleId(item.id); setSampleForm({ planId: String(item.plan_id || ''), samplePoint: item.sample_point || '', sampleDate: item.sample_date || '', samplerId: '' }); setShowSampleModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteSample(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {sampleTotal > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">共 {sampleTotal} 条记录，第 {samplePage} 页</span>
                <div className="flex gap-2">
                  <button onClick={() => setSamplePage(p => Math.max(1, p - 1))} disabled={samplePage === 1} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50">上一页</button>
                  <button onClick={() => setSamplePage(p => p + 1)} disabled={samplePage * pageSize >= sampleTotal} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50">下一页</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingPlanId ? '编辑计划' : '新建计划'}</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handlePlanSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">计划名称</label>
                <input type="text" value={planForm.planName} onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">监测类型</label>
                <select value={planForm.monitorType} onChange={(e) => setPlanForm({ ...planForm, monitorType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="air">空气</option>
                  <option value="water">水</option>
                  <option value="surface">表面</option>
                  <option value="personnel">人员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">监测点位</label>
                <textarea value={planForm.monitorPoints} onChange={(e) => setPlanForm({ ...planForm, monitorPoints: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} placeholder="如：洁净区A、B、C..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">监测频率</label>
                <input type="text" value={planForm.frequency} onChange={(e) => setPlanForm({ ...planForm, frequency: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="如：每周一次、每月一次" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg">{editingPlanId ? '保存' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sample Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingSampleId ? '编辑样品' : '登记样品'}</h2>
              <button onClick={() => setShowSampleModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSampleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">计划ID</label>
                <input type="number" value={sampleForm.planId} onChange={(e) => setSampleForm({ ...sampleForm, planId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">采样点位</label>
                <input type="text" value={sampleForm.samplePoint} onChange={(e) => setSampleForm({ ...sampleForm, samplePoint: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">采样日期</label>
                <input type="date" value={sampleForm.sampleDate} onChange={(e) => setSampleForm({ ...sampleForm, sampleDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">采样人ID</label>
                <input type="number" value={sampleForm.samplerId} onChange={(e) => setSampleForm({ ...sampleForm, samplerId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowSampleModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg">{editingSampleId ? '保存' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
