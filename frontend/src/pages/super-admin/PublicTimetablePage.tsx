import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  CheckBadgeIcon,
  TrashIcon,
  AcademicCapIcon,
  FunnelIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useTimetableStore } from '../../store/timetableStore';
import { useClassesStore } from '../../store/classesStore';
import { useBuildingsStore } from '../../store/buildingsStore';
import { useProgramsStore } from '../../store/programsStore';
import { useModalStore } from '../../store/modalStore';
import TimetableGrid from '../../components/admin/TimetableGrid';

const PublicTimetablePage: React.FC = () => {
  const { currentTimetable, fetchTimetable, publishTimetable, publishAllTimetables, deleteTimetable } = useTimetableStore();
  const { openConfirm } = useModalStore();
  const { classes, fetchClasses } = useClassesStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const { programs, fetchPrograms } = useProgramsStore();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [semester, setSemester] = useState<string>('S1');
  const [academicYear] = useState('2025-2026');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchBuildings();
    fetchClasses();
    fetchPrograms();
  }, [fetchBuildings, fetchClasses, fetchPrograms]);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass, fetchTimetable, refreshTrigger]);

  const filteredPrograms = programs.filter(p => !selectedBuilding || p.buildingId === selectedBuilding);
  const filteredClasses = classes.filter(c => 
    (!selectedBuilding || c.buildingId === selectedBuilding) &&
    (!selectedProgram || c.programId === selectedProgram)
  );

  const selectedClassObj = classes.find(c => c.id === selectedClass) as any;
  
  const draftSlots = currentTimetable.filter(s => 
    s.status === 'DRAFT' && s.semester === semester && s.academicYear === academicYear
  );
  const publishedSlots = currentTimetable.filter(s => 
    s.status === 'PUBLISHED' && s.semester === semester && s.academicYear === academicYear
  );

  const handlePublish = async () => {
    try {
      await publishTimetable({ classId: selectedClass, academicYear, semester });
      toast.success('Emploi du temps publié avec succès !');
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la publication');
    }
  };

  const handlePublishAll = async () => {
    const scope = selectedBuilding ? 'ce bâtiment' : "TOUTE l'université";
    
    openConfirm({
      title: 'Publication Globale',
      message: `Voulez-vous vraiment publier TOUS les brouillons de ${scope} pour le semestre ${semester} (${academicYear}) ? Cette action rendra les plannings visibles par tous les étudiants.`,
      confirmLabel: 'Oui, tout publier',
      type: 'warning',
      onConfirm: async () => {
        try {
          await publishAllTimetables({ 
            buildingId: selectedBuilding || undefined, 
            academicYear, 
            semester 
          });
          toast.success(`Publication globale terminée pour ${scope} !`);
          setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
          toast.error('Erreur lors de la publication globale');
        }
      }
    });
  };

  const handleDeleteTimetable = async () => {
    openConfirm({
      title: 'Supprimer le planning',
      message: 'Voulez-vous vraiment supprimer cet emploi du temps ? Cette action est irréversible.',
      confirmLabel: 'Supprimer définitivement',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteTimetable({ classId: selectedClass, semester, academicYear });
          toast.success('Planning supprimé avec succès');
          setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
          toast.error('Erreur lors de la suppression');
        }
      }
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto px-4 md:px-0">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-upf-primary to-blue-600 flex items-center justify-center shadow-xl shadow-upf-primary/20 text-white">
              <CalendarDaysIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight font-outfit">Centre de Publication</h1>
              <p className="text-slate-400 font-medium text-lg mt-1 opacity-90">
                Validation et diffusion des emplois du temps
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <button
              onClick={handlePublishAll}
              className="group flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <RocketLaunchIcon className="w-6 h-6 group-hover:animate-bounce" />
              TOUT PUBLIER
            </button>
          </div>
        </div>
      </div>

      {/* ── Control Center ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FunnelIcon className="w-5 h-5 text-upf-primary" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">SÉLECTION</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bâtiment</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20"
                  value={selectedBuilding} 
                  onChange={e => { setSelectedBuilding(e.target.value); setSelectedProgram(''); setSelectedClass(''); }}
                >
                  <option value="">Sélectionner un pôle</option>
                  {buildings.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <AnimatePresence>
                {selectedBuilding && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="space-y-1.5 overflow-hidden">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filière</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20"
                      value={selectedProgram}
                      onChange={e => { setSelectedProgram(e.target.value); setSelectedClass(''); }}
                    >
                      <option value="">Sélectionner une filière</option>
                      {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedProgram && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="space-y-1.5 overflow-hidden">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe cible</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20"
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                    >
                      <option value="">Sélectionner une classe</option>
                      {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedClass && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="space-y-1.5 overflow-hidden">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semestre</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {['S1', 'S2'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSemester(s)}
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${semester === s ? 'bg-white text-upf-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {s === 'S1' ? 'Automne' : 'Printemps'} ({s})
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {selectedClass && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Statut Actuel</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-60">Brouillons:</span>
                  <span className="text-sm font-black bg-white/10 px-2 py-0.5 rounded-lg">{draftSlots.length} créneaux</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-60">Publiés:</span>
                  <span className="text-sm font-black text-emerald-400">{publishedSlots.length} créneaux</span>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <button 
                    onClick={handlePublish}
                    disabled={draftSlots.length === 0}
                    className="w-full py-3 bg-upf-primary hover:bg-upf-primary disabled:opacity-30 disabled:hover:bg-upf-primary text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <CheckBadgeIcon className="w-4 h-4" /> PUBLIER CETTE CLASSE
                  </button>
                  <button 
                    onClick={handleDeleteTimetable}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" /> SUPPRIMER TOUT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Timetable View */}
        <div className="lg:col-span-3">
          {!selectedClass ? (
            <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-slate-300 shadow-sm h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
                <SparklesIcon className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Sélectionnez une classe</h3>
              <p className="text-slate-500 mt-2 max-w-xs text-lg font-medium">Pour visualiser, valider et publier un emploi du temps spécifique.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 min-h-[600px]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-upf-primary/10 rounded-2xl flex items-center justify-center text-upf-primary">
                    <AcademicCapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedClassObj?.name}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{selectedClassObj?.program?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${publishedSlots.length > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {publishedSlots.length > 0 ? 'PARTIELLEMENT PUBLIÉ' : 'BROUILLON'}
                  </div>
                </div>
              </div>

              <TimetableGrid 
                slots={[...draftSlots, ...publishedSlots]}
                classNameLabel={selectedClassObj?.name}
                semester={semester}
                academicYear={academicYear}
                programName={selectedClassObj?.program?.name}
                level={selectedClassObj?.level}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicTimetablePage;

