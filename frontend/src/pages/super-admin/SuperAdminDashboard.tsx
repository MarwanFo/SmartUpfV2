import React from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  BuildingOffice2Icon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface DashboardStats {
  counts: {
    students: number;
    professors: number;
    staff: number;
    buildings: number;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    role: string;
    action: string;
    date: string;
  }>;
}

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/analytics/dashboard/super-admin');
        const data = response.data.data || response.data;
        setStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderStatCard = (title: string, value: string, icon: React.ReactNode, color: string) => (
    <StatCard 
      key={title}
      title={title} 
      value={value} 
      trend="Actif" 
      trendUp={true}
      icon={icon} 
      color={color}
    />
  );

  return (
    <div className="space-y-8">
      
      {/* Alert / Welcome Banner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-900">Vue d'ensemble Système</h2>
          <p className="text-slate-500 text-sm mt-1">Réseau Universitaire UPF Fès - Tous les systèmes sont opérationnels.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-semibold text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Statut : En Ligne
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {renderStatCard("Étudiants Actifs", stats?.counts?.students?.toString() || '0', <UsersIcon className="w-6 h-6 text-blue-600" />, "blue")}
          {renderStatCard("Professeurs & Staff", stats?.counts?.professors?.toString() || '0', <AcademicCapIcon className="w-6 h-6 text-[#E6B014]" />, "gold")}
          {renderStatCard("Établissements", stats?.counts?.buildings?.toString() || '0', <BuildingOffice2Icon className="w-6 h-6 text-upf-primary" />, "indigo")}
          {renderStatCard("Comptes Staff", stats?.counts?.staff?.toString() || '0', <ShieldExclamationIcon className="w-6 h-6 text-emerald-600" />, "emerald")}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 font-outfit">Activité Récente du Système</h3>
            <button className="text-sm text-upf-primary font-semibold hover:text-upf-accent transition-colors">Tout voir</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                  <th className="px-6 py-4">Événement</th>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Établissement</th>
                  <th className="px-6 py-4 text-right">Heure</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.recentActivity?.length ? stats.recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-upf-accent"></span>
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{activity.user} <span className="text-xs text-slate-400 ml-1">({activity.role})</span></td>
                    <td className="px-6 py-4 text-slate-500">-</td>
                    <td className="px-6 py-4 text-right text-slate-400">{new Date(activity.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                )) : (
                  <tr className="border-b border-slate-50">
                    <td colSpan={4} className="px-6 py-4 text-center text-slate-500">Aucune activité récente</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 font-outfit">Santé de l'Infrastructure</h3>
          </div>
          <div className="p-6 space-y-6">
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700">Serveurs de Base de données</span>
                <span className="text-emerald-600 font-bold">24% Charge</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700">Cluster Jumeau 3D (VR)</span>
                <span className="text-amber-500 font-bold">78% Charge</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-slate-900/10">
                Générer un rapport complet
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ title, value, trend, trendUp, icon, color }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    gold: 'bg-[#E6B014]/10 text-[#E6B014] border-[#E6B014]/20',
    indigo: 'bg-upf-primary/10 text-upf-primary border-upf-primary/20',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorMap[color]} flex items-center justify-center border`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
          {trendUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : null}
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-extrabold font-outfit text-slate-900">{value}</h4>
        <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
      </div>
    </motion.div>
  );
};

export default SuperAdminDashboard;

