import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOffice2Icon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  AcademicCapIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useBuildingsStore } from '../../store/buildingsStore';
import { useModalStore } from '../../store/modalStore';
import type { Building } from '../../store/buildingsStore';
import BuildingModal from '../../components/admin/BuildingModal';

type ViewMode = 'grid' | 'table';
type FilterStatus = 'all' | 'active' | 'inactive';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const EtablissementsPage: React.FC = () => {
  const { buildings, isLoading, fetchBuildings, createBuilding, updateBuilding, deleteBuilding, hardDeleteBuilding } = useBuildingsStore();
  const { openConfirm } = useModalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => { fetchBuildings(); }, [fetchBuildings]);

  const handleOpenModal = (building: Building | null = null) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedBuilding) {
      await updateBuilding(selectedBuilding.id, data);
    } else {
      await createBuilding(data);
    }
  };

  const handleDeleteClick = (building: Building) => {
    openConfirm({
      title: 'Désactiver l\'établissement',
      message: `Voulez-vous vraiment désactiver "${building.name}" ? Il ne sera plus visible dans les sélections de l'application.`,
      confirmLabel: 'Désactiver',
      type: 'warning',
      onConfirm: async () => {
        try {
          await deleteBuilding(building.id);
        } catch (err) {
          // Toast handle in store
        }
      }
    });
  };

  const handleHardDeleteClick = (building: Building) => {
    openConfirm({
      title: 'SUPPRESSION DÉFINITIVE',
      message: `ATTENTION : Vous allez supprimer DEFINITIVEMENT l'établissement "${building.name}". Cette action est irréversible et supprimera toutes les données liées.`,
      confirmLabel: 'Supprimer définitivement',
      type: 'danger',
      onConfirm: async () => {
        try {
          await hardDeleteBuilding(building.id);
        } catch (err) {}
      }
    });
  };

  const handleActivateClick = async (building: Building) => {
    try {
      await updateBuilding(building.id, { isActive: true });
    } catch (err) {}
  };

  const filteredBuildings = buildings
    .filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(b => {
      if (filterStatus === 'active') return b.isActive;
      if (filterStatus === 'inactive') return !b.isActive;
      return true;
    });

  const totalFilieres = buildings.reduce((s, b) => s + (b._count?.filieres || 0), 0);
  const totalStaff = buildings.reduce((s, b) => s + (b._count?.users || 0), 0);
  const activeCount = buildings.filter(b => b.isActive).length;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 md:px-0">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-orange-950 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20">
              <BuildingOffice2Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight font-outfit">Établissements</h2>
              <p className="text-amber-100 font-medium text-lg mt-1 opacity-90">
                Gestion des pôles académiques et administratifs
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-3 bg-white text-amber-900 font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <PlusIcon className="w-6 h-6" />
            Nouvel Établissement
          </button>
        </div>

        {/* Mini stats */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { label: 'Total', value: buildings.length, icon: BuildingOffice2Icon, color: 'bg-white/5 border-white/10' },
            { label: 'Actifs', value: activeCount, icon: CheckCircleIcon, color: 'bg-emerald-500/20 border-emerald-500/20' },
            { label: 'Filières', value: totalFilieres, icon: AcademicCapIcon, color: 'bg-upf-primary/20 border-upf-primary/20' },
            { label: 'Effectif', value: totalStaff, icon: UsersIcon, color: 'bg-amber-500/20 border-amber-500/20' },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${s.color} border backdrop-blur-md`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Search */}
        <div className="lg:col-span-5 relative group bg-white p-2 px-4 rounded-3xl shadow-sm border border-slate-100 focus-within:border-amber-200 focus-within:ring-4 focus-within:ring-amber-50 transition-all">
          <div className="flex items-center gap-4">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-all" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 text-sm font-bold text-slate-700 outline-none bg-transparent placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Tabs Status Filter */}
        <div className="lg:col-span-4 bg-slate-100 p-1.5 rounded-[2rem] flex items-center shadow-inner">
          {[
            { id: 'all', label: 'Tous', count: buildings.length },
            { id: 'active', label: 'Actifs', count: activeCount },
            { id: 'inactive', label: 'Inactifs', count: buildings.length - activeCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as FilterStatus)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.5rem] text-xs font-black transition-all ${
                filterStatus === tab.id
                  ? 'bg-white text-amber-600 shadow-md scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filterStatus === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Modes */}
        <div className="lg:col-span-3 flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 flex-1">
            <button onClick={() => setViewMode('grid')} className={`flex-1 flex justify-center py-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600 font-black' : 'text-slate-400 font-bold'}`}>Grid</button>
            <button onClick={() => setViewMode('table')} className={`flex-1 flex justify-center py-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-amber-600 font-black' : 'text-slate-400 font-bold'}`}>Table</button>
          </div>
          <button onClick={() => fetchBuildings()} className="p-3.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all shadow-sm bg-white border border-slate-100">
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading && buildings.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-10 animate-pulse h-80" />)}
        </div>
      ) : filteredBuildings.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-slate-300 shadow-sm">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-50 rounded-[2rem] flex items-center justify-center"><BuildingOffice2Icon className="w-12 h-12 text-slate-200" /></div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Aucun établissement trouvé</h3>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredBuildings.map((building) => (
            <motion.div variants={staggerItem} layout key={building.id}
              className={`group relative bg-white rounded-[2.5rem] border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${building.isActive ? 'border-slate-100' : 'opacity-70 grayscale border-red-100'}`}
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${building.isActive ? 'from-amber-400 to-orange-500' : 'from-slate-400 to-slate-500'}`} />

              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    {building.logoUrl ? <img src={building.logoUrl} alt="" className="w-full h-full object-contain p-2" /> : <BuildingOffice2Icon className="w-10 h-10 text-slate-200" />}
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${building.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                    {building.isActive ? 'En Service' : 'Désactivé'}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl tracking-[0.1em] border border-amber-100 uppercase">{building.code}</span>
                </div>
                <h3 className="font-black text-2xl text-slate-800 font-outfit tracking-tight group-hover:text-amber-600 transition-colors">{building.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mt-2">
                  <MapPinIcon className="w-4 h-4 text-slate-300" />
                  <span className="truncate">{building.address}</span>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Salles', value: building.numRooms || 0, icon: BuildingOffice2Icon, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Filières', value: building._count?.filieres || 0, icon: AcademicCapIcon, color: 'text-upf-primary bg-upf-primary/10' },
                    { label: 'Staff', value: building._count?.users || 0, icon: UsersIcon, color: 'text-emerald-600 bg-emerald-50' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl ${stat.color} flex items-center justify-center mb-2 shadow-sm`}><stat.icon className="w-5 h-5" /></div>
                      <div className="text-lg font-black text-slate-800">{stat.value}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-2">
                  {building.isActive ? (
                    <>
                      <button onClick={() => handleOpenModal(building)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all">
                        <PencilSquareIcon className="w-4 h-4" /> MODIFIER
                      </button>
                      <button onClick={() => handleDeleteClick(building)} className="p-3 rounded-2xl text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm" title="Désactiver">
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleHardDeleteClick(building)} className="p-3 rounded-2xl text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-100 transition-all shadow-sm" title="Supprimer définitivement">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleActivateClick(building)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-100 transition-all">
                        <ArrowPathIcon className="w-4 h-4" /> RÉACTIVER
                      </button>
                      <button onClick={() => handleHardDeleteClick(building)} className="p-3 rounded-2xl text-red-600 bg-white hover:bg-red-600 hover:text-white border border-red-200 transition-all shadow-sm" title="Supprimer définitivement">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Établissement</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Infrastructures</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBuildings.map(building => (
                  <tr key={building.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          {building.logoUrl ? <img src={building.logoUrl} alt="" className="w-full h-full object-contain p-2" /> : <BuildingOffice2Icon className="w-6 h-6 text-slate-200" />}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 leading-none mb-1">{building.name}</div>
                          <div className="text-xs font-bold text-slate-400">{building.code} • {building.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-6">
                        <div className="text-center"><div className="text-sm font-black text-slate-800">{building.numRooms}</div><div className="text-[9px] font-black text-slate-400 uppercase">Salles</div></div>
                        <div className="text-center"><div className="text-sm font-black text-slate-800">{building._count?.filieres}</div><div className="text-[9px] font-black text-slate-400 uppercase">Filières</div></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${building.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {building.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {building.isActive ? (
                          <>
                            <button onClick={() => handleOpenModal(building)} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteClick(building)} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all" title="Désactiver"><XMarkIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleHardDeleteClick(building)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all" title="Supprimer définitivement"><TrashIcon className="w-5 h-5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleActivateClick(building)} className="p-3 text-emerald-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-emerald-100 transition-all"><ArrowPathIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleHardDeleteClick(building)} className="p-3 text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"><TrashIcon className="w-5 h-5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <BuildingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        building={selectedBuilding}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EtablissementsPage;

