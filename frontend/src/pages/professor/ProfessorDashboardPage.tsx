import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const ProfessorDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, assignRes] = await Promise.all([
          axios.get('http://localhost:3001/api/professor/dashboard'),
          axios.get('http://localhost:3001/api/professor/assignments')
        ]);
        setData(dashRes.data?.data ?? dashRes.data);
        setAssignments(assignRes.data?.data ?? assignRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <ArrowPathIcon className="w-12 h-12 text-cyan-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Chargement de votre espace sécurisé...</p>
      </div>
    );
  }

  const stats = data?.stats || { totalCourses: 0, totalStudents: 0, copiesToGrade: 0, alerts: 0 };
  const todaySessions = data?.todaySessions || [];
  const aiRecommendations = data?.aiRecommendations || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-16">
      {/* Welcome Banner - Redesigned for Premium Look */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#0A192F] rounded-[2.5rem] p-10 border border-white/5"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-[#D33682]/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest mb-6">
              <SparklesIcon className="w-4 h-4" />
              <span>Système Académique UPF v2.0</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white font-outfit mb-4 leading-tight">
              Espace Enseignant <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">— Prof. {user?.lastName}</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-base leading-relaxed">
              Bienvenue sur votre tableau de bord intelligent. Vos habilitations académiques sont synchronisées avec le registre de l'établissement.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col min-w-[120px]">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1">Session</span>
              <span className="text-xl font-bold text-white tracking-tight">2025/2026</span>
            </div>
            <div className="bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 flex flex-col min-w-[120px]">
              <span className="text-xs font-bold text-cyan-400 uppercase mb-1">Semestre</span>
              <span className="text-xl font-bold text-white tracking-tight">Printemps (S2)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Habilitations vs Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Habilitations Section - NEW */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 font-outfit flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
              Habilitations
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Admin Verified</span>
          </div>

          {/* Programs/Filières */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest px-2">
              <BuildingLibraryIcon className="w-4 h-4" />
              Filières assignées
            </div>
            <div className="space-y-2">
              {assignments?.programs?.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-2xl">Aucune filière assignée.</p>
              ) : (
                assignments?.programs?.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors group">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{p.code}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modules Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest px-2">
              <BookOpenIcon className="w-4 h-4" />
              Modules Spécialités
            </div>
            <div className="grid grid-cols-1 gap-2">
              {assignments?.modules?.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-2xl">Aucun module assigné.</p>
              ) : (
                assignments?.modules?.map((m: any) => (
                  <div key={m.id} className="p-3 border border-slate-100 rounded-2xl bg-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <BookOpenIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Section: Today's Schedule and AI */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid - Moved and Optimized */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Cours Actifs', value: stats.totalCourses, icon: CalendarDaysIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Étudiants', value: stats.totalStudents, icon: UserGroupIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} shadow-inner`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-900 font-outfit tracking-tighter">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Today's Planning */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-slate-900 font-outfit">Planning du jour</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                <span className="text-xs font-bold text-slate-400">En direct</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {todaySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                  <CalendarDaysIcon className="w-12 h-12 text-slate-200 mb-2" />
                  <p className="text-sm text-slate-500 font-bold">Aucune séance aujourd'hui</p>
                  <p className="text-[10px] text-slate-400">Prenez ce temps pour préparer vos supports ou corriger les copies.</p>
                </div>
              ) : (
                todaySessions.map((session: any) => (
                  <div key={session.id} className={`flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2rem] border-2 transition-all ${
                    session.isDone 
                      ? 'border-slate-100 bg-slate-50/50 grayscale' 
                      : 'border-cyan-100 bg-gradient-to-r from-cyan-50/50 to-blue-50/30'
                  }`}>
                    <div className="flex flex-row md:flex-col items-center justify-center min-w-[80px] h-20 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
                      <span className="text-sm font-black text-slate-900">{session.startTime}</span>
                      <div className="hidden md:block w-8 h-px bg-slate-200 my-1"></div>
                      <span className="md:hidden mx-2 text-slate-300">→</span>
                      <span className="text-xs font-bold text-slate-400">{session.endTime}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white border border-slate-200 shadow-sm">
                          {session.type}
                        </span>
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-100 text-indigo-700">
                          {session.programName}
                        </span>
                      </div>
                      <h4 className="text-lg font-extrabold text-slate-900 truncate font-outfit">{session.courseName}</h4>
                    </div>

                    <div className="shrink-0">
                      {session.isDone ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-black px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-wider">
                          <CheckCircleIcon className="w-4 h-4" />
                          Effectué
                        </div>
                      ) : (
                        <button className="w-full md:w-auto px-6 py-3 bg-[#0A192F] text-white text-xs font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-cyan-600 transition-all active:scale-95 uppercase tracking-widest">
                          Faire l'appel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* AI Recommendations Section - Added back */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {aiRecommendations.map((rec: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-[2rem] flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{rec.title}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{rec.message}</p>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl self-start hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  {rec.action}
                </button>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboardPage;
