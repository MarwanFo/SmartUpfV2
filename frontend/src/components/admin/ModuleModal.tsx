import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, RectangleGroupIcon, IdentificationIcon, BookOpenIcon, ScaleIcon, CheckBadgeIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useModulesStore, type AcademicModule } from '../../store/modulesStore';
import { useProgramsStore } from '../../store/programsStore';
import { useBuildingsStore } from '../../store/buildingsStore';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicModule: AcademicModule | null;
}

const SEMESTERS = ['S1', 'S2'];

const ModuleModal: React.FC<ModuleModalProps> = ({ isOpen, onClose, academicModule }) => {
  const { createModule, updateModule } = useModulesStore();
  const { programs, fetchPrograms } = useProgramsStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);

  const [formData, setFormData] = useState<{
    links: { programId: string; year: number; semester: string; weeklyHours: number }[];
    code: string;
    name: string;
    credits: number;
    coefficient: number;
  }>({
    links: [],
    code: '',
    name: '',
    credits: 4,
    coefficient: 1,
  });

  useEffect(() => {
    if (isOpen) {
      fetchPrograms();
      fetchBuildings();
      if (academicModule) {
        setFormData({
          links: academicModule.programs?.map(p => ({
            programId: p.program.id,
            year: p.year,
            semester: p.semester,
            weeklyHours: (p as any).weeklyHours || 4.0
          })) || [],
          code: academicModule.code,
          name: academicModule.name,
          credits: academicModule.credits,
          coefficient: academicModule.coefficient,
        });
        // Auto-select buildings based on existing programs
        const buildingIds = academicModule.programs?.map(p => p.program.buildingId).filter(Boolean) as string[];
        setSelectedBuildingIds(Array.from(new Set(buildingIds)));
      } else {
        setFormData({
          links: [],
          code: '',
          name: '',
          credits: 4,
          coefficient: 1,
        });
      }
    }
  }, [isOpen, academicModule, fetchPrograms, fetchBuildings]);
  // Filtered programs based on selected buildings
  const filteredPrograms = selectedBuildingIds.length > 0 
    ? programs.filter(p => p.buildingId && selectedBuildingIds.includes(p.buildingId))
    : [];

  // Calculate max years for a specific program
  const getAvailableYears = (programId: string) => {
    const prog = programs.find(p => p.id === programId);
    const duration = prog?.duration || 5;
    return Array.from({ length: duration }, (_, i) => i + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        links: formData.links,
        code: formData.code,
        name: formData.name,
        credits: Number(formData.credits),
        coefficient: Number(formData.coefficient),
      };

      if (academicModule) {
        await updateModule(academicModule.id, payload);
      } else {
        await createModule(payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <RectangleGroupIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 font-outfit">
                      {academicModule ? 'Modifier le Module' : 'Nouveau Module'}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">Configurez les unités d'enseignement.</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all relative z-10 border border-slate-200/60 hover:border-red-100">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                <form id="moduleForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Affectation */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BookOpenIcon className="w-4 h-4 text-slate-400" />
                      Affectation Académique
                    </h3>
                    <div className="space-y-6">
                      {/* Select Buildings */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2.5 ml-1">Établissement(s) *</label>
                        <div className="flex flex-wrap gap-2">
                          {buildings.filter(b => b.isActive).map(b => {
                            const isSelected = selectedBuildingIds.includes(b.id);
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedBuildingIds(selectedBuildingIds.filter(id => id !== b.id));
                                    // Also remove programs that were from this building
                                    const programsFromThisBuilding = programs.filter(p => p.buildingId === b.id).map(p => p.id);
                                    setFormData({
                                      ...formData,
                                      links: formData.links.filter(l => !programsFromThisBuilding.includes(l.programId))
                                    });
                                  } else {
                                    setSelectedBuildingIds([...selectedBuildingIds, b.id]);
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2 ${
                                  isSelected 
                                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                }`}
                              >
                                <BuildingOffice2Icon className="w-3.5 h-3.5" />
                                {b.code}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <div className="w-full">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Filière(s) de rattachement & Configuration *</label>
                          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar p-1 bg-white rounded-xl border border-slate-200/60 shadow-inner">
                            {filteredPrograms.map(p => {
                              const currentLink = formData.links.find(l => l.programId === p.id);
                              const isSelected = !!currentLink;
                              
                              return (
                                <div 
                                  key={p.id}
                                  className={`group relative flex flex-col md:flex-row md:items-center p-4 rounded-xl border-2 transition-all duration-200 gap-4 ${
                                    isSelected 
                                      ? 'border-cyan-500 bg-cyan-50/50 shadow-sm shadow-cyan-500/10' 
                                      : 'border-white bg-white hover:border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <div 
                                    onClick={() => {
                                      if (isSelected) {
                                        setFormData({...formData, links: formData.links.filter(l => l.programId !== p.id)});
                                      } else {
                                        setFormData({...formData, links: [...formData.links, { programId: p.id, year: 1, semester: 'S1', weeklyHours: 4.0 }]});
                                      }
                                    }}
                                    className="flex items-center flex-1 cursor-pointer"
                                  >
                                    <div className={`w-6 h-6 flex shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                                      isSelected 
                                        ? 'bg-cyan-500 border-cyan-500 text-white' 
                                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                                    }`}>
                                      {isSelected && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <div className="ml-4">
                                      <div className={`text-sm font-bold ${isSelected ? 'text-cyan-900' : 'text-slate-700'}`}>{p.code}</div>
                                      <div className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${isSelected ? 'text-cyan-700/80' : 'text-slate-500'}`}>{p.name}</div>
                                    </div>
                                  </div>

                                  {isSelected && (
                                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-cyan-200 shadow-sm self-end md:self-auto animate-in fade-in slide-in-from-right-4">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-cyan-600 uppercase ml-1">Année</span>
                                        <select 
                                          value={currentLink.year} 
                                          onChange={(e) => {
                                            const newLinks = formData.links.map(l => l.programId === p.id ? { ...l, year: Number(e.target.value) } : l);
                                            setFormData({ ...formData, links: newLinks });
                                          }}
                                          className="text-xs font-bold text-slate-700 bg-slate-50 border-none rounded-md py-1 px-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                                        >
                                          {getAvailableYears(p.id).map(y => <option key={y} value={y}>An {y}</option>)}
                                        </select>
                                      </div>
                                      <div className="w-px h-8 bg-slate-100 mx-1" />
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-cyan-600 uppercase ml-1">Semestre</span>
                                        <select 
                                          value={currentLink.semester} 
                                          onChange={(e) => {
                                            const newLinks = formData.links.map(l => l.programId === p.id ? { ...l, semester: e.target.value } : l);
                                            setFormData({ ...formData, links: newLinks });
                                          }}
                                          className="text-xs font-bold text-slate-700 bg-slate-50 border-none rounded-md py-1 px-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                                        >
                                          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                      </div>
                                      <div className="w-px h-8 bg-slate-100 mx-1" />
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-cyan-600 uppercase ml-1">Heures/Sem</span>
                                        <input 
                                          type="number"
                                          step="0.5"
                                          min="0.5"
                                          max="20"
                                          value={isNaN(currentLink.weeklyHours) ? '' : currentLink.weeklyHours}
                                          onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                            const newLinks = formData.links.map(l => l.programId === p.id ? { ...l, weeklyHours: val } : l);
                                            setFormData({ ...formData, links: newLinks });
                                          }}
                                          className="text-xs font-bold text-slate-700 bg-slate-50 border-none rounded-md py-1 px-2 focus:ring-1 focus:ring-cyan-500 outline-none w-14"
                                          placeholder="4.0"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {selectedBuildingIds.length === 0 && <span className="text-sm text-slate-500 italic p-6 text-center">Sélectionnez d'abord un établissement ci-dessus</span>}
                            {selectedBuildingIds.length > 0 && filteredPrograms.length === 0 && <span className="text-sm text-slate-500 italic p-6 text-center">Aucune filière trouvée pour ces établissements</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identity */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <IdentificationIcon className="w-4 h-4 text-slate-400" />
                      Identité du Module
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Code *</label>
                        <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm font-medium uppercase" placeholder="Ex: M101" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Intitulé du Module *</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm font-medium" placeholder="Ex: Algorithmique Avancée" />
                      </div>
                    </div>
                  </div>

                  {/* Pédagogie */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ScaleIcon className="w-4 h-4 text-slate-400" />
                      Poids Pédagogique
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 flex items-center gap-1">Crédits ECTS * <CheckBadgeIcon className="w-3.5 h-3.5 text-cyan-500" /></label>
                        <input type="number" min="1" max="30" step="1" required value={formData.credits} onChange={e => setFormData({...formData, credits: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Coefficient *</label>
                        <input type="number" min="0.5" max="10" step="0.5" required value={formData.coefficient} onChange={e => setFormData({...formData, coefficient: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm font-bold text-slate-700" />
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all">
                  Annuler
                </button>
                <button
                  type="submit"
                  form="moduleForm"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {academicModule ? 'Enregistrer les modifications' : 'Créer le module'}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModuleModal;
