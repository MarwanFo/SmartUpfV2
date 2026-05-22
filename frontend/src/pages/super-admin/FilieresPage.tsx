import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, PlusIcon, MagnifyingGlassIcon, 
  PencilSquareIcon, TrashIcon, 
  BuildingLibraryIcon, BookOpenIcon, StarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useProgramsStore, type Program } from '../../store/programsStore';
import { useModalStore } from '../../store/modalStore';
import ProgramModal from '../../components/admin/ProgramModal';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const FilieresPage: React.FC = () => {
  const { programs, isLoading, fetchPrograms, deleteProgram } = useProgramsStore();
  const { openConfirm } = useModalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCycle, setFilterCycle] = useState('all');

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleOpenModal = (program: Program | null = null) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (program: Program) => {
    openConfirm({
      title: 'Supprimer la filière',
      message: `Voulez-vous vraiment supprimer la filière "${program.name}" (${program.code}) ? Tous les modules et plannings associés seront impactés.`,
      confirmLabel: 'Supprimer',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteProgram(program.id);
        } catch (err) {
          // Toast handled in store or here
        }
      }
    });
  };

  const filteredPrograms = programs
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => filterCycle === 'all' || p.cycle === filterCycle);

  const getCycleColor = (cycle: string) => {
    const colors: Record<string, string> = {
      'LICENCE': 'bg-blue-50 text-blue-600 border-blue-200',
      'MASTER': 'bg-purple-50 text-purple-600 border-purple-200',
      'INGENIEUR': 'bg-upf-primary/10 text-upf-primary border-upf-primary/30',
      'PREPA': 'bg-amber-50 text-amber-600 border-amber-200',
      'DOCTORAT': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'FORMATION_PRO': 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return colors[cycle] || colors['LICENCE'];
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 md:px-0">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-upf-primary via-upf-primary to-indigo-950 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2.5L35 17l-15 3.5zM40 20A20 20 0 1 1 0 20a20 20 0 0 1 40 0zm-2 0a18 18 0 1 0-36 0 18 18 0 0 0 36 0z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20">
              <BookOpenIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight font-outfit">Filières & LMD</h2>
              <p className="text-upf-primary/30 font-medium text-sm md:text-lg mt-1 opacity-90">
                Architecture pédagogique
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-white text-upf-primary font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap text-sm md:text-base"
          >
            <PlusIcon className="w-6 h-6" />
            Nouvelle Filière
          </button>
        </div>

        {/* Stats Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { label: 'Total Filières', value: programs.length, icon: BookOpenIcon, color: 'bg-white/5 border-white/10' },
            { label: 'Ingénierie', value: programs.filter(p=>p.cycle==='INGENIEUR').length, icon: StarIcon, color: 'bg-upf-primary/20 border-upf-primary/20' },
            { label: 'Licences', value: programs.filter(p=>p.cycle==='LICENCE').length, icon: AcademicCapIcon, color: 'bg-blue-500/20 border-blue-500/20' },
            { label: 'Masters', value: programs.filter(p=>p.cycle==='MASTER').length, icon: BuildingLibraryIcon, color: 'bg-purple-500/20 border-purple-500/20' },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${s.color} border backdrop-blur-md`}>
              <div className="p-2 bg-white/10 rounded-xl">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-white leading-none">{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-1">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 focus-within:border-upf-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-focus-within:bg-upf-primary/10 group-focus-within:text-upf-primary transition-all">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rechercher</span>
          </div>
          <input
            type="text"
            placeholder="Nom ou code de la filière..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent"
          />
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <ClockIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle</span>
          </div>
          <select 
            value={filterCycle} 
            onChange={(e) => setFilterCycle(e.target.value)}
            className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
          >
            <option value="all">Tous les cycles</option>
            <option value="LICENCE">Licence</option>
            <option value="MASTER">Master</option>
            <option value="INGENIEUR">Ingénierie</option>
            <option value="PREPA">Classes Prépas</option>
            <option value="DOCTORAT">Doctorat</option>
          </select>
        </div>
      </div>

      {/* ── Content Grid ── */}
      {isLoading && programs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 animate-pulse h-64 shadow-sm"></div>
          ))}
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-slate-300 shadow-sm">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-50 rounded-[2rem] flex items-center justify-center">
            <BookOpenIcon className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Aucune filière trouvée</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto text-lg">Ajustez vos filtres ou créez une nouvelle filière.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <motion.div variants={staggerItem} layout key={program.id}
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-upf-primary/30 flex flex-col p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] bg-slate-50 text-slate-400 uppercase border border-slate-100 group-hover:bg-upf-primary/10 group-hover:text-upf-primaryLight group-hover:border-upf-primary/20 transition-all">
                  {program.code}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getCycleColor(program.cycle)}`}>
                  {program.cycle}
                </span>
              </div>
              
              <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-tight mb-4 flex-1">
                {program.name}
              </h3>
              
              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-xs font-black text-slate-500">
                  <div className="p-2 bg-slate-50 rounded-lg"><ClockIcon className="w-4 h-4" /></div>
                  <span>{program.duration} AN(S) D'ÉTUDES</span>
                </div>
                {program.building && (
                  <div className="flex items-center gap-3 text-xs font-black text-slate-500">
                    <div className="p-2 bg-slate-50 rounded-lg"><BuildingLibraryIcon className="w-4 h-4" /></div>
                    <span className="truncate">{program.building.name}</span>
                  </div>
                )}
              </div>

              {/* Actions Float */}
              <div className="mt-8 flex items-center justify-end gap-2 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button onClick={() => handleOpenModal(program)} className="p-3 text-slate-400 hover:text-upf-primary hover:bg-upf-primary/10 rounded-xl transition-all shadow-sm bg-slate-50">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteClick(program)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-slate-50">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ProgramModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        program={selectedProgram} 
      />
    </div>
  );
};

export default FilieresPage;

