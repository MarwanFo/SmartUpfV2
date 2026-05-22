import React, { useState } from 'react';
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
  ChartBarIcon,
  XMarkIcon
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const renderNavItems = (onClickExtra?: () => void) => (
    navigation.map((item) => {
      const isActive = location.pathname.includes(item.href);
      return (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onClickExtra}
          className={`
            group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden
            ${isActive 
              ? 'text-white shadow-md bg-white/10' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'}
          `}
        >
          {isActive && (
            <div className="absolute inset-0 border border-upf-accent/20 bg-upf-accent/10 rounded-xl" />
          )}
          <item.icon 
            className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors relative z-10 ${
              isActive ? 'text-upf-accentLight' : ''
            }`} 
            aria-hidden="true" 
          />
          <span className="relative z-10">{item.name}</span>
        </NavLink>
      );
    })
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 font-inter">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center h-20 px-6 border-b border-slate-800 bg-slate-950">
              <ShieldCheckIcon className="w-8 h-8 text-upf-accent mr-3" />
              <span className="text-xl font-outfit font-bold text-white tracking-wide">SMART<span className="text-upf-accent">ADMIN</span></span>
            </div>
            <div className="flex-1 overflow-y-auto pt-6 px-4 space-y-1 custom-scrollbar">
              {renderNavItems(() => setIsMobileMenuOpen(false))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72 bg-slate-900 border-r border-slate-800 shadow-2xl z-20">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-20 px-6 border-b border-slate-800 bg-slate-950">
              <ShieldCheckIcon className="w-8 h-8 text-upf-accent mr-3" />
              <span className="text-xl font-outfit font-bold text-white tracking-wide">SMART<span className="text-upf-accent">ADMIN</span></span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-6 custom-scrollbar">
              <div className="px-6 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Menu Principal
              </div>
              <nav className="flex-1 px-4 space-y-1">
                {renderNavItems()}
              </nav>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-slate-800">
              <button 
                onClick={handleLogout}
                className="group flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-semantic-danger/10 hover:text-semantic-danger transition-colors"
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
        {/* Top Header - Glassmorphism */}
        <header className="relative z-10 flex-shrink-0 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex shadow-sm">
          <button
            className="px-4 border-r border-slate-200 text-slate-500 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-upf-primary md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 px-8 flex justify-between items-center">
            <h1 className="text-2xl font-outfit font-extrabold text-slate-900 tracking-tight">{currentPage}</h1>
            
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="hidden sm:flex relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary sm:text-sm transition-all"
                  placeholder="Rechercher un étudiant, un prof..."
                />
              </div>

              {/* Notifications */}
              <button 
                onClick={() => navigate('/admin/notifications')}
                className="relative bg-white p-2 rounded-full text-slate-400 hover:text-upf-primary hover:bg-upf-primary/5 transition-colors focus:outline-none border border-slate-100"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full bg-semantic-danger ring-2 ring-white text-[8px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-sm font-bold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-upf-accent font-medium mt-1">Super Admin DSI</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-900 border-2 border-slate-200 hover:border-upf-accent flex items-center justify-center transition-colors">
                   <UserCircleIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main working area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50/50">
          <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

