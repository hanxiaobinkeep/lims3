import { useEffect, useState } from 'react';
import { getList, create, update, approve, remove, generateReport } from '../services/report';
import { getList as getTasks } from '../services/inspectionTask';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileCheck,
  Printer,
  Eye,
  FileText,
  Download
} from 'lucide-react';

interface Report {
  id: number;
  report_no: string;
  task_id: number;
  task_no: string;
  sample_name: string;
  sample_no: string;
  batch_no: string;
  test_item: string;
  content: string;
  status: string;
  issue_date: string;
  issuer_name: string;
  created_at: string;
}

export default function ReportPage() {
  const [data, setData] = useState<Report[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    taskId: '',
    content: ''
  });

  const pageSize = 10;

  useEffect(() => {
    loadData();
    loadTasks();
  }, [page, keyword, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getList({ page, pageSize, keyword, status: statusFilter });
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const res: any = await getTasks({ pageSize: 100, status: 'completed' });
      if (res.code === 200) setTasks(res.data.list);
    } catch (error) {
      console.error('Load tasks error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      taskId: '',
      content: ''
    });
  };

  const handleEdit = (item: Report) => {
    setEditingId(item.id);
    setFormData({
      taskId: String(item.task_id || ''),
      content: item.content || ''
    });
    setShowModal(true);
  };

  const handleApprove = async (id: number) => {
    if (!confirm('确定要批准这份报告吗？')) return;
    try {
      await approve(id);
      loadData();
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这份报告吗？')) return;
    try {
      await remove(id);
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleView = (item: Report) => {
    setSelectedReport(item);
    setShowDetail(true);
  };

  const handleGenerateReport = async () => {
    if (!formData.taskId) {
      alert('请先选择检验任务');
      return;
    }
    setGenerating(true);
    try {
      const res: any = await generateReport(Number(formData.taskId));
      if (res.data.code === 200) {
        setFormData({ ...formData, content: res.data.data.content });
        alert('报告内容已自动生成！');
      }
    } catch (error) {
      console.error('Generate report error:', error);
      alert('生成报告失败');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!selectedReport) return;
    const printContent = selectedReport.content;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>检验报告 - ${selectedReport.report_no}</title>
            <style>
              body { font-family: 'SimSun', serif; padding: 20px; }
              h1 { text-align: center; margin-bottom: 30px; }
              pre { white-space: pre-wrap; line-height: 1.8; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <h1>检验报告</h1>
            <pre>${printContent}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExport = () => {
    if (!selectedReport) return;
    const content = selectedReport.content;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport.report_no}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      draft: { text: '草稿', class: 'bg-gray-100 text-gray-700' },
      pending_review: { text: '待审核', class: 'bg-amber-100 text-amber-700' },
      approved: { text: '已批准', class: 'bg-green-100 text-green-700' },
      rejected: { text: '已驳回', class: 'bg-red-100 text-red-700' }
    };
    const config = map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">检验报告</h1>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建报告
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索报告编号..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending_review">待审核</option>
            <option value="approved">已批准</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">报告编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">任务编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">样品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">检测项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">签发日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">签发人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700 mx-auto"></div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.report_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.task_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{item.sample_name}</div>
                      <div className="text-xs text-slate-400">{item.sample_no}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.test_item}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.issue_date || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.issuer_name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="批准"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">共 {total} 条记录，第 {page} 页</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= total}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? '编辑报告' : '新建报告'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">检验任务</label>
                <select
                  value={formData.taskId}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                >
                  <option value="">请选择任务</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.task_no} - {t.test_item}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">报告内容</label>
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={!formData.taskId || generating}
                    className="px-3 py-1 text-xs bg-teal-50 text-teal-700 rounded hover:bg-teal-100 disabled:opacity-50 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    {generating ? '生成中...' : '自动生成'}
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={10}
                  placeholder="请输入检验报告内容，或点击自动生成从检验结果生成..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg"
                >
                  {editingId ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">检验报告详情</h2>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">报告编号：</span>
                  <span className="font-medium">{selectedReport.report_no}</span>
                </div>
                <div>
                  <span className="text-slate-500">状态：</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <span className="text-slate-500">任务编号：</span>
                  <span>{selectedReport.task_no}</span>
                </div>
                <div>
                  <span className="text-slate-500">检测项目：</span>
                  <span>{selectedReport.test_item}</span>
                </div>
                <div>
                  <span className="text-slate-500">样品名称：</span>
                  <span>{selectedReport.sample_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">批号：</span>
                  <span>{selectedReport.batch_no}</span>
                </div>
                <div>
                  <span className="text-slate-500">签发日期：</span>
                  <span>{selectedReport.issue_date || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">签发人：</span>
                  <span>{selectedReport.issuer_name || '-'}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">报告内容</h3>
                <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedReport.content || '无内容'}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  关闭
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  打印
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
