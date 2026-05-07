import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellAlertIcon, 
  CheckCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useNotificationsStore } from '../../store/notificationsStore';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const ProfessorNotificationsPage: React.FC = () => {
  const { notifications, isLoading, fetchMyNotifications, markAsRead } = useNotificationsStore();

  useEffect(() => {
    fetchMyNotifications();
  }, [fetchMyNotifications]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'ALERT': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'SYSTEM': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'MESSAGE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <ExclamationTriangleIcon className="w-6 h-6" />;
      case 'SYSTEM': return <InformationCircleIcon className="w-6 h-6" />;
      case 'MESSAGE': return <CheckCircleIcon className="w-6 h-6" />;
      default: return <BellAlertIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 font-outfit">Notifications</h1>
          <p className="text-slate-500 mt-1">Restez informé des annonces administratives et alertes système</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <span className="text-sm font-bold text-slate-600">
            {notifications.filter(n => !n.isRead).length} non-lues
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-3xl animate-pulse" />)
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <BellAlertIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Votre centre d'alertes est vide</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Vous n'avez reçu aucune notification pour le moment.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`group relative p-6 rounded-[2rem] border transition-all cursor-pointer ${
                  n.isRead 
                  ? 'bg-slate-50/50 border-slate-100 opacity-80' 
                  : 'bg-white border-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                )}

                <div className="flex gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${getTypeStyles(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Administration UPF
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {dayjs(n.createdAt).format('DD MMM, HH:mm')}
                      </span>
                    </div>
                    <h4 className={`text-lg font-bold font-outfit ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                      {n.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                      {n.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ProfessorNotificationsPage;
