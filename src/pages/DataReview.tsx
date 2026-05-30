import { useEffect, useState } from 'react';
import { Search, Eye, Check, X, FileText, Clock } from 'lucide-react';
import { 
  getPendingReviews, 
  getReviewHistory, 
  createReview, 
  executeReview, 
  approveResult,
  type PendingReviewResult,
  type ReviewHistory 
} from '../services/dataReview';

export default function DataReview() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PendingReviewResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  
  // 详情弹窗
  const [showDetail, setShowDetail] = useState(false);
  const [currentResult, setCurrentResult] = useState<PendingReviewResult | null>(null);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistory[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPendingReviews({ page, pageSize, status, keyword });
      if (res.data.code === 200) {
        setResults(res.data.data.list);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id: number) => {
    try {
      const res = await getReviewHistory(id);
      if (res.data.code === 200) {
        setReviewHistory(res.data.data);
      }
    } catch (error) {
      console.error('加载历史失败:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, status]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleViewDetail = async (item: PendingReviewResult) => {
    setCurrentResult(item);
    await loadHistory(item.id);
    setShowDetail(true);
  };

  const handleStartReview = async (item: PendingReviewResult) => {
    try {
      await createReview({
        inspection_result_id: item.id,
        review_type: 'review',
        review_comment: ''
      });
      alert('已开始复核');
      loadData();
    } catch (error) {
      console.error('开始复核失败:', error);
    }
  };

  const handleDoReview = (reviewId: number) => {
    setCurrentReviewId(reviewId);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!currentReviewId) return;
    try {
      await executeReview(currentReviewId, {
        review_status: 'approved',
        review_comment: reviewComment
      });
      setShowReviewModal(false);
      if (currentResult) {
        await loadHistory(currentResult.id);
      }
      loadData();
    } catch (error) {
      console.error('批准失败:', error);
    }
  };

  const handleReject = async () => {
    if (!currentReviewId) return;
    try {
      await executeReview(currentReviewId, {
        review_status: 'rejected',
        review_comment: reviewComment
      });
      setShowReviewModal(false);
      if (currentResult) {
        await loadHistory(currentResult.id);
      }
      loadData();
    } catch (error) {
      console.error('拒绝失败:', error);
    }
  };

  const handleFinalApprove = async (id: number) => {
    if (!confirm('确定要最终批准该结果吗？')) return;
    try {
      await approveResult(id);
      alert('批准成功');
      loadData();
    } catch (error) {
      console.error('最终批准失败:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      pending: { text: '待复核', class: 'bg-yellow-100 text-yellow-700' },
      reviewing: { text: '复核中', class: 'bg-blue-100 text-blue-700' },
      reviewed: { text: '已复核', class: 'bg-green-100 text-green-700' },
      approved: { text: '已批准', class: 'bg-emerald-100 text-emerald-700' }
    };
    return map[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">数据复核</h1>
      </div>

      {/* 搜索区域 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索样品号、检验项目..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">全部状态</option>
            <option value="pending">待复核</option>
            <option value="reviewing">复核中</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            搜索
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">样品</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检验项目</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检验值</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检验人</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                results.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.task_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{item.sample_no}</div>
                      <div className="text-gray-500">{item.sample_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.test_item}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={item.is_oos ? 'text-red-600 font-medium' : 'text-gray-900'}>
                        {item.test_value}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.tester_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status).class}`}>
                        {getStatusBadge(item.status).text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.created_at}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          详情
                        </button>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleStartReview(item)}
                            className="text-teal-600 hover:text-teal-800 flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            开始复核
                          </button>
                        )}
                        {item.status === 'reviewed' && (
                          <button
                            onClick={() => handleFinalApprove(item.id)}
                            className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            最终批准
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {total} 条记录
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-gray-700">第 {page} 页</span>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {showDetail && currentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">检验结果详情</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">任务编号</label>
                  <div className="mt-1 text-gray-900">{currentResult.task_no}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">样品</label>
                  <div className="mt-1 text-gray-900">{currentResult.sample_no} - {currentResult.sample_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">检验项目</label>
                  <div className="mt-1 text-gray-900">{currentResult.test_item}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">检验值</label>
                  <div className={`mt-1 ${currentResult.is_oos ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {currentResult.test_value}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">检验人</label>
                  <div className="mt-1 text-gray-900">{currentResult.tester_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">状态</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(currentResult.status).class}`}>
                      {getStatusBadge(currentResult.status).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* 复核历史 */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">复核历史</h3>
                {reviewHistory.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">暂无复核记录</div>
                ) : (
                  <div className="space-y-3">
                    {reviewHistory.map((h, idx) => (
                      <div key={h.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-900 font-medium">{h.reviewer_name}</span>
                            <span className="text-sm text-gray-500">{h.created_at}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              h.review_status === 'approved' ? 'bg-green-100 text-green-700' :
                              h.review_status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {h.review_status === 'approved' ? '已批准' :
                               h.review_status === 'rejected' ? '已拒绝' : '待处理'}
                            </span>
                          </div>
                          {h.review_status === 'pending' && (
                            <button
                              onClick={() => handleDoReview(h.id)}
                              className="text-teal-600 hover:text-teal-800 flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              处理
                            </button>
                          )}
                        </div>
                        {h.review_comment && (
                          <div className="text-sm text-gray-700 mt-2">
                            <strong>复核意见：</strong>{h.review_comment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 复核处理弹窗 */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">处理复核</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">复核意见</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="请输入复核意见..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                拒绝
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                批准
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
