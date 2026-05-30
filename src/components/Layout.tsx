import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getUnreadCount } from '../stores/notificationStore';
import {
  LayoutDashboard,
  FlaskConical,
  ClipboardList,
  Beaker,
  Microscope,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Thermometer,
  Upload,
  Bell,
  PenTool,
  ClipboardCheck
} from 'lucide-react';

const menuItems = [
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    label: '仪表盘',
    path: '/dashboard'
  },
  {
    key: 'samples',
    icon: FlaskConical,
    label: '样品管理',
    children: [
      { key: 'request', label: '请验管理', path: '/samples/request' },
      { key: 'sampling', label: '取样管理', path: '/samples/sampling' },
      { key: 'receive', label: '样品接收', path: '/samples/receive' }
    ]
  },
  {
    key: 'inspection',
    icon: ClipboardList,
    label: '检验管理',
    children: [
      { key: 'tasks', label: '检验任务', path: '/inspection/tasks' },
      { key: 'entry', label: '结果录入', path: '/inspection/entry' },
      { key: 'review', label: '数据复核', path: '/inspection/review' },
      { key: 'reports', label: '检验报告', path: '/inspection/reports' }
    ]
  },
  {
    key: 'quality',
    icon: ShieldCheck,
    label: '质量管理',
    children: [
      { key: 'stability', label: '稳定性管理', path: '/quality/stability' },
      { key: 'environment', label: '环境监测', path: '/quality/environment' },
      { key: 'deviation', label: '偏差调查', path: '/quality/deviation' },
      { key: 'quality-control', label: '质量控制图', path: '/quality/control' }
    ]
  },
  {
    key: 'resources',
    icon: Beaker,
    label: '资源管理',
    children: [
      { key: 'materials', label: '物料管理', path: '/resources/materials' },
      { key: 'instruments', label: '仪器设备', path: '/resources/instruments' },
      { key: 'methods', label: '方法管理', path: '/resources/methods' },
      { key: 'reference-materials', label: '标准物质', path: '/resources/reference-materials' },
      { key: 'reagents', label: '试剂耗材', path: '/resources/reagents' },
      { key: 'suppliers', label: '供应商管理', path: '/resources/suppliers' },
      { key: 'storage-locations', label: '存样地点', path: '/resources/storage-locations' },
      { key: 'culture-media', label: '培养基管理', path: '/resources/culture-media' }
    ]
  },
  {
    key: 'quality-assurance',
    icon: ShieldCheck,
    label: '质量保证',
    children: [
      { key: 'proficiency-testing', label: '能力验证', path: '/quality-assurance/proficiency-testing' },
      { key: 'intermediate-check', label: '期间核查', path: '/quality-assurance/intermediate-check' },
      { key: 'validation', label: '验证管理', path: '/quality-assurance/validation' }
    ]
  },
  {
    key: 'statistics',
    icon: LayoutDashboard,
    label: '统计报表',
    path: '/statistics'
  },
  {
    key: 'documents',
    icon: PenTool,
    label: '文件管理',
    path: '/documents'
  },
  {
    key: 'system',
    icon: Settings,
    label: '系统管理',
    children: [
      { key: 'users', label: '用户管理', path: '/system/users' },
      { key: 'personnel', label: '人员管理', path: '/system/personnel' },
      { key: 'roles', label: '权限管理', path: '/system/roles' },
      { key: 'signature', label: '电子签名', path: '/system/signature' },
      { key: 'workflow', label: '工作流管理', path: '/system/workflow' },
      { key: 'logs', label: '系统日志', path: '/system/logs' },
      { key: 'data', label: '数据导入导出', path: '/system/data' },
      { key: 'backup', label: '数据备份', path: '/system/backup' }
    ]
  }
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['samples', 'resources', 'quality', 'system']);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000); // 每分钟刷新一次
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res: any = await getUnreadCount();
      if (res.data?.code === 200) {
        setUnreadCount(res.data.data.count);
      }
    } catch (error) {
      console.error('加载未读通知数量失败:', error);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-64'} bg-teal-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-teal-700">
          {collapsed ? (
            <FlaskConical className="w-8 h-8" />
          ) : (
            <div className="flex items-center gap-2 px-4">
              <FlaskConical className="w-7 h-7" />
              <span className="text-lg font-bold">LIMS系统</span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {menuItems.map(item => {
            const Icon = item.icon;
            if (item.children) {
              const isExpanded = expandedKeys.includes(item.key);
              return (
                <div key={item.key}>
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className={`w-full flex items-center px-4 py-3 hover:bg-teal-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                  {isExpanded && !collapsed && (
                    <div className="bg-teal-900">
                      {item.children.map(child => (
                        <button
                          key={child.key}
                          onClick={() => navigate(child.path)}
                          className={`w-full text-left px-12 py-2 text-sm hover:bg-teal-700 transition-colors ${
                            isActive(child.path) ? 'bg-teal-600 text-white' : 'text-teal-100'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path!)}
                className={`w-full flex items-center px-4 py-3 hover:bg-teal-700 transition-colors ${collapsed ? 'justify-center' : ''} ${
                  isActive(item.path!) ? 'bg-teal-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-teal-700 p-4">
          {collapsed ? (
            <Users className="w-5 h-5 mx-auto" />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{user?.realName}</div>
                  <div className="text-teal-300 text-xs">{user?.roleName}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="p-1 hover:bg-teal-700 rounded">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <div className="text-sm text-slate-500">
            农药生产企业分析实验室LIMS系统
          </div>
        </div>
      </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
