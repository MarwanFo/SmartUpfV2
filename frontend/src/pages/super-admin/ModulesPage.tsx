import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RectangleGroupIcon, PlusIcon, MagnifyingGlassIcon,
  PencilSquareIcon, TrashIcon,
  BookOpenIcon, ScaleIcon, FunnelIcon
} from '@heroicons/react/24/outline';
import { useModulesStore, type AcademicModule } from '../../store/modulesStore';
import { useProgramsStore } from '../../store/programsStore';
import { useModalStore } from '../../store/modalStore';
import ModuleModal from '../../components/admin/ModuleModal';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const ModulesPage: React.FC = () => {
  const { modules, isLoading, fetchModules, deleteModule } = useModulesStore();
  const { programs, fetchPrograms } = useProgramsStore();
  const { openConfirm } = useModalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AcademicModule | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  useEffect(() => {
    fetchModules();
    fetchPrograms();
  }, [fetchModules, fetchPrograms]);

  const handleOpenModal = (academicModule: AcademicModule | null = null) => {
    setSelectedModule(academicModule);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (moduleItem: AcademicModule) => {
    openConfirm({
      title: 'Supprimer le module',
      message: `Voulez-vous vraiment supprimer le module "${moduleItem.name}" (${moduleItem.code}) ? Toutes les notes et plannings rattachés seront impactés.`,
      confirmLabel: 'Supprimer',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteModule(moduleItem.id);
        } catch (err) {
          // Toast handled in store
        }
      }
    });
  };

  const filteredModules = modules
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(m => filterProgram === 'all' || m.programs?.some(p => p.program.id === filterProgram))
    .filter(m => filterSemester === 'all' || m.programs?.some(p => p.semester === filterSemester));

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 md:px-0">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900 via-sky-800 to-blue-950 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20">
              <RectangleGroupIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight font-outfit">Modules & UE</h2>
              <p className="text-cyan-100 font-medium text-lg mt-1 opacity-90">
                Gestion des unités d'enseignement et coefficients
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-3 bg-white text-cyan-900 font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <PlusIcon className="w-6 h-6" />
            Nouveau Module
          </button>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { label: 'Modules Actifs', value: modules.length, icon: RectangleGroupIcon, color: 'bg-white/5 border-white/10' },
            { label: 'Moyenne ECTS', value: modules.length ? (modules.reduce((a, b) => a + b.credits, 0) / modules.length).toFixed(1) : 0, icon: BookOpenIcon, color: 'bg-cyan-500/20 border-cyan-500/20' },
            { label: 'Filières', value: new Set(modules.flatMap(m => m.programs?.map(p => p.id) || [])).size, icon: FunnelIcon, color: 'bg-blue-500/20 border-blue-500/20' },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${s.color} border backdrop-blur-md`}>
              <div className="p-2 bg-white/10 rounded-xl"><s.icon className="w-5 h-5 text-white" /></div>
              <div>
                <div className="text-2xl font-black text-white leading-none">{s.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-1">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 focus-within:border-cyan-200 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-focus-within:bg-cyan-50 group-focus-within:text-cyan-500 transition-all">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rechercher</span>
          </div>
          <input
            type="text"
            placeholder="Code ou nom de module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent"
          />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <FunnelIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filière</span>
          </div>
          <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer">
            <option value="all">Toutes les Filières</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semestre</span>
          </div>
          <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer">
            <option value="all">Tous les Semestres</option>
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Content Grid ── */}
      {isLoading && modules.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 animate-pulse h-64 shadow-sm" />)}
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-slate-300 shadow-sm">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-50 rounded-[2rem] flex items-center justify-center"><RectangleGroupIcon className="w-12 h-12 text-slate-200" /></div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Aucun module trouvé</h3>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map((moduleItem) => (
            <motion.div variants={staggerItem} layout key={moduleItem.id}
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-cyan-200 flex flex-col p-8"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-cyan-400 to-sky-500 w-full" />

              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest bg-slate-50 text-slate-400 uppercase border border-slate-100">
                  {moduleItem.code}
                </span>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black bg-cyan-50 text-cyan-600 border border-cyan-100 uppercase">
                  {moduleItem.programs?.[0]?.semester || 'S-'}
                </span>
              </div>

              <h3 className="font-black text-xl text-slate-800 font-outfit leading-tight mb-6 flex-1 line-clamp-2">
                {moduleItem.name}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Crédits</div>
                  <div className="font-black text-slate-800 flex items-center gap-2"><BookOpenIcon className="w-4 h-4 text-cyan-500" /> {moduleItem.credits} ECTS</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Coefficient</div>
                  <div className="font-black text-slate-800 flex items-center gap-2"><ScaleIcon className="w-4 h-4 text-blue-500" /> x{moduleItem.coefficient}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button onClick={() => handleOpenModal(moduleItem)} className="p-3 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all shadow-sm bg-slate-50">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteClick(moduleItem)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-slate-50">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ModuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        academicModule={selectedModule}
      />
    </div>
  );
};

export default ModulesPage;
