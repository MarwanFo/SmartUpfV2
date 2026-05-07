import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  BuildingOffice2Icon,
  AcademicCapIcon,
  UsersIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  RectangleGroupIcon,
  HomeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';

const navigation = [
  { name: 'Vue d\'ensemble', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Établissements', href: '/admin/etablissements', icon: BuildingOffice2Icon },
  { name: 'Filières & LMD', href: '/admin/filieres', icon: AcademicCapIcon },
  { name: 'Modules & UE', href: '/admin/modules', icon: RectangleGroupIcon },
  { name: 'Gestion des Classes', href: '/admin/classes', icon: UserGroupIcon },
  { name: 'Générateur IA', href: '/admin/timetable', icon: CalendarDaysIcon },
  { name: 'Emplois du Temps', href: '/admin/emplois', icon: RectangleGroupIcon },
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: UsersIcon },
  { name: 'Centre de Diffusion', href: '/admin/notifications', icon: BellIcon },
  { name: 'Staff & Personnel', href: '/admin/staff', icon: BriefcaseIcon },
  { name: 'Suivi des Absences', href: '/admin/absences', icon: ExclamationCircleIcon },
  { name: 'Gestion des Notes', href: '/admin/grades', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/admin/parametres', icon: Cog6ToothIcon },
];

const SuperAdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { initSocket, disconnectSocket, unreadCount } = useNotificationsStore();

  React.useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
    }
    return () => disconnectSocket();
  }, [user?.id, initSocket, disconnectSocket]);

  const handleLogout = async () => {
    await logout();
    navigate('/secure-portal-upf-sysadmin');
  };

  const currentPage = navigation.find(item => location.pathname.includes(item.href))?.name || 'Dashboard';

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 font-inter">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72 bg-slate-900 border-r border-slate-800">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-20 px-6 border-b border-slate-800 bg-slate-950">
              <ShieldCheckIcon className="w-8 h-8 text-upf-gold mr-3" />
              <span className="text-xl font-outfit font-bold text-white tracking-wide">SMART<span className="text-upf-gold">ADMIN</span></span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-6">
              <div className="px-6 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Menu Principal
              </div>
              <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => `
                      group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-upf-gold/10 text-upf-gold border border-upf-gold/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors`} aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-slate-800">
              <button 
                onClick={handleLogout}
                className="group flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Déconnexion Sécurisée
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="relative z-10 flex-shrink-0 h-20 bg-white border-b border-slate-200 flex shadow-sm">
          <button
            className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-upf-blue md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 px-8 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-outfit font-bold text-slate-900">{currentPage}</h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 gap-6">
              {/* Search Bar */}
              <div className="hidden sm:flex relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-upf-blue focus:border-transparent sm:text-sm transition-all"
                  placeholder="Rechercher un étudiant, un prof..."
                />
              </div>

              {/* Notifications */}
              <button 
                onClick={() => navigate('/admin/notifications')}
                className="relative bg-white p-2 rounded-full text-slate-400 hover:text-upf-blue hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[8px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile dropdown */}
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-sm font-bold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-upf-gold font-medium mt-1">Super Admin DSI</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-900 border-2 border-slate-200 group-hover:border-upf-gold flex items-center justify-center transition-colors">
                   <UserCircleIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main working area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#f8fafc]">
          <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
