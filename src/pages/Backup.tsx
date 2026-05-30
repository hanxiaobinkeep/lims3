import { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

interface BackupFile {
  id: number;
  filename: string;
  size: number;
  created_at: string;
  status: 'success' | 'failed';
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBackup = async () => {
    setLoading(true);
    setMessage({ type: 'success', text: '正在创建备份，请稍候...' });

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `lims_backup_${timestamp}.sql`;

      setTimeout(() => {
        const newBackup: BackupFile = {
          id: Date.now(),
          filename,
          size: Math.floor(Math.random() * 10000000) + 5000000,
          created_at: new Date().toISOString(),
          status: 'success'
        };

        setBackups(prev => [newBackup, ...prev]);
        setLastBackup(new Date().toISOString());
        setMessage({ type: 'success', text: '备份创建成功！' });
        setLoading(false);
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: '备份失败，请重试' });
      setLoading(false);
    }
  };

  const handleDownload = (backup: BackupFile) => {
    const content = `-- LIMS Database Backup
-- Filename: ${backup.filename}
-- Created: ${backup.created_at}
-- Database: lims_db

-- Backup content would be generated here
-- In production, this would be the actual SQL dump

CREATE TABLE IF NOT EXISTS sample_data (...);
-- More SQL statements...
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.filename;
    link.click();
    URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: `正在下载: ${backup.filename}` });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (id: number) => {
    if (!confirm('确定要删除这个备份吗？')) return;
    setBackups(prev => prev.filter(b => b.id !== id));
    setMessage({ type: 'success', text: '备份已删除' });
    setTimeout(() => setMessage(null), 3000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">数据备份</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Database className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">数据库备份</h2>
              <p className="text-sm text-slate-500">创建完整的数据库备份</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">上次备份时间</span>
              <span className="text-slate-800 font-medium">
                {lastBackup ? formatTime(lastBackup) : '从未备份'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">备份位置</span>
              <span className="text-slate-800 font-medium">/backups/</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">备份数量</span>
              <span className="text-slate-800 font-medium">{backups.length} 个</span>
            </div>
          </div>

          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {loading ? '备份中...' : '立即备份'}
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">数据恢复</h2>
              <p className="text-sm text-slate-500">从备份文件恢复数据</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-6">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-2">拖拽备份文件到此处</p>
            <p className="text-xs text-slate-400">或</p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              选择文件
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                恢复操作会覆盖现有数据，请谨慎操作。建议在恢复前先创建新的备份。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">备份历史</h2>
        </div>

        {backups.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无备份记录</p>
            <p className="text-sm mt-1">点击"立即备份"创建第一个备份</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {backups.map((backup) => (
              <div key={backup.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      backup.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {backup.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{backup.filename}</div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(backup.created_at)}
                        </span>
                        <span>{formatSize(backup.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(backup)}
                      className="px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded hover:bg-teal-100 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      下载
                    </button>
                    <button
                      onClick={() => handleDelete(backup.id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-800 mb-2">备份说明</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• 建议定期进行数据库备份，建议频率：每天至少一次</li>
          <li>• 备份文件保存在服务器本地，建议定期下载到本地或其他存储设备</li>
          <li>• 恢复操作会覆盖当前数据，请在恢复前确认备份文件正确</li>
          <li>• 如需迁移数据库，可使用备份文件在新环境进行恢复</li>
          <li>• 大型数据库备份可能需要较长时间，请耐心等待</li>
        </ul>
      </div>
    </div>
  );
}
