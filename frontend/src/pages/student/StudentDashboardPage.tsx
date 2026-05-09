import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BellAlertIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const API = 'http://localhost:3001/api';

interface DashboardData {
  nextClass: {
    moduleName: string;
    room: string;
    startTime: string;
    endTime: string;
    professorName: string;
  } | null;
  pendingAssignments: number;
  recentGrades: { module: string; score: number; date: string }[];
  unreadAnnouncements: number;
  classInfo: string;
}

const StudentDashboardPage: React.FC = () => {
  const { accessToken, user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API}/student/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        // The backend wraps responses in { success: true, data: ... }
        setData(res.data.data || res.data);
      } catch (error) {
        toast.error('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchDashboard();
  }, [accessToken]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1e1b4b] to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-40 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-outfit font-extrabold mb-2">Bonjour, {user?.firstName} 👋</h2>
            <p className="text-indigo-200 font-medium max-w-xl">
              Bienvenue dans votre espace étudiant. Classe : <span className="text-white font-bold">{data?.classInfo}</span>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Moyenne Générale</p>
              <p className="text-3xl font-black text-white">--</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {/* Widget 1: Next Class */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Prochain Cours</h3>
          {data?.nextClass ? (
            <div>
              <p className="text-xl font-black text-slate-900 mb-1">{data.nextClass.moduleName}</p>
              <p className="text-sm font-medium text-indigo-600 mb-4">{data.nextClass.startTime} - {data.nextClass.endTime}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <span className="px-2 py-1 bg-slate-100 rounded-md">{data.nextClass.room}</span>
                <span>• Prof. {data.nextClass.professorName}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 font-medium">Aucun cours prévu aujourd'hui.</p>
          )}
        </motion.div>

        {/* Widget 2: Pending Assignments */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Devoirs à rendre</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{data?.pendingAssignments || 0}</span>
              <span className="text-sm font-medium text-slate-500">en attente</span>
            </div>
          </div>
          <Link to="/student/assignments" className="mt-6 flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 gap-1">
            Voir les devoirs <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Widget 3: Unread Announcements */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <BellAlertIcon className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Annonces</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{data?.unreadAnnouncements || 0}</span>
              <span className="text-sm font-medium text-slate-500">non lues</span>
            </div>
          </div>
          <Link to="/student/courses" className="mt-6 flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 gap-1">
            Voir les annonces <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Widget 4: Recent Grades */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Dernières Notes</h3>
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {data?.recentGrades && data.recentGrades.length > 0 ? (
              data.recentGrades.map((grade, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{grade.module}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{grade.date}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-black ${grade.score >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {grade.score}/20
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 font-medium">Aucune note récente.</p>
            )}
          </div>
          <Link to="/student/grades" className="mt-4 flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 gap-1 pt-4 border-t border-slate-100">
            Voir le carnet <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default StudentDashboardPage;
