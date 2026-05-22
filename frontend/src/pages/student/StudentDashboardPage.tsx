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
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

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
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-upf-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-inter">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-upf-primary via-upf-primaryLight to-[#1e1b4b] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden border border-upf-primaryLight/25"
      >
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-upf-primaryLight/40 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-10 w-64 h-64 bg-upf-accent/35 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider uppercase mb-4">
              🎓 Espace Étudiant
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-outfit font-black mb-2 tracking-tight">Bonjour, {user?.firstName} 👋</h2>
            <p className="text-blue-100/80 text-sm font-medium max-w-xl">
              Bienvenue dans votre portail SMART UPF. Votre classe actuelle : <span className="text-white font-extrabold">{data?.classInfo || 'Non spécifiée'}</span>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shadow-glass min-w-[120px]">
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">Moyenne Générale</p>
              <p className="text-3xl font-black text-white">--</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Bento Widgets */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {/* Widget 1: Next Class */}
        <motion.div variants={itemVariants}>
          <Card hoverable className="h-full relative overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Prochain Cours</h3>
                <div className="w-10 h-10 bg-upf-primary/5 rounded-xl border border-upf-primary/10 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-upf-primary" />
                </div>
              </div>
              {data?.nextClass ? (
                <div>
                  <p className="text-lg font-bold text-slate-800 font-outfit mb-1 tracking-tight leading-snug">{data.nextClass.moduleName}</p>
                  <p className="text-xs font-bold text-upf-primary mb-4">{data.nextClass.startTime} - {data.nextClass.endTime}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
                    <Badge variant="ghost" className="bg-slate-50 border border-slate-200/50 text-slate-600 rounded-md text-[10px]">{data.nextClass.room}</Badge>
                    <span>Prof. {data.nextClass.professorName}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400">Aucun cours prévu aujourd'hui.</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Widget 2: Pending Assignments */}
        <motion.div variants={itemVariants}>
          <Card hoverable className="h-full flex flex-col justify-between border border-slate-100 rounded-2xl bg-white shadow-sm p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Devoirs</h3>
                <div className="w-10 h-10 bg-semantic-danger/5 rounded-xl border border-semantic-danger/10 flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-semantic-danger" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 font-outfit tracking-tight">{data?.pendingAssignments || 0}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">En attente</span>
              </div>
            </div>
            <div className="mt-8 border-t border-slate-50 pt-4">
              <Link to="/student/assignments" className="flex items-center text-xs font-bold text-upf-primary hover:text-upf-primaryLight transition-colors gap-1 group">
                Voir les devoirs <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Widget 3: Unread Announcements */}
        <motion.div variants={itemVariants}>
          <Card hoverable className="h-full flex flex-col justify-between border border-slate-100 rounded-2xl bg-white shadow-sm p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Annonces</h3>
                <div className="w-10 h-10 bg-semantic-warning/5 rounded-xl border border-semantic-warning/10 flex items-center justify-center">
                  <BellAlertIcon className="w-5 h-5 text-semantic-warning" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 font-outfit tracking-tight">{data?.unreadAnnouncements || 0}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Non lues</span>
              </div>
            </div>
            <div className="mt-8 border-t border-slate-50 pt-4">
              <Link to="/student/courses" className="flex items-center text-xs font-bold text-upf-primary hover:text-upf-primaryLight transition-colors gap-1 group">
                Voir les annonces <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Widget 4: Recent Grades */}
        <motion.div variants={itemVariants} className="h-full">
          <Card hoverable className="h-full flex flex-col justify-between border border-slate-100 rounded-2xl bg-white shadow-sm p-6">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Dernières Notes</h3>
                <div className="w-10 h-10 bg-semantic-success/5 rounded-xl border border-semantic-success/10 flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-semantic-success" />
                </div>
              </div>
              <div className="space-y-3">
                {data?.recentGrades && data.recentGrades.length > 0 ? (
                  data.recentGrades.slice(0, 2).map((grade, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50">
                      <div className="overflow-hidden pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{grade.module}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{grade.date}</p>
                      </div>
                      <Badge variant={grade.score >= 10 ? 'success' : 'danger'} className="text-[10px] py-0.5 px-2 rounded-full font-bold">
                        {grade.score}/20
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-semibold text-slate-400">Aucune note récente.</p>
                )}
              </div>
            </div>
            <div className="mt-6 border-t border-slate-50 pt-4 bg-white">
              <Link to="/student/grades" className="flex items-center text-xs font-bold text-upf-primary hover:text-upf-primaryLight transition-colors gap-1 group">
                Voir le carnet <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentDashboardPage;

