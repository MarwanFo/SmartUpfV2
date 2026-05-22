import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon,
  HashtagIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  XMarkIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useClassesStore } from '../../store/classesStore';
import { useBuildingsStore } from '../../store/buildingsStore';
import { useAuthStore } from '../../store/authStore';
import { useProgramsStore } from '../../store/programsStore';
import { useModalStore } from '../../store/modalStore';

const ClassesPage: React.FC = () => {
  const { classes, isLoading, fetchClasses, createClass, updateClass, deleteClass, splitPromotion, fetchClassById } = useClassesStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const { programs, fetchPrograms } = useProgramsStore();
  const { openConfirm } = useModalStore();
  const { accessToken } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [hasManuallyEditedName, setHasManuallyEditedName] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState<any | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    academicYear: '2025-2026',
    capacity: 30,
    roomNumber: '',
    programId: '',
    buildingId: ''
  });

  const [splitData, setSplitData] = useState({
    programId: '',
    level: 1,
    academicYear: '2025-2026',
    buildingId: '',
    numGroups: 2
  });

  useEffect(() => {
    if (accessToken) {
      fetchClasses();
      fetchBuildings();
      fetchPrograms();
    }
  }, [fetchClasses, fetchBuildings, fetchPrograms, accessToken]);

  useEffect(() => {
    if (!hasManuallyEditedName && formData.programId && formData.level) {
      const selectedProg = programs.find(p => p.id === formData.programId);
      if (selectedProg) {
        const code = selectedProg.code || 'CLASS';
        setFormData(prev => ({
          ...prev,
          name: `${code}${formData.level}-A`
        }));
      }
    }
  }, [formData.programId, formData.level, hasManuallyEditedName, programs]);



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData);
      } else {
        await createClass(formData);
      }
      setIsModalOpen(false);
      toast.success('Classe enregistrée !');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setHasManuallyEditedName(false);
    setFormData({
      name: '',
      level: 1,
      academicYear: '2025-2026',
      capacity: 30,
      roomNumber: '',
      programId: '',
      buildingId: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (c: any) => {
    setEditingClass(c);
    setHasManuallyEditedName(true);
    setFormData({
      name: c.name,
      level: c.level,
      academicYear: c.academicYear || '2025-2026',
      capacity: c.capacity || 30,
      roomNumber: c.roomNumber || '',
      programId: c.programId || '',
      buildingId: c.buildingId || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (c: any) => {
    openConfirm({
      title: 'Supprimer la classe',
      message: `Voulez-vous vraiment supprimer la classe "${c.name}" ? Tous les étudiants et plannings associés seront affectés.`,
      confirmLabel: 'Supprimer définitivement',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteClass(c.id);
          toast.success('Classe supprimée');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
        }
      }
    });
  };
  const handleSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await splitPromotion(splitData);
      setIsSplitModalOpen(false);
      toast.success('Promotion divisée avec succès !');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la division';
      toast.error(message, {
        duration: 5000,
        icon: '⚠️',
        style: {
          borderRadius: '1rem',
          background: '#FFFBEB',
          color: '#92400E',
          border: '1px solid #FEF3C7',
          fontWeight: 'bold'
        }
      });
    }
  };


  const handleShowList = async (id: string) => {
    setIsDetailsLoading(true);
    setIsListModalOpen(true);
    try {
      const details = await fetchClassById(id);
      setSelectedClassDetails(details);
    } catch (err) {
      toast.error('Impossible de charger la liste');
      setIsListModalOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };
  const getLevelsForProgram = (programId: string) => {
    if (!programId) return [1];
    const program = programs.find(p => p.id === programId);
    const duration = program?.duration || 3;
    return Array.from({ length: duration }, (_, i) => i + 1);
  };


  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedBuilding || c.buildingId === selectedBuilding) &&
    (!selectedProgram || c.programId === selectedProgram)
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-upf-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-upf-primary/20">
            <UserGroupIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Classes</h1>
            <p className="text-slate-500 font-medium text-lg">Organisation des promotions et sections</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsSplitModalOpen(true)}
            className="flex items-center gap-3 bg-amber-50 text-amber-600 font-black px-6 py-3 rounded-2xl border border-amber-200 transition-all hover:bg-amber-100 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowsRightLeftIcon className="w-5 h-5" />
            Diviser Promotion
          </button>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-8 py-3 bg-upf-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-upf-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle Classe
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 focus-within:border-upf-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-focus-within:bg-upf-primary/10 group-focus-within:text-upf-primary transition-all">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recherche</span>
          </div>
          <input 
            type="text"
            placeholder="Nom de la classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent"
          />
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <BuildingOfficeIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Établissement</span>
          </div>
          <select 
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent"
          >
            <option value="">Tous les établissements</option>
            {buildings.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <AcademicCapIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filière</span>
          </div>
          <select 
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent"
          >
            <option value="">Toutes les filières</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center p-24 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-upf-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-[3.5rem] p-24 text-center border border-dashed border-slate-300 shadow-sm">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-50 rounded-[2rem] flex items-center justify-center">
            <UserGroupIcon className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Aucune classe trouvée</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto text-lg font-medium">Modifiez vos filtres ou créez une nouvelle classe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
            >
              {/* Status Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-upf-primaryLight to-sky-400" />

              <div className="flex justify-between items-start">
                <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-upf-primary/10 group-hover:scale-110 transition-all duration-300">
                  <UserGroupIcon className="w-6 h-6 text-slate-600 group-hover:text-upf-primary" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEditClick(c)} className="p-3 text-slate-400 hover:text-upf-primary hover:bg-upf-primary/10 rounded-xl transition-all">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(c)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1">{c.name}</h3>
                <p className="text-sm text-slate-400 font-bold tracking-tight uppercase mt-1">{c.program?.name}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 text-xs font-black text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{c.building?.name || 'UPF'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-black text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <HashtagIcon className="w-4 h-4 text-slate-400" />
                  <span>Salle {c.roomNumber || '-'}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                        U
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-black text-slate-500 tracking-tighter">
                    {c._count?.students || 0} / {c.capacity || 30} PLACES
                  </span>
                </div>
                <button 
                  onClick={() => handleShowList(c.id)}
                  className="p-2 rounded-xl bg-slate-50 text-upf-primary hover:bg-upf-primary hover:text-white transition-all shadow-sm"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Creation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-8" >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-3xl bg-upf-primary flex items-center justify-center text-white shadow-xl shadow-upf-primary/20">
                  <UserGroupIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingClass ? 'Modifier Classe' : 'Nouvelle Classe'}</h2>
                  <p className="text-slate-500 font-medium">Configurez les paramètres académiques</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Établissement</label>
                    <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20" value={formData.buildingId} onChange={e => setFormData({...formData, buildingId: e.target.value, programId: ''})}>
                      <option value="">Sélectionner</option>
                      {buildings.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Filière</label>
                    <select required disabled={!formData.buildingId} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20 disabled:opacity-50" value={formData.programId} onChange={e => setFormData({...formData, programId: e.target.value})}>
                      <option value="">Choisir</option>
                      {programs.filter(p => p.buildingId === formData.buildingId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Niveau</label>
                    <select required disabled={!formData.programId} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20 disabled:opacity-50" value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value)})}>
                      {getLevelsForProgram(formData.programId).map(l => (
                        <option key={l} value={l}>{l === 1 ? '1ère' : `${l}ème`} Année</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Année académique</label>
                    <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-upf-primary/20" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})}>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2026-2027">2026-2027</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Capacité</label>
                    <input type="number" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-upf-primary/20" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Salle ppale</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-upf-primary/20" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} placeholder="Ex: A1" />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom de classe</label>
                    <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-upf-primary outline-none focus:ring-2 focus:ring-upf-primary/20" value={formData.name} onChange={e => { setHasManuallyEditedName(true); setFormData({...formData, name: e.target.value}); }} />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all">Annuler</button>
                  <button type="submit" className="flex-1 py-4 bg-upf-primary text-white font-black rounded-2xl shadow-xl shadow-upf-primary/20 hover:bg-upf-primary transition-all active:scale-95">
                    {editingClass ? 'Mettre à jour' : 'Créer la classe'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Split Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSplitModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <ArrowsRightLeftIcon className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">Diviser Promotion</h2>
                    <p className="text-slate-500 font-medium">Répartition automatique des groupes</p>
                  </div>
                </div>

                <form onSubmit={handleSplit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Établissement</label>
                      <select 
                        required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                        value={splitData.buildingId} 
                        onChange={e => setSplitData({...splitData, buildingId: e.target.value, programId: ''})}
                      >
                        <option value="">Sélectionner</option>
                        {buildings.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niveau</label>
                      <select 
                        disabled={!splitData.programId}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                        value={splitData.level} onChange={e => setSplitData({...splitData, level: Number(e.target.value)})}
                      >
                        {getLevelsForProgram(splitData.programId).map(l => (
                          <option key={l} value={l}>{l === 1 ? '1ère' : `${l}ème`} Année</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filière</label>
                    <select 
                      required 
                      disabled={!splitData.buildingId}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                      value={splitData.programId} 
                      onChange={e => setSplitData({...splitData, programId: e.target.value})}
                    >
                      <option value="">{splitData.buildingId ? 'Sélectionner la filière' : 'Sélectionnez un établissement'}</option>
                      {programs
                        .filter(p => p.buildingId === splitData.buildingId)
                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                      }
                    </select>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100/50 mt-6">
                    <label className="text-xs font-black text-amber-800 uppercase tracking-widest">Nombre de groupes</label>
                    <div className="flex items-center gap-6 mt-4">
                      <input 
                        type="range" min="2" max="6" step="1"
                        className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        value={splitData.numGroups} onChange={e => setSplitData({...splitData, numGroups: Number(e.target.value)})}
                      />
                      <span className="text-4xl font-black text-amber-600 drop-shadow-sm">{splitData.numGroups}</span>
                    </div>
                    <p className="text-[10px] text-amber-700/70 mt-3 font-medium leading-relaxed">
                      * Le système répartira les étudiants par ordre alphabétique pour assurer l'équilibre des groupes.
                    </p>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={() => setIsSplitModalOpen(false)} className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200 active:scale-95">
                      Annuler
                    </button>
                    <button type="submit" className="flex-[2] px-4 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/40 active:scale-95">
                      Lancer la Division
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsListModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col p-8" >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-upf-primary/10 rounded-2xl flex items-center justify-center text-upf-primary">
                    <UserGroupIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Liste Étudiants</h2>
                    <p className="text-slate-500 font-medium">{selectedClassDetails?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsListModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {isDetailsLoading ? (
                  <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-upf-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : selectedClassDetails?.students?.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-upf-primary shadow-sm">
                        {s.user?.firstName?.[0]}{s.user?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 leading-none">{s.user?.firstName} {s.user?.lastName}</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1 tracking-tight">{s.user?.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-3 py-1.5 bg-upf-primary/10 text-upf-primary rounded-full tracking-wider">{s.cne || 'CNE-N/A'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Split Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSplitModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <ArrowsRightLeftIcon className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">Diviser Promotion</h2>
                    <p className="text-slate-500 font-medium">Répartition automatique des groupes</p>
                  </div>
                </div>

                <form onSubmit={handleSplit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Établissement</label>
                      <select 
                        required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                        value={splitData.buildingId} 
                        onChange={e => setSplitData({...splitData, buildingId: e.target.value, programId: ''})}
                      >
                        <option value="">Sélectionner</option>
                        {buildings.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niveau</label>
                      <select 
                        disabled={!splitData.programId}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                        value={splitData.level} onChange={e => setSplitData({...splitData, level: Number(e.target.value)})}
                      >
                        {getLevelsForProgram(splitData.programId).map(l => (
                          <option key={l} value={l}>{l === 1 ? '1ère' : `${l}ème`} Année</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filière</label>
                    <select 
                      required 
                      disabled={!splitData.buildingId}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                      value={splitData.programId} 
                      onChange={e => setSplitData({...splitData, programId: e.target.value})}
                    >
                      <option value="">{splitData.buildingId ? 'Sélectionner la filière' : 'Sélectionnez un établissement'}</option>
                      {programs
                        .filter(p => p.buildingId === splitData.buildingId)
                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                      }
                    </select>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100/50 mt-6">
                    <label className="text-xs font-black text-amber-800 uppercase tracking-widest">Nombre de groupes</label>
                    <div className="flex items-center gap-6 mt-4">
                      <input 
                        type="range" min="2" max="6" step="1"
                        className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        value={splitData.numGroups} onChange={e => setSplitData({...splitData, numGroups: Number(e.target.value)})}
                      />
                      <span className="text-4xl font-black text-amber-600 drop-shadow-sm">{splitData.numGroups}</span>
                    </div>
                    <p className="text-[10px] text-amber-700/70 mt-3 font-medium leading-relaxed">
                      * Le système répartira les étudiants par ordre alphabétique pour assurer l'équilibre des groupes.
                    </p>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={() => setIsSplitModalOpen(false)} className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200 active:scale-95">
                      Annuler
                    </button>
                    <button type="submit" className="flex-[2] px-4 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/40 active:scale-95">
                      Lancer la Division
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClassesPage;

