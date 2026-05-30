import React, { useState, useEffect } from 'react';
import {
  getDocumentCategories,
  getDocuments,
  createDocument,
  updateDocument,
  reviewDocument,
  approveDocument
} from '../services/document.js';

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    category_id: '',
    status: ''
  });

  useEffect(() => {
    loadCategories();
    loadDocuments();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await getDocumentCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await getDocuments(filters);
      setDocuments(response.data.list);
    } catch (error) {
      console.error('加载文件列表失败:', error);
    }
  };

  const handleCreate = () => {
    setCurrentDocument(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (doc) => {
    setCurrentDocument(doc);
    setModalType('edit');
    setShowModal(true);
  };

  const handleReview = (doc) => {
    setCurrentDocument(doc);
    setModalType('review');
    setShowModal(true);
  };

  const handleApprove = (doc) => {
    setCurrentDocument(doc);
    setModalType('approve');
    setShowModal(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (modalType === 'create') {
        await createDocument(data);
      } else if (modalType === 'edit') {
        await updateDocument(currentDocument.id, data);
      } else if (modalType === 'review') {
        await reviewDocument(currentDocument.id, data);
      } else if (modalType === 'approve') {
        await approveDocument(currentDocument.id);
      }
      setShowModal(false);
      alert('操作成功');
      loadDocuments();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'draft': '草稿',
      'reviewed': '已审核',
      'approved': '已批准',
      'obsolete': '已作废'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'draft': 'bg-gray-100 text-gray-800',
      'reviewed': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'obsolete': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">文件管理</h1>
        <p className="text-gray-600 mt-1">管理实验室质量管理体系文件</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              文件列表
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              文件分类
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'documents' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索文件名称或编号"
                  value={filters.keyword}
                  onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                  className="px-4 py-2 border rounded-lg flex-1 min-w-64"
                />
                <select
                  value={filters.category_id}
                  onChange={(e) => setFilters({...filters, category_id: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">全部分类</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">全部状态</option>
                  <option value="draft">草稿</option>
                  <option value="reviewed">已审核</option>
                  <option value="approved">已批准</option>
                  <option value="obsolete">已作废</option>
                </select>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + 新增文件
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文件编号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文件名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">编制人</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">生效日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{doc.document_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.document_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.version}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(doc.status)}`}>
                            {getStatusText(doc.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.author_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.effective_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button onClick={() => handleEdit(doc)} className="text-blue-600 hover:text-blue-900">编辑</button>
                          {doc.status === 'draft' && (
                            <button onClick={() => handleReview(doc)} className="text-green-600 hover:text-green-900">审核</button>
                          )}
                          {doc.status === 'reviewed' && (
                            <button onClick={() => handleApprove(doc)} className="text-purple-600 hover:text-purple-900">批准</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setModalType('category');
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + 新增分类
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{cat.category_name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{cat.category_code}</span>
                    </div>
                    <p className="text-sm text-gray-600">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <DocumentModal
          type={modalType}
          document={currentDocument}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const DocumentModal = ({ type, document, categories, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    document_code: '',
    document_name: '',
    category_id: '',
    document_type: '',
    version: '1.0',
    content: '',
    effective_date: '',
    expiry_date: '',
    distribution_scope: '',
    remark: '',
    review_result: 'approved',
    review_comment: ''
  });

  useEffect(() => {
    if (document && (type === 'edit' || type === 'review')) {
      setFormData({
        ...document,
        review_result: 'approved',
        review_comment: ''
      });
    }
  }, [document, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTitle = () => {
    switch (type) {
      case 'create': return '新增文件';
      case 'edit': return '编辑文件';
      case 'review': return '文件审核';
      case 'approve': return '文件批准';
      case 'category': return '新增分类';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {(type === 'create' || type === 'edit') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">文件编号 *</label>
                <input
                  type="text"
                  value={formData.document_code}
                  onChange={(e) => setFormData({...formData, document_code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">文件名称 *</label>
                <input
                  type="text"
                  value={formData.document_name}
                  onChange={(e) => setFormData({...formData, document_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">文件分类</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">请选择</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">文件内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生效日期</label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">失效日期</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">发放范围</label>
                <input
                  type="text"
                  value={formData.distribution_scope}
                  onChange={(e) => setFormData({...formData, distribution_scope: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type === 'review' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{document?.document_name}</h3>
                <p className="text-sm text-gray-600">编号: {document?.document_code}</p>
                <p className="text-sm text-gray-600">版本: {document?.version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">审核结果</label>
                <select
                  value={formData.review_result}
                  onChange={(e) => setFormData({...formData, review_result: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="approved">通过</option>
                  <option value="rejected">退回</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">审核意见</label>
                <textarea
                  value={formData.review_comment}
                  onChange={(e) => setFormData({...formData, review_comment: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {type === 'approve' && (
            <div className="text-center py-8">
              <p className="text-lg text-gray-700 mb-4">确定要批准文件 "{document?.document_name}" 吗？</p>
              <p className="text-sm text-gray-500">批准后文件将生效，请确认内容无误。</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentManagement;
