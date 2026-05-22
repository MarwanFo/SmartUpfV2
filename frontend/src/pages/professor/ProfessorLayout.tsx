import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  BookOpenIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  BellAlertIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  UserCircleIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';

const navigation = [
  { name: 'Dashboard', href: '/prof/dashboard', icon: HomeIcon },
  { name: 'Mes Cours', href: '/prof/courses', icon: BookOpenIcon },
  { name: 'Carnet de Notes', href: '/prof/grades', icon: ChartBarSquareIcon },
  { name: 'Émargement', href: '/prof/attendance', icon: ClipboardDocumentCheckIcon },
  { name: 'Calendrier AI', href: '/prof/calendar', icon: CalendarDaysIcon },
  { name: 'Hub QCM', href: '/prof/qcm', icon: PencilSquareIcon },
  { name: 'Notifications', href: '/prof/notifications', icon: BellAlertIcon },
  { name: 'Assistant UPF-IA', href: '/prof/ai', icon: SparklesIcon, highlight: true },
];

const ProfessorLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { initSocket, disconnectSocket } = useNotificationsStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
    }
    return () => disconnectSocket();
  }, [user?.id, initSocket, disconnectSocket]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPage = navigation.find(item => location.pathname.includes(item.href))?.name || 'Tableau de bord';

  const renderNavItems = (onClickExtra?: () => void) => (
    navigation.map((item) => {
      const isActive = location.pathname.includes(item.href);
      return (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onClickExtra}
          className={`
            group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden
            ${isActive 
              ? 'text-white shadow-md bg-white/10' 
              : 'text-slate-300 hover:text-white hover:bg-white/5'}
          `}
        >
          {isActive && (
            <div className="absolute inset-0 border border-white/10 rounded-xl" />
          )}
          
          <item.icon 
            className={`mr-3.5 flex-shrink-0 h-5 w-5 transition-all duration-200 relative z-10 ${
              isActive ? (item.highlight ? 'text-upf-accentLight' : 'text-white') : 'text-slate-400 group-hover:text-white'
            }`} 
            aria-hidden="true" 
          />
          <span className="relative z-10">{item.name}</span>
          
          {item.highlight && isActive && (
            <div className="absolute right-3 w-2 h-2 rounded-full bg-upf-accentLight shadow-[0_0_10px_#c2277a] animate-pulse" />
          )}
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-upf-primary border-r border-upf-primaryLight/20 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            {/* Mobile Nav Content */}
            <div className="flex items-center h-20 px-6 border-b border-white/10 bg-upf-primary/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-upf-primaryLight to-upf-accent flex items-center justify-center shadow-lg shadow-upf-accent/20 mr-3">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-outfit font-bold text-white tracking-wide">
                UPF <span className="text-transparent bg-clip-text bg-gradient-to-r from-upf-primaryLight to-upf-accentLight">PROF</span>
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pt-6 px-4 space-y-1.5 custom-scrollbar">
              {renderNavItems(() => setIsMobileMenuOpen(false))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72 bg-upf-primary border-r border-white/5 shadow-2xl z-20">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-20 px-6 border-b border-white/10 bg-upf-primary/80 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-upf-primaryLight to-upf-accent flex items-center justify-center shadow-lg shadow-upf-accent/20 mr-3">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-outfit font-bold text-white tracking-wide">
                UPF <span className="text-transparent bg-clip-text bg-gradient-to-r from-upf-primaryLight to-upf-accentLight">PROF</span>
              </span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-6 custom-scrollbar">
              <div className="px-6 mb-4 text-xs font-semibold text-white/50 uppercase tracking-wider">
                Espace Pédagogique
              </div>
              <nav className="flex-1 px-4 space-y-1.5">
                {renderNavItems()}
              </nav>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-white/10 bg-upf-primary">
              <button 
                onClick={handleLogout}
                className="group flex w-full items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-semantic-danger/10 hover:text-semantic-danger transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Déconnexion
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
            <h1 className="text-2xl font-extrabold text-slate-900 font-outfit tracking-tight">
              {currentPage}
            </h1>
            
            <div className="flex items-center gap-6">
              {/* Quick AI Button */}
              <button onClick={() => navigate('/prof/ai')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-upf-primary/5 to-upf-accent/5 hover:from-upf-primary/10 hover:to-upf-accent/10 text-upf-primary text-sm font-bold rounded-full shadow-sm transition-all border border-upf-primary/10">
                <SparklesIcon className="w-4 h-4 text-upf-accent" />
                <span>Demander à l'IA</span>
              </button>

              <div className="h-8 w-px bg-slate-200" />
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">Prof. {user?.firstName} {user?.lastName}</p>
                  <p className="text-xs font-medium text-slate-500">{user?.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-upf-primary/10 to-upf-accent/10 border-2 border-white shadow-sm flex items-center justify-center">
                  <UserCircleIcon className="h-8 w-8 text-upf-primary" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 relative overflow-y-auto bg-slate-50/50 focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProfessorLayout;

