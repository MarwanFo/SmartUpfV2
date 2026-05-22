import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  MegaphoneIcon, 
  UsersIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  BellIcon,
  PaperAirplaneIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import { useNotificationsStore } from '../../store/notificationsStore';
import { useBuildingsStore } from '../../store/buildingsStore';
import { useProgramsStore } from '../../store/programsStore';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const NotificationsPage: React.FC = () => {
  const { history, isLoading, fetchAdminHistory, sendNotification } = useNotificationsStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const { programs, fetchPrograms } = useProgramsStore();
  const { accessToken } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'SYSTEM',
    targetScope: 'ALL',
    targetIds: [] as string[]
  });

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchAdminHistory();
      fetchBuildings();
      fetchPrograms();
    }
  }, [accessToken, fetchAdminHistory, fetchBuildings, fetchPrograms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Veuillez saisir un titre');
    if (!formData.body) return toast.error('Le message ne peut pas être vide');
    if (formData.targetScope !== 'ALL' && formData.targetIds.length === 0) {
      return toast.error('Veuillez sélectionner au moins une cible');
    }

    setIsSending(true);
    const toastId = toast.loading('Diffusion en cours...');
    try {
      await sendNotification(formData);
      setFormData({
        title: '',
        body: '',
        type: 'SYSTEM',
        targetScope: 'ALL',
        targetIds: []
      });
      toast.success('Notification diffusée avec succès !', { id: toastId });
    } catch (error) {
      toast.error('Échec de la diffusion', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const getTargetIcon = (scope: string) => {
    switch (scope) {
      case 'ALL': return <UsersIcon className="w-5 h-5" />;
      case 'ROLE': return <AcademicCapIcon className="w-5 h-5" />;
      case 'PROGRAM': return <AcademicCapIcon className="w-5 h-5" />;
      case 'BUILDING': return <BuildingOfficeIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'ALERT': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'SYSTEM': return 'bg-upf-primary/10 text-upf-primary border-upf-primary/20';
      case 'MESSAGE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 font-outfit">
            <div className="p-3 bg-upf-primary text-white rounded-2xl shadow-lg shadow-upf-primary/30">
              <MegaphoneIcon className="w-8 h-8" />
            </div>
            Centre de Diffusion
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Communiquez avec toute la communauté UPF en temps réel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <PaperAirplaneIcon className="w-32 h-32" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Titre de l'annonce</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Maintenance système ce soir"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-upf-primary/10 focus:border-upf-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Type d'alerte</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-upf-primary/10 focus:border-upf-primary outline-none transition-all font-medium"
                  >
                    <option value="SYSTEM">Système / Info</option>
                    <option value="ALERT">Urgente / Alerte</option>
                    <option value="MESSAGE">Message Direct</option>
                    <option value="INCIDENT">Incident Technique</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Écrivez votre message ici..."
                  value={formData.body}
                  onChange={e => setFormData({...formData, body: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-upf-primary/10 focus:border-upf-primary outline-none transition-all font-medium resize-none"
                />
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-upf-primary" />
                  Ciblage de l'audience
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'ALL', label: 'Tout le monde', icon: UsersIcon },
                    { id: 'ROLE', label: 'Par Rôle', icon: AcademicCapIcon },
                    { id: 'PROGRAM', label: 'Par Filière', icon: AcademicCapIcon },
                    { id: 'BUILDING', label: 'Par Établissement', icon: BuildingOfficeIcon },
                  ].map(scope => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setFormData({...formData, targetScope: scope.id, targetIds: []})}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        formData.targetScope === scope.id 
                        ? 'bg-upf-primary text-white shadow-lg shadow-upf-primary/30 scale-105' 
                        : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <scope.icon className="w-4 h-4" />
                      {scope.label}
                    </button>
                  ))}
                </div>

                {formData.targetScope !== 'ALL' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                  >
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                      Sélectionnez les cibles
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
                      {formData.targetScope === 'ROLE' && ['SUPER_ADMIN', 'ADMIN_ETABLISSEMENT', 'PROFESSEUR', 'ETUDIANT', 'PARENT'].map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            const ids = formData.targetIds.includes(role) 
                              ? formData.targetIds.filter(id => id !== role)
                              : [...formData.targetIds, role];
                            setFormData({...formData, targetIds: ids});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            formData.targetIds.includes(role)
                            ? 'bg-upf-primary/20 text-upf-primary'
                            : 'bg-white text-slate-500 border border-slate-200'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                      {formData.targetScope === 'BUILDING' && buildings.filter(b => b.isActive).map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            const ids = formData.targetIds.includes(b.id) 
                              ? formData.targetIds.filter(id => id !== b.id)
                              : [...formData.targetIds, b.id];
                            setFormData({...formData, targetIds: ids});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            formData.targetIds.includes(b.id)
                            ? 'bg-upf-primary/20 text-upf-primary'
                            : 'bg-white text-slate-500 border border-slate-200'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                      {formData.targetScope === 'PROGRAM' && programs.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const ids = formData.targetIds.includes(p.id) 
                              ? formData.targetIds.filter(id => id !== p.id)
                              : [...formData.targetIds, p.id];
                            setFormData({...formData, targetIds: ids});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            formData.targetIds.includes(p.id)
                            ? 'bg-upf-primary/20 text-upf-primary'
                            : 'bg-white text-slate-500 border border-slate-200'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 bg-gradient-to-r from-upf-primary to-upf-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-upf-primary/30 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isSending ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-6 h-6" />
                    Diffuser la Notification
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar: Preview & History */}
        <div className="lg:col-span-5 space-y-8">
          {/* Live Preview */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-upf-primary/20 to-transparent pointer-events-none" />
            <h3 className="text-white/50 text-xs font-black uppercase tracking-widest mb-6">Aperçu en direct</h3>
            
            <motion.div 
              key={`${formData.title}-${formData.type}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getTypeStyles(formData.type)}`}>
                  {formData.type}
                </div>
                <span className="text-[10px] text-white/40 font-bold">À l'instant</span>
              </div>
              <h4 className="text-white font-bold text-lg">{formData.title || "Titre de la notification"}</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                {formData.body || "Le contenu de votre message apparaîtra ici..."}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-upf-primary flex items-center justify-center text-[10px] font-bold text-white">UPF</div>
                <span className="text-[10px] text-white/40 font-medium">Administration UPF</span>
              </div>
            </motion.div>

            <div className="mt-8 flex justify-center">
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-upf-primary' : 'bg-white/10'}`} />)}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl font-outfit">
              <QueueListIcon className="w-6 h-6 text-upf-primary" />
              Derniers Envois
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {isLoading && history.length === 0 ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />)
              ) : history.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium text-sm">Aucun historique d'envoi</p>
                </div>
              ) : (
                history.map((n) => (
                  <motion.div 
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayjs(n.createdAt).format('DD MMMM, HH:mm')}
                      </span>
                      <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getTypeStyles(n.type)}`}>
                        {n.type}
                      </div>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm mb-1">{n.title}</h5>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500">
                        {getTargetIcon(n.targetScope)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        Cible : {n.targetScope}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

