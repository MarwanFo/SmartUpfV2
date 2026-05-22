import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon, 
  SparklesIcon, 
  ClockIcon, 
  MapPinIcon, 
  ArrowPathIcon,
  CheckIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  HeartIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const API = 'http://localhost:3001/api';

const DAYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const TIME_SLOTS = [
  '08:30', '10:30', '13:30', '15:30', '17:30'
];

interface TimetableSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'UNIVERSITY';
  course: {
    id: string;
    name: string;
    code: string;
  };
}

interface PersonalTask {
  id: string;
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  category: string;
  type: 'PERSONAL';
}

interface FlexibleTask {
  id: string;
  content: string;
}

interface OptimizationReport {
  wellbeingScore: number;
  analysis: string;
}

const ProfessorCalendarPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [flexibleTasks, setFlexibleTasks] = useState<FlexibleTask[]>([]);
  const [finishedSessions, setFinishedSessions] = useState<{courseId: string, startTime: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [newFlexTask, setNewFlexTask] = useState('');

  const optimizationSteps = [
    "Analyse de vos intentions...",
    "Consultation de l'emploi du temps UPF...",
    "Identification des créneaux libres...",
    "Placement intelligent par NVIDIA AI...",
    "Finalisation de votre semaine parfaite..."
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    
    // Fetch each part separately so one error doesn't block everything
    try {
      const res = await axios.get(`${API}/professor/timetable`, config);
      setSlots(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (e) { console.error("Univ slots fetch error", e); }

    try {
      const res = await axios.get(`${API}/professor-schedule/personal-tasks`, config);
      setPersonalTasks(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Personal tasks fetch error", e); }

    try {
      const res = await axios.get(`${API}/professor-schedule/flexible-tasks`, config);
      setFlexibleTasks(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Flexible tasks fetch error", e); }

    try {
      const res = await axios.get(`${API}/professor-schedule/finished-sessions`, config);
      setFinishedSessions(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Finished sessions fetch error", e); }

    setLoading(false);
  };

  const resetCalendar = async () => {
    try {
      await axios.post(`${API}/professor-schedule/clear-all`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success("Calendrier réinitialisé");
      setShowConfirmReset(false);
      fetchData();
    } catch (error) {
      toast.error("Erreur réinitialisation");
    }
  };

  const handleAddFlexTask = async () => {
    if (!newFlexTask) return;
    try {
      await axios.post(`${API}/professor-schedule/flexible-tasks`, { content: newFlexTask }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setNewFlexTask('');
      setShowTaskModal(false);
      fetchData();
      toast.success("Intention ajoutée !");
    } catch (error) {
      toast.error("Erreur d'ajout");
    }
  };

  const deleteFlexTask = async (id: string) => {
    try {
      await axios.post(`${API}/professor-schedule/flexible-tasks/${id}/delete`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchData();
    } catch (error) {
      toast.error("Erreur suppression");
    }
  };

  const startOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationStep(0);
    
    const interval = setInterval(() => {
      setOptimizationStep(p => (p < optimizationSteps.length - 1 ? p + 1 : p));
    }, 1500);

    try {
      const res = await axios.post(`${API}/professor-schedule/optimize`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      clearInterval(interval);
      setReport(res.data);
      fetchData();
      setTimeout(() => {
        setIsOptimizing(false);
        setShowReport(true);
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      setIsOptimizing(false);
      toast.error("Erreur optimisation IA");
    }
  };

  const generateSchedule = async () => {
    setIsOptimizing(true);
    setOptimizationStep(0);
    try {
      await axios.post(`${API}/professor-schedule/generate-university`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchData();
    } catch (error) {
      toast.error("Erreur génération");
    } finally {
      setIsOptimizing(false);
    }
  };

  const markFinished = async (slotId: string) => {
    try {
      await axios.post(`${API}/professor-schedule/finish-session/${slotId}`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchData();
    } catch (error) {
      toast.error("Erreur validation");
    }
  };

  const getItemsForDayAndTime = (day: string, time: string) => {
    const univ = slots.filter(s => s.dayOfWeek === day && s.startTime === time).map(s => ({ ...s, type: 'UNIVERSITY' }));
    const perso = personalTasks.filter(t => t.dayOfWeek === day && t.startTime === time).map(t => ({ ...t, type: 'PERSONAL' }));
    return [...univ, ...perso];
  };

  const isSessionFinished = (slot: TimetableSlot) => {
    return finishedSessions.some(fs => fs.courseId === slot.course.id && fs.startTime === slot.startTime);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-outfit">
      {/* ─── AI Intentions Sidebar ─── */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-upf-primary to-violet-700 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">IA Assistant</h2>
          </div>
          <p className="text-[9px] font-bold text-upf-primary/20 uppercase tracking-widest opacity-70">Décrivez vos souhaits, l'IA s'occupe du reste</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="bg-upf-primary/10/50 rounded-2xl p-4 border border-upf-primary/20">
            <p className="text-[10px] font-black text-upf-primary uppercase mb-1">Comment ça marche ?</p>
            <p className="text-[11px] text-upf-primary leading-relaxed opacity-80">
              Saisissez vos activités sans date précise. Cliquez sur "Optimiser" et l'IA les placera dans vos créneaux libres.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mes Intentions</h3>
              <button onClick={() => setShowTaskModal(true)} className="p-1.5 bg-upf-primary text-white rounded-lg hover:bg-upf-primary transition-all shadow-md">
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            
            {flexibleTasks.length === 0 ? (
              <div className="text-center py-12 opacity-20">
                <ChatBubbleBottomCenterTextIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-[10px] font-bold uppercase">Liste vide</p>
              </div>
            ) : (
              flexibleTasks.map(task => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group relative">
                  <p className="text-xs font-bold text-slate-700 leading-relaxed pr-6">{task.content}</p>
                  <button onClick={() => deleteFlexTask(task.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-all">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50/50">
          <button onClick={startOptimization} disabled={isOptimizing} className="w-full py-4 bg-gradient-to-r from-upf-primary to-violet-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-upf-primary/30 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            OPTIMISER MA SEMAINE
          </button>
        </div>
      </aside>

      {/* ─── Main Calendar ─── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
              <CalendarDaysIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">IntelliSchedule <span className="text-upf-primary">Hybrid</span></h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Planning Optimisé par NVIDIA</p>
                {slots.length === 0 && !loading && (
                  <button onClick={generateSchedule} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black hover:bg-emerald-600 transition-all animate-bounce shadow-lg shadow-emerald-200">
                    <SparklesIcon className="w-3 h-3" />
                    GÉNÉRER UNIV
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowConfirmReset(true)} className="px-4 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100 uppercase tracking-widest">Réinitialiser</button>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'week' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>SEMAINE</button>
              <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'day' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>JOUR</button>
            </div>
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <ArrowPathIcon className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-w-[1000px]">
            <div className="grid grid-cols-[100px_repeat(6,1fr)] border-b border-slate-100 bg-slate-50/30">
              <div className="p-4 border-r border-slate-100" />
              {DAYS.map(day => (
                <div key={day} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{day}</span>
                </div>
              ))}
            </div>

            <div className="relative">
              {TIME_SLOTS.map(time => (
                <div key={time} className="grid grid-cols-[100px_repeat(6,1fr)] min-h-[160px] border-b border-slate-100 last:border-b-0">
                  <div className="flex flex-col items-center justify-center bg-slate-50/10 border-r border-slate-100">
                    <span className="text-sm font-black text-slate-900">{time}</span>
                  </div>
                  {DAYS.map(day => {
                    const items = getItemsForDayAndTime(day, time);
                    return (
                      <div key={`${day}-${time}`} className="p-2 border-r border-slate-100 last:border-r-0 relative">
                        <div className="flex flex-col gap-2 h-full">
                          {items.map((item, idx) => {
                            if (item.type === 'UNIVERSITY') {
                              const isDone = isSessionFinished(item as any);
                              return (
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} key={`univ-${item.id || idx}`} className={`p-4 rounded-2xl border-l-4 shadow-sm border border-slate-100 flex flex-col justify-between h-full transition-all relative group ${isDone ? 'bg-emerald-50/30 border-l-emerald-400 opacity-60' : 'bg-white border-l-upf-primaryLight hover:shadow-lg'}`}>
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[8px] font-black uppercase text-cyan-700 bg-upf-primaryLight/10 px-1.5 py-0.5 rounded border border-upf-primaryLight/20">UNIV</span>
                                      {!isDone && <button onClick={() => markFinished(item.id)} className="p-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-all opacity-0 group-hover:opacity-100"><CheckIcon className="w-3 h-3" /></button>}
                                    </div>
                                    <h4 className="text-[11px] font-black text-slate-900 leading-tight">{(item as any).course?.name}</h4>
                                  </div>
                                  <div className="flex items-center gap-1 mt-2 text-slate-400 text-[9px] font-bold"><MapPinIcon className="w-3 h-3" /><span>{(item as any).room}</span></div>
                                </motion.div>
                              );
                            } else {
                              return (
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} key={`perso-${item.id || idx}`} className="p-4 rounded-2xl border-l-4 border-l-upf-primary bg-gradient-to-br from-upf-primary/10 to-white shadow-sm border border-upf-primary/20 flex flex-col justify-between h-full hover:shadow-lg transition-all">
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[8px] font-black uppercase text-upf-primary bg-upf-primary/20 px-1.5 py-0.5 rounded border border-upf-primary/30">PERSO</span>
                                      <div className="flex gap-1">
                                        {(item as any).category === 'SPORT' && <TrophyIcon className="w-3 h-3 text-upf-primaryLight" />}
                                        {(item as any).category === 'HEALTH' && <HeartIcon className="w-3 h-3 text-rose-400" />}
                                      </div>
                                    </div>
                                    <h4 className="text-[11px] font-black text-upf-primary leading-tight">{(item as any).title}</h4>
                                  </div>
                                  <div className="flex items-center gap-1 mt-2 text-upf-primaryLight text-[9px] font-bold"><ClockIcon className="w-3 h-3" /><span>{(item as any).startTime} - {(item as any).endTime}</span></div>
                                </motion.div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div key="confirm-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-6"><ExclamationTriangleIcon className="w-10 h-10 text-rose-500" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Tout effacer ?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Ceci supprimera vos cours et vos intentions perso du calendrier.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmReset(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all">ANNULER</button>
                <button onClick={resetCalendar} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-rose-600 transition-all active:scale-95">CONFIRMER</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showTaskModal && (
          <motion.div key="flex-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Nouvelle Intention</h2>
                <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Décrivez votre souhait, l'IA lui trouvera une place optimale.</p>
                <textarea 
                  value={newFlexTask} 
                  onChange={e => setNewFlexTask(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-upf-primary outline-none min-h-[120px] resize-none font-bold text-slate-700" 
                  placeholder="Ex: Aller à la piscine 2 fois, Dîner en famille, Acheter des fournitures..."
                />
                <button onClick={handleAddFlexTask} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <PaperAirplaneIcon className="w-4 h-4" />
                  ENREGISTRER MON SOUHAIT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isOptimizing && (
          <motion.div key="optimizing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] flex items-center justify-center bg-upf-primary/90 backdrop-blur-2xl p-6">
            <div className="max-w-md w-full text-center space-y-8 text-white">
              <div className="w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center mx-auto animate-spin-slow">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black">NVIDIA Hybrid Engine</h2>
                <p className="text-upf-primary/30/50 font-bold uppercase tracking-widest text-[10px]">Calcul de l'équilibre parfait</p>
              </div>
              <div className="space-y-3">
                {optimizationSteps.map((step, idx) => (
                  <motion.div key={step} animate={{ opacity: idx === optimizationStep ? 1 : 0.2, x: idx === optimizationStep ? 10 : 0 }} className="flex items-center gap-4 text-left">
                    <div className={`w-1.5 h-1.5 rounded-full ${idx === optimizationStep ? 'bg-white' : 'bg-white/20'}`} />
                    <span className="text-xs font-bold">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showReport && report && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-10 overflow-hidden">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-upf-primary text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-upf-primary/30">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Analyse de l'IA</h2>
                <div className="mt-2 inline-flex items-center px-4 py-1.5 bg-upf-primary/10 rounded-full text-xs font-black text-upf-primary uppercase tracking-widest">
                  Score : {report.wellbeingScore}/10
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8">
                <p className="text-sm text-slate-600 font-bold leading-relaxed italic">"{report.analysis}"</p>
              </div>
              <button onClick={() => setShowReport(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-slate-800 transition-all">VOIR MON NOUVEAU PLANNING</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessorCalendarPage;


