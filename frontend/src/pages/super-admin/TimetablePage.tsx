import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ArrowPathIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTimetableStore } from '../../store/timetableStore';
import { useClassesStore } from '../../store/classesStore';
import { useBuildingsStore } from '../../store/buildingsStore';
import { useProgramsStore } from '../../store/programsStore';

const TimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const { generateBatchTimetable } = useTimetableStore();
  const { classes, fetchClasses } = useClassesStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const { programs, fetchPrograms } = useProgramsStore();

  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [semester, setSemester] = useState<string>('S1');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    fetchBuildings();
    fetchClasses();
    fetchPrograms();
  }, [fetchBuildings, fetchClasses, fetchPrograms]);

  const filteredPrograms = programs.filter(p => selectedBuildings.length === 0 || (p.buildingId && selectedBuildings.includes(p.buildingId)));
  const filteredClasses = classes.filter(c => 
    (selectedBuildings.length === 0 || selectedBuildings.includes(c.buildingId)) &&
    (selectedPrograms.length === 0 || selectedPrograms.includes(c.programId))
  );

  const toggleSelection = (id: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter(i => i !== id));
    } else {
      setter([...list, id]);
    }
  };

  const handleGenerateSelection = async () => {
    if (selectedClasses.length === 0) return toast.error('Veuillez choisir au moins une classe');
    setIsGenerating(true);
    setHasGenerated(false);
    try {
      const result = await generateBatchTimetable({
        classIds: selectedClasses,
        academicYear,
        semester
      });
      const successCount = result?.results?.filter((r: any) => r.status === 'SUCCESS').length || 0;
      if (successCount > 0) {
        toast.success(`${successCount} emploi(s) du temps générés en brouillon !`);
        setHasGenerated(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la génération');
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 text-white">
               <SparklesIcon className="w-8 h-8" />
            </div>
            Générateur IA
          </h1>
          <p className="text-slate-500 font-medium ml-16 mt-1">Intelligence Artificielle de Planification Académique</p>
        </div>
      </div>

      {/* STEP 1: Building Selection */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-widest">
          <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[10px]">1</div>
          Établissements
        </div>
        <div className="flex flex-wrap gap-2">
          {buildings.filter(b => b.isActive).map(b => (
            <button
              key={b.id}
              onClick={() => {
                toggleSelection(b.id, selectedBuildings, setSelectedBuildings);
                setSelectedPrograms([]);
                setSelectedClasses([]);
              }}
              className={`px-5 py-2.5 rounded-2xl border-2 transition-all font-bold text-sm ${
                selectedBuildings.includes(b.id)
                  ? 'bg-sky-500 border-sky-500 text-white shadow-xl shadow-sky-100'
                  : 'bg-white border-slate-50 text-slate-500 hover:border-sky-200'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: Program Selection */}
      <AnimatePresence>
        {selectedBuildings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4"
          >
            <div className="flex items-center gap-2 text-upf-primary font-black text-xs uppercase tracking-widest">
              <div className="w-6 h-6 rounded-full bg-upf-primary/20 flex items-center justify-center text-[10px]">2</div>
              Filières & Programmes
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredPrograms.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    toggleSelection(p.id, selectedPrograms, setSelectedPrograms);
                    setSelectedClasses([]);
                  }}
                  className={`px-5 py-2.5 rounded-2xl border-2 transition-all font-bold text-sm ${
                    selectedPrograms.includes(p.id)
                      ? 'bg-upf-primary border-upf-primary text-white shadow-xl shadow-upf-primary/20'
                      : 'bg-white border-slate-50 text-slate-500 hover:border-upf-primary/30'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3: Params & Launch */}
      <AnimatePresence>
        {selectedPrograms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Semestre</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all">
                  <option value="S1">Semestre 1</option>
                  <option value="S2">Semestre 2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Année Universitaire</label>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all">
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">3</div>
                Classes à générer ({selectedClasses.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredClasses.map(c => (
                  <label key={c.id} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedClasses.includes(c.id) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-50 hover:border-emerald-200'}`}>
                    <input type="checkbox" checked={selectedClasses.includes(c.id)} onChange={() => toggleSelection(c.id, selectedClasses, setSelectedClasses)} className="w-4 h-4 rounded text-emerald-500 border-slate-300 focus:ring-emerald-500" />
                    <span className={`text-sm font-bold ${selectedClasses.includes(c.id) ? 'text-emerald-900' : 'text-slate-600'}`}>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedClasses.length > 0 && (
              <button 
                disabled={isGenerating}
                onClick={handleGenerateSelection}
                className={`w-full py-5 rounded-3xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
                  isGenerating 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-200 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isGenerating ? <ArrowPathIcon className="w-8 h-8 animate-spin" /> : <RocketLaunchIcon className="w-8 h-8" />}
                {isGenerating ? 'L\'IA travaille...' : `Générer ${selectedClasses.length} Emplois du Temps`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal / State */}
      <AnimatePresence>
        {hasGenerated && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500 text-white p-8 rounded-[40px] shadow-2xl shadow-emerald-200 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black">Génération Terminée !</h2>
            <p className="text-emerald-50 font-medium max-w-md">L'IA a terminé de créer les brouillons pour vos classes. Vous pouvez maintenant les vérifier et les publier officiellement.</p>
            <button 
              onClick={() => navigate('/admin/emplois')}
              className="mt-4 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-50 transition-all group"
            >
              Voir les Emplois du Temps
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimetablePage;

