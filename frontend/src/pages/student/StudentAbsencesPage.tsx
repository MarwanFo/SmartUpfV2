import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ExclamationCircleIcon,
  CheckBadgeIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');
import toast from 'react-hot-toast';

const API = 'http://localhost:3001/api/student';

interface AttendanceRecord {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  markedAt: string;
  notes?: string;
  justified: boolean;
  justificationUrl?: string;
  justificationNote?: string;
  session: {
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    course: {
      name: string;
      code: string;
    }
  }
}

const StudentAbsencesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ABSENT' | 'LATE'>('ALL');
  
  // Justification states
  const [justifyingId, setJustifyingId] = useState<string | null>(null);
  const [justificationFile, setJustificationFile] = useState<File | null>(null);
  const [justificationNote, setJustificationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAbsences = async () => {
      try {
        const res = await axios.get(`${API}/absences`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setAttendances(res.data.data || res.data || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des absences');
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    if (accessToken) fetchAbsences();
  }, [accessToken]);

  const handleJustify = async (attendanceId: string) => {
    if (!justificationFile) return toast.error('Veuillez sélectionner un fichier (PDF, JPG, PNG)');
    setIsSubmitting(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', justificationFile);
      const uploadRes = await axios.post('http://localhost:3001/api/upload/single', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const fileUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      if (!fileUrl) throw new Error("Erreur lors de l'upload");

      // 2. Submit Justification
      await axios.post(`${API}/absences/${attendanceId}/justify`, {
        fileUrl,
        note: justificationNote
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      toast.success('Justificatif envoyé ! En attente de validation.');
      setJustifyingId(null);
      setJustificationFile(null);
      setJustificationNote('');
      fetchAbsences();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: attendances.length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
    late: attendances.filter(a => a.status === 'LATE').length,
    present: attendances.filter(a => a.status === 'PRESENT').length,
  };

  const attendanceRate = stats.total > 0 
    ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
    : 100;

  const filteredAttendances = attendances.filter(a => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Global Stats */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight">Suivi d'Assiduité</h1>
          <p className="text-slate-500 font-medium">Historique complet de vos présences, retards et absences par module.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[
            { label: 'Taux de Présence', value: `${attendanceRate}%`, icon: ChartBarIcon, color: 'emerald' },
            { label: 'Absences', value: stats.absent, icon: ExclamationCircleIcon, color: 'rose' },
            { label: 'Retards', value: stats.late, icon: ClockIcon, color: 'amber' },
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`min-w-[200px] p-6 rounded-[2rem] bg-${s.color}-50 border border-${s.color}-100 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-${s.color}-600`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-black text-${s.color}-700 font-outfit`}>{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Filters & Export (Left Sidebar on Large) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4" /> Filtres
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'ALL', label: 'Toute l\'activité', count: stats.total },
                  { id: 'ABSENT', label: 'Absences uniquement', count: stats.absent },
                  { id: 'LATE', label: 'Retards uniquement', count: stats.late },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                      filter === f.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === f.id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                <ArrowDownTrayIcon className="w-4 h-4" /> Exporter PDF
              </button>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100">
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Note Importante</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Une absence peut être justifiée sous 48h auprès de l'administration. Les retards de plus de 15 minutes sont comptabilisés comme absences.
            </p>
          </div>
        </div>

        {/* Attendance List (Main Content) */}
        <div className="xl:col-span-3 space-y-4">
          {filteredAttendances.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 border border-slate-200 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <CheckBadgeIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-wider">Aucune absence !</h3>
              <p className="text-slate-500 mt-2">Félicitations, vous maintenez une assiduité parfaite dans cette catégorie.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttendances.map((record, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={record.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                      record.status === 'ABSENT' ? 'bg-rose-50 text-rose-600' :
                      record.status === 'LATE' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">
                        {dayjs(record.session.date).format('MMM')}
                      </span>
                      <span className="text-xl font-black font-outfit leading-none">
                        {dayjs(record.session.date).format('DD')}
                      </span>
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-slate-900 truncate uppercase tracking-tight">
                        {record.session.course.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <ClockIcon className="w-3 h-3" /> {record.session.startTime} - {record.session.endTime}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          {record.session.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                    {record.notes && (
                      <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic text-[10px]">
                        "{record.notes}"
                      </div>
                    )}

                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                      record.status === 'ABSENT' ? 'bg-rose-600 text-white border-rose-500 shadow-rose-100' :
                      record.status === 'LATE' ? 'bg-amber-500 text-white border-amber-400 shadow-amber-100' :
                      'bg-emerald-600 text-white border-emerald-500 shadow-emerald-100'
                    }`}>
                      {record.status === 'ABSENT' ? 'Absent' : 
                       record.status === 'LATE' ? 'En Retard' : 'Présent'}
                    </div>
                  </div>

                  {/* Justification Section */}
                  {record.status === 'ABSENT' && (
                    <div className="w-full mt-4 pt-4 border-t border-slate-100">
                      {record.justified ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                          <CheckBadgeIcon className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">Absence Justifiée</span>
                        </div>
                      ) : record.justificationUrl ? (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                          <ClockIcon className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">En attente de validation</span>
                        </div>
                      ) : (
                        (() => {
                          const diffHours = Math.abs(new Date().getTime() - new Date(record.session.date).getTime()) / 36e5;
                          if (diffHours > 48) {
                            return (
                              <div className="text-xs text-rose-500 font-bold flex items-center gap-2 bg-rose-50 px-4 py-3 rounded-xl">
                                <ExclamationCircleIcon className="w-4 h-4" /> Délai de 48h dépassé. Justification impossible.
                              </div>
                            );
                          }

                          if (justifyingId === record.id) {
                            return (
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fichier justificatif (PDF/Image)</label>
                                  <input 
                                    type="file" 
                                    onChange={(e) => setJustificationFile(e.target.files?.[0] || null)}
                                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Note explicative (Optionnel)</label>
                                  <input 
                                    type="text" 
                                    value={justificationNote}
                                    onChange={(e) => setJustificationNote(e.target.value)}
                                    placeholder="Ex: Certificat médical ci-joint..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <button 
                                    onClick={() => setJustifyingId(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                  <button 
                                    onClick={() => handleJustify(record.id)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                  >
                                    {isSubmitting ? 'Envoi...' : 'Envoyer le justificatif'}
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button 
                              onClick={() => {
                                setJustifyingId(record.id);
                                setJustificationFile(null);
                                setJustificationNote('');
                              }}
                              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-1"
                            >
                              + Ajouter un justificatif (Reste {Math.floor(48 - diffHours)}h)
                            </button>
                          );
                        })()
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAbsencesPage;
