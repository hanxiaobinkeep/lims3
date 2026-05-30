import { useState } from 'react';
import { Upload, Download, FileText, Table, Database } from 'lucide-react';
import { exportToExcel, exportToJSON, importFromFile } from '../utils/exportImport';
import { getList as getMaterials } from '../services/material';
import { getList as getInstruments } from '../services/instrument';
import { getList as getMethods } from '../services/method';
import { getList as getSamples } from '../services/sample';

interface DataType {
  key: string;
  label: string;
  icon: any;
  exportColumns: Array<{ key: string; title: string }>;
  fetchData: () => Promise<any>;
}

export default function DataManagement() {
  const [selectedType, setSelectedType] = useState<string>('materials');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const dataTypes: DataType[] = [
    {
      key: 'materials',
      label: '物料数据',
      icon: Database,
      exportColumns: [
        { key: 'id', title: 'ID' },
        { key: 'code', title: '物料编码' },
        { key: 'name', title: '物料名称' },
        { key: 'specification', title: '规格' },
        { key: 'unit', title: '单位' },
        { key: 'status', title: '状态' },
        { key: 'created_at', title: '创建时间' }
      ],
      fetchData: async () => {
        const res: any = await getMaterials({ pageSize: 1000 });
        return res.data?.data?.list || [];
      }
    },
    {
      key: 'instruments',
      label: '仪器数据',
      icon: Database,
      exportColumns: [
        { key: 'id', title: 'ID' },
        { key: 'code', title: '仪器编号' },
        { key: 'name', title: '仪器名称' },
        { key: 'model', title: '型号' },
        { key: 'manufacturer', title: '制造商' },
        { key: 'status', title: '状态' },
        { key: 'created_at', title: '创建时间' }
      ],
      fetchData: async () => {
        const res: any = await getInstruments({ pageSize: 1000 });
        return res.data?.data?.list || [];
      }
    },
    {
      key: 'methods',
      label: '方法数据',
      icon: FileText,
      exportColumns: [
        { key: 'id', title: 'ID' },
        { key: 'code', title: '方法编码' },
        { key: 'name', title: '方法名称' },
        { key: 'category', title: '分类' },
        { key: 'version', title: '版本' },
        { key: 'status', title: '状态' },
        { key: 'created_at', title: '创建时间' }
      ],
      fetchData: async () => {
        const res: any = await getMethods({ pageSize: 1000 });
        return res.data?.data?.list || [];
      }
    },
    {
      key: 'samples',
      label: '样品数据',
      icon: Table,
      exportColumns: [
        { key: 'id', title: 'ID' },
        { key: 'sample_no', title: '样品编号' },
        { key: 'sample_name', title: '样品名称' },
        { key: 'batch_no', title: '批号' },
        { key: 'specification', title: '规格' },
        { key: 'status', title: '状态' },
        { key: 'created_at', title: '创建时间' }
      ],
      fetchData: async () => {
        const res: any = await getSamples({ pageSize: 1000 });
        return res.data?.data?.list || [];
      }
    }
  ];

  const handleExport = async (format: 'csv' | 'json') => {
    const dataType = dataTypes.find(t => t.key === selectedType);
    if (!dataType) return;

    try {
      setMessage({ type: 'success', text: '正在导出数据...' });
      const data = await dataType.fetchData();

      if (format === 'csv') {
        exportToExcel(data, dataType.exportColumns, dataType.label);
      } else {
        exportToJSON(data, dataType.label);
      }

      setMessage({ type: 'success', text: '导出成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败，请重试' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const { data, filename } = await importFromFile();

      if (data.length === 0) {
        setMessage({ type: 'error', text: '文件中没有数据' });
        return;
      }

      setMessage({
        type: 'success',
        text: `成功读取 ${data.length} 条数据 (${filename})。请在相应模块中查看和编辑导入的数据。`
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '导入失败' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">数据导入导出</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataTypes.map(type => {
          const Icon = type.icon;
          return (
            <div
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`bg-white p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === type.key
                  ? 'border-teal-600 shadow-lg'
                  : 'border-slate-200 hover:border-teal-400'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  selectedType === type.key ? 'bg-teal-100' : 'bg-slate-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    selectedType === type.key ? 'text-teal-600' : 'text-slate-600'
                  }`} />
                </div>
                <span className="font-medium text-slate-800">{type.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {dataTypes.find(t => t.key === selectedType)?.label} - 导入导出
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Download className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">导出数据</h3>
                <p className="text-sm text-slate-500">将数据导出为 CSV 或 JSON 文件</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                导出 CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                导出 JSON
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">导入数据</h3>
                <p className="text-sm text-slate-500">从 CSV 或 JSON 文件导入数据</p>
              </div>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {importing ? '导入中...' : '选择文件导入'}
            </button>
            <p className="text-xs text-slate-500 mt-2">
              支持格式：.csv, .json
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">使用说明</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• <strong>导出：</strong>点击导出按钮，数据将下载为文件</li>
          <li>• <strong>导入：</strong>点击导入按钮，选择 CSV 或 JSON 文件</li>
          <li>• <strong>CSV格式：</strong>首行为表头，数据行从第二行开始</li>
          <li>• <strong>JSON格式：</strong>使用数组格式 [object1, object2, ...]</li>
          <li>• <strong>注意事项：</strong>导入后请在相应模块中检查和编辑数据</li>
        </ul>
      </div>
    </div>
  );
}
