import React from 'react';
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
  AcademicCapIcon
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

  React.useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
    }
    return () => disconnectSocket();
  }, [user?.id, initSocket, disconnectSocket]);

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Assuming standard login page for professors
  };

  const currentPage = navigation.find(item => location.pathname.includes(item.href))?.name || 'Tableau de bord';

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 font-inter">
      {/* Sidebar (Desktop) - Deep Sea Theme (#0A192F) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72 bg-[#0A192F] border-r border-[#112240] shadow-2xl z-20">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-20 px-6 border-b border-[#112240] bg-[#0A192F]/80 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mr-3">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-outfit font-bold text-white tracking-wide">
                UPF <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#D33682]">PROF</span>
              </span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-6 custom-scrollbar">
              <div className="px-6 mb-4 text-xs font-semibold text-cyan-500/50 uppercase tracking-wider">
                Espace Pédagogique
              </div>
              <nav className="flex-1 px-4 space-y-1.5">
                {navigation.map((item) => {
                  const isActive = location.pathname.includes(item.href);
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={`
                        group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden
                        ${isActive 
                          ? 'text-white shadow-md' 
                          : 'text-slate-400 hover:text-white hover:bg-[#112240]'}
                      `}
                    >
                      {/* Active Background Glow */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-[#D33682]/10 border border-cyan-500/30 rounded-xl" />
                      )}
                      
                      <item.icon 
                        className={`mr-3.5 flex-shrink-0 h-5 w-5 transition-all duration-200 relative z-10 ${
                          isActive ? (item.highlight ? 'text-[#D33682]' : 'text-cyan-400') : 'text-slate-500 group-hover:text-cyan-400/70'
                        }`} 
                        aria-hidden="true" 
                      />
                      <span className="relative z-10">{item.name}</span>
                      
                      {/* Special AI Sparkle */}
                      {item.highlight && isActive && (
                        <div className="absolute right-3 w-2 h-2 rounded-full bg-[#D33682] shadow-[0_0_10px_#D33682] animate-pulse" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-[#112240] bg-[#0A192F]">
              <button 
                onClick={handleLogout}
                className="group flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
            className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 md:hidden"
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
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#112240] to-[#0A192F] hover:from-[#1a365d] hover:to-[#112240] text-white text-sm font-medium rounded-full shadow-md shadow-[#0A192F]/20 transition-all border border-slate-700">
                <SparklesIcon className="w-4 h-4 text-cyan-400" />
                <span>Demander à l'IA</span>
              </button>

              <div className="h-8 w-px bg-slate-200" />
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">Prof. {user?.firstName} {user?.lastName}</p>
                  <p className="text-xs font-medium text-slate-500">{user?.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-100 to-blue-100 border-2 border-white shadow-sm flex items-center justify-center">
                  <UserCircleIcon className="h-8 w-8 text-cyan-600" />
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
