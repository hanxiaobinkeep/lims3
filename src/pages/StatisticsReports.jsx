import React, { useState, useEffect } from 'react';
import {
  getReportTemplates,
  generateReport,
  getReportInstances,
  getStatisticsConfigs,
  calculateStatistics,
  getStatisticsCategories,
  getDashboardStatistics
} from '../services/statistics.js';

const StatisticsReports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [templates, setTemplates] = useState([]);
  const [instances, setInstances] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    category: ''
  });

  useEffect(() => {
    loadDashboardStats();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplates();
    } else if (activeTab === 'instances') {
      loadInstances();
    } else if (activeTab === 'indicators') {
      loadConfigs();
    }
  }, [activeTab, filters]);

  const loadDashboardStats = async () => {
    try {
      const response = await getDashboardStatistics();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await getReportTemplates(filters);
      setTemplates(response.data.list);
    } catch (error) {
      console.error('加载报表模板失败:', error);
    }
  };

  const loadInstances = async () => {
    try {
      const response = await getReportInstances();
      setInstances(response.data.list);
    } catch (error) {
      console.error('加载报表实例失败:', error);
    }
  };

  const loadConfigs = async () => {
    try {
      const response = await getStatisticsConfigs(filters);
      setConfigs(response.data);
    } catch (error) {
      console.error('加载统计指标失败:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getStatisticsCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const handleGenerateReport = async (template) => {
    try {
      const response = await generateReport({
        template_id: template.id,
        instance_name: `${template.template_name}-${new Date().toLocaleDateString()}`
      });
      alert('报表生成成功');
      loadInstances();
    } catch (error) {
      console.error('生成报表失败:', error);
      alert('生成报表失败');
    }
  };

  const handleCalculate = async (config) => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const response = await calculateStatistics({
        indicator_id: config.id,
        period_start: firstDay.toISOString().split('T')[0],
        period_end: now.toISOString().split('T')[0]
      });
      alert(`计算结果: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('计算统计指标失败:', error);
      alert('计算失败');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">查询统计与报表</h1>
        <p className="text-gray-600 mt-1">查看业务统计数据和生成各类报表</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              仪表盘
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              报表模板
            </button>
            <button
              onClick={() => setActiveTab('instances')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'instances'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              报表实例
            </button>
            <button
              onClick={() => setActiveTab('indicators')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'indicators'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              统计指标
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 关键指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-sm font-medium text-gray-500">本月检验任务</h3>
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.tasks?.total_tasks || 0}</p>
                  <p className="text-xs text-gray-600">
                    已完成: {dashboardStats.tasks?.completed_tasks || 0} | 
                    待处理: {dashboardStats.tasks?.pending_tasks || 0}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-sm font-medium text-gray-500">本月样品统计</h3>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.samples?.total_samples || 0}</p>
                  <p className="text-xs text-gray-600">
                    合格: {dashboardStats.samples?.qualified_samples || 0} | 
                    不合格: {dashboardStats.samples?.unqualified_samples || 0}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-sm font-medium text-gray-500">仪器设备状态</h3>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.instruments?.total_instruments || 0}</p>
                  <p className="text-xs text-gray-600">
                    正常: {dashboardStats.instruments?.normal_instruments || 0}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-sm font-medium text-gray-500">待处理事项</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {(dashboardStats.pending?.pending_reviews || 0) + 
                     (dashboardStats.pending?.pending_deviations || 0) + 
                     (dashboardStats.pending?.pending_alerts || 0)}
                  </p>
                  <p className="text-xs text-gray-600">
                    复核: {dashboardStats.pending?.pending_reviews || 0} | 
                    偏差: {dashboardStats.pending?.pending_deviations || 0} | 
                    预警: {dashboardStats.pending?.pending_alerts || 0}
                  </p>
                </div>
              </div>

              {/* 任务趋势图 */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">最近7天检验任务趋势</h3>
                <div className="flex items-end gap-2 h-32">
                  {dashboardStats.task_trend?.map((item, index) => {
                    const maxCount = Math.max(...(dashboardStats.task_trend?.map(t => t.count) || [1]));
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-blue-500 rounded-t" 
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-gray-600">{item.date?.split('-')[2]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索报表模板"
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
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{template.template_type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <p className="text-xs text-gray-500 mb-4">分类: {template.category}</p>
                    <button
                      onClick={() => handleGenerateReport(template)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      生成报表
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instances' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">实例编码</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">实例名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">模板</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">格式</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">生成人</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">生成时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {instances.map((instance) => (
                      <tr key={instance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{instance.instance_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{instance.instance_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instance.template_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instance.file_format}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instance.generated_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instance.generated_at}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            instance.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {instance.status === 'generated' ? '已生成' : instance.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'indicators' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索统计指标"
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
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {configs.map((config) => (
                  <div key={config.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{config.indicator_name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{config.indicator_type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                    <p className="text-xs text-gray-500 mb-2">计算方法: {config.calculation_method}</p>
                    <p className="text-xs text-gray-500 mb-4">刷新频率: {config.refresh_frequency}</p>
                    <button
                      onClick={() => handleCalculate(config)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      立即计算
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsReports;
