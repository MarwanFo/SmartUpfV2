import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, AcademicCapIcon, MapPinIcon, IdentificationIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useProgramsStore, type Program } from '../../store/programsStore';
import { useBuildingsStore } from '../../store/buildingsStore';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
}

const CYCLES = [
  { value: 'LICENCE', label: 'Licence (Bac+3)' },
  { value: 'MASTER', label: 'Master (Bac+5)' },
  { value: 'INGENIEUR', label: 'Cycle Ingénieur (Bac+5)' },
  { value: 'PREPA', label: 'Cycle Préparatoire (Bac+2)' },
  { value: 'DOCTORAT', label: 'Doctorat (Bac+8)' },
  { value: 'FORMATION_PRO', label: 'Formation Professionnelle' },
];

const ProgramModal: React.FC<ProgramModalProps> = ({ isOpen, onClose, program }) => {
  const { createProgram, updateProgram } = useProgramsStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    cycle: 'LICENCE',
    duration: 3,
    buildingId: '',
    hasPFA: false,
    pfaYear: 2,
    pfaSemester: 'S2',
    hasPFE: false,
    pfeYear: 3,
    pfeSemester: 'S2',
  });

  useEffect(() => {
    if (isOpen) {
      fetchBuildings();
      if (program) {
        setFormData({
          code: program.code,
          name: program.name,
          cycle: program.cycle,
          duration: program.duration,
          buildingId: program.buildingId || '',
          hasPFA: program.hasPFA || false,
          pfaYear: program.pfaYear || 2,
          pfaSemester: (program.pfaSemester as string) || 'S2',
          hasPFE: program.hasPFE || false,
          pfeYear: program.pfeYear || 3,
          pfeSemester: (program.pfeSemester as string) || 'S2',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          cycle: 'LICENCE',
          duration: 3,
          buildingId: '',
          hasPFA: false,
          pfaYear: 2,
          pfaSemester: 'S2',
          hasPFE: false,
          pfeYear: 3,
          pfeSemester: 'S2',
        });
      }
    }
  }, [isOpen, program, fetchBuildings]);

  // Adjust duration based on cycle
  useEffect(() => {
    if (!program) {
      if (formData.cycle === 'LICENCE') setFormData(f => ({ ...f, duration: 3 }));
      if (formData.cycle === 'MASTER' || formData.cycle === 'PREPA') setFormData(f => ({ ...f, duration: 2 }));
      if (formData.cycle === 'INGENIEUR' || formData.cycle === 'DOCTORAT') setFormData(f => ({ ...f, duration: 3 }));
    }
  }, [formData.cycle, program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        code: formData.code,
        name: formData.name,
        cycle: formData.cycle,
        duration: Number(formData.duration),
        buildingId: formData.buildingId || undefined,
        hasPFA: formData.hasPFA,
        pfaYear: formData.hasPFA ? Number(formData.pfaYear) : null,
        pfaSemester: formData.hasPFA ? formData.pfaSemester : null,
        hasPFE: formData.hasPFE,
        pfeYear: formData.hasPFE ? Number(formData.pfeYear) : null,
        pfeSemester: formData.hasPFE ? formData.pfeSemester : null,
      };

      if (program) {
        await updateProgram(program.id, payload);
      } else {
        await createProgram(payload);
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-upf-primary to-purple-600 flex items-center justify-center shadow-lg shadow-upf-primary/20">
                    <AcademicCapIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">
                      {program ? 'Modifier la Filière' : 'Nouvelle Filière'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Structurez votre offre de formation académique.</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all relative z-10 border border-slate-200/60 hover:border-red-100">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                <form id="programForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Identity */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <IdentificationIcon className="w-4 h-4 text-slate-400" />
                      Identité de la filière
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Code *</label>
                        <div className="relative">
                          <TagIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary outline-none transition-all text-sm font-medium uppercase" placeholder="Ex: GL" />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Intitulé *</label>
                        <div className="relative">
                          <AcademicCapIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary outline-none transition-all text-sm font-medium" placeholder="Ex: Génie Logiciel" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Architecture */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-slate-400" />
                      Architecture LMD
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Cycle *</label>
                        <select required value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary outline-none transition-all text-sm font-bold text-slate-700">
                          {CYCLES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Durée (Années) *</label>
                        <input type="number" min="1" max="7" required value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary outline-none transition-all text-sm font-bold text-slate-700" />
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      Localisation Principale
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Établissement rattaché (Optionnel)</label>
                      <select value={formData.buildingId} onChange={e => setFormData({...formData, buildingId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary outline-none transition-all text-sm font-medium text-slate-700">
                        <option value="">Campus Général (Non assigné)</option>
                        {buildings.filter(b => b.isActive).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Projet PFA/PFE Config */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <AcademicCapIcon className="w-4 h-4 text-upf-primary" />
                      Configuration des Projets (PFA / PFE)
                    </h3>

                    <div className="space-y-6">
                      {/* PFA Section */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.hasPFA ? 'bg-upf-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                              <TagIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight">Projet de Fin d'Année (PFA)</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Activer le suivi PFA pour cette filière</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={formData.hasPFA} onChange={e => setFormData({...formData, hasPFA: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-upf-primary"></div>
                          </label>
                        </div>

                        {formData.hasPFA && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Année académique</label>
                              <select value={formData.pfaYear} onChange={e => setFormData({...formData, pfaYear: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-upf-primary/20">
                                {[...Array(formData.duration)].map((_, i) => <option key={i+1} value={i+1}>{i+1}ère Année</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Semestre</label>
                              <select value={formData.pfaSemester} onChange={e => setFormData({...formData, pfaSemester: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-upf-primary/20">
                                <option value="S1">Semestre 1</option>
                                <option value="S2">Semestre 2</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PFE Section */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.hasPFE ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                              <AcademicCapIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight">Projet de Fin d'Études (PFE)</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Activer le suivi PFE pour cette filière</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={formData.hasPFE} onChange={e => setFormData({...formData, hasPFE: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        {formData.hasPFE && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Année académique</label>
                              <select value={formData.pfeYear} onChange={e => setFormData({...formData, pfeYear: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20">
                                {[...Array(formData.duration)].map((_, i) => <option key={i+1} value={i+1}>{i+1 === 1 ? '1ère' : i+1 === formData.duration ? 'Dernière' : i+1 + 'ème'} Année</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Semestre</label>
                              <select value={formData.pfeSemester} onChange={e => setFormData({...formData, pfeSemester: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20">
                                <option value="S1">Semestre 1</option>
                                <option value="S2">Semestre 2</option>
                              </select>
                            </div>
                          </div>
                        )}
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
                  form="programForm"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-gradient-to-r from-upf-primary to-purple-600 hover:from-upf-primary hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-upf-primary/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {program ? 'Enregistrer les modifications' : 'Créer la filière'}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProgramModal;

