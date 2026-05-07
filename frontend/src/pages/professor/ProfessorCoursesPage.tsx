import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  PlusIcon,
  DocumentIcon,
  LinkIcon,
  TrashIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  XCircleIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  BellIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';

const API = 'http://localhost:3001/api';

interface Material {
  id: string;
  title: string;
  description: string | null;
  type: 'FILE' | 'LINK';
  url: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxGrade: number;
}

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  programName: string;
}

interface ClassHierarchy {
  id: string;
  name: string;
  courses: Course[];
}

interface ProgramHierarchy {
  id: string;
  name: string;
  classes: ClassHierarchy[];
}

type TabType = 'materials' | 'announcements' | 'assignments';

const ProfessorCoursesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hierarchy, setHierarchy] = useState<ProgramHierarchy[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<string[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassHierarchy | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form States
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'FILE' as 'FILE' | 'LINK', url: '', description: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', isImportant: false });
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', maxGrade: 20 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Fetch Hierarchy
  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/professor/attendance/hierarchy`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setHierarchy(res.data?.data ?? res.data);
      } catch (err) {
        console.error('Failed to fetch hierarchy:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, [accessToken]);

  // 2. Fetch Data when course or tab changes
  const fetchData = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const classParam = selectedClass ? `?classId=${selectedClass.id}` : '';
      
      if (activeTab === 'materials') {
        const res = await axios.get(`${API}/professor/courses/${selectedCourse.id}/materials${classParam}`, { headers });
        setMaterials(res.data?.data ?? res.data);
      } else if (activeTab === 'announcements') {
        const res = await axios.get(`${API}/professor/courses/${selectedCourse.id}/announcements${classParam}`, { headers });
        setAnnouncements(res.data?.data ?? res.data);
      } else if (activeTab === 'assignments') {
        const res = await axios.get(`${API}/professor/courses/${selectedCourse.id}/assignments${classParam}`, { headers });
        setAssignments(res.data?.data ?? res.data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedClass, activeTab, accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. Handlers
  const toggleProgram = (id: string) => setExpandedPrograms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleClass = (id: string) => setExpandedClasses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-set title if empty
      if (!newMaterial.title) {
        setNewMaterial(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleAddAction = async () => {
    if (!selectedCourse) return;
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    try {
      setUploading(true);
      if (activeTab === 'materials') {
        let finalUrl = newMaterial.url;

        // If a file is selected, upload it first to Cloudinary via our backend
        if (newMaterial.type === 'FILE' && selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          const uploadRes = await axios.post(`${API}/upload/file`, formData, {
            headers: { 
              ...headers,
              'Content-Type': 'multipart/form-data'
            }
          });
          // Account for TransformInterceptor wrapping response in .data
          finalUrl = uploadRes.data.data?.url || uploadRes.data.url;
        }

        if (!finalUrl && newMaterial.type === 'FILE') {
          throw new Error('Le lien du fichier est manquant.');
        }

        await axios.post(`${API}/professor/courses/${selectedCourse.id}/materials`, {
          ...newMaterial,
          url: finalUrl || '',
          classId: selectedClass?.id
        }, { headers });
        
        setNewMaterial({ title: '', type: 'FILE', url: '', description: '' });
        setSelectedFile(null);
      } else if (activeTab === 'announcements') {
        await axios.post(`${API}/professor/courses/${selectedCourse.id}/announcements`, {
          ...newAnnouncement,
          classId: selectedClass?.id
        }, { headers });
        setNewAnnouncement({ title: '', content: '', isImportant: false });
      } else if (activeTab === 'assignments') {
        await axios.post(`${API}/professor/courses/${selectedCourse.id}/assignments`, {
          ...newAssignment,
          classId: selectedClass?.id
        }, { headers });
        setNewAssignment({ title: '', description: '', dueDate: '', maxGrade: 20 });
      }
      setShowAddModal(false);
      toast.success('Enregistré avec succès !');
      fetchData();
    } catch (err) {
      console.error('Failed to add:', err);
      toast.error('Erreur lors de la sauvegarde. Vérifiez votre connexion.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    useModalStore.getState().openConfirm({
      title: 'Supprimer ce support ?',
      message: 'Cette action est irréversible et le fichier sera retiré du dataset.',
      type: 'danger',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await axios.post(`${API}/professor/materials/${id}/delete`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          toast.success('Support supprimé');
          fetchData();
        } catch (err) {
          console.error('Failed to delete material:', err);
          toast.error('Impossible de supprimer le support');
        }
      }
    });
  };

  return (
    <div className="flex h-full bg-[#F8FAFC] overflow-hidden">
      {/* ─── Hierarchical Sidebar ────────────────────────────── */}
      <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-xl shadow-slate-200/50 z-20">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0A192F] flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-900/20">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 font-outfit tracking-tight">Mes Cours</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Gestion des Ressources</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {hierarchy.map(program => (
            <div key={program.id} className="space-y-1">
              <button
                onClick={() => toggleProgram(program.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  expandedPrograms.includes(program.id) ? 'bg-indigo-50/50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="w-5 h-5 opacity-60" />
                  <span className="text-sm font-extrabold truncate max-w-[160px]">{program.name}</span>
                </div>
                <ChevronRightIcon className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms.includes(program.id) ? 'rotate-90' : ''}`} />
              </button>

              {expandedPrograms.includes(program.id) && (
                <div className="pl-4 space-y-1">
                  {program.classes.map(cls => (
                    <div key={cls.id} className="space-y-1">
                      <button
                        onClick={() => toggleClass(cls.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          expandedClasses.includes(cls.id) ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4 opacity-50" />
                          <span className="text-xs font-bold">{cls.name}</span>
                        </div>
                        <ChevronRightIcon className={`w-3 h-3 transition-transform ${expandedClasses.includes(cls.id) ? 'rotate-90' : ''}`} />
                      </button>

                      {expandedClasses.includes(cls.id) && (
                        <div className="pl-6 space-y-1">
                          {cls.courses.map(course => (
                            <button
                              key={course.id}
                              onClick={() => {
                                setSelectedCourse(course);
                                setSelectedClass(cls);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-[11px] font-bold transition-all relative group ${
                                selectedCourse?.id === course.id && selectedClass?.id === cls.id
                                  ? 'bg-[#0A192F] text-white shadow-md'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {selectedCourse?.id === course.id && selectedClass?.id === cls.id && (
                                <div className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-400 rounded-full" />
                              )}
                              <span className="truncate block pr-4">{course.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Content ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {!selectedCourse ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-12">
            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
              <BookOpenIcon className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 font-outfit">Gérez vos supports de cours</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2 font-medium">
                Sélectionnez un cours dans la barre latérale pour accéder à vos documents, liens et ressources pédagogiques.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white p-8 border-b border-slate-100">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">Espace de Travail</span>
                      <h2 className="text-2xl font-black text-slate-900 font-outfit leading-none">{selectedCourse.name}</h2>
                    </div>
                    <p className="text-slate-400 text-sm font-bold flex items-center gap-2">
                      <AcademicCapIcon className="w-4 h-4" /> Semestre {selectedCourse.semester} • {selectedCourse.code} 
                      {selectedClass && <span className="text-indigo-500 ml-2">• Classe: {selectedClass.name}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#0A192F] text-white text-xs font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-cyan-600 transition-all active:scale-95 uppercase tracking-widest"
                  >
                    <PlusIcon className="w-4 h-4 stroke-[3]" />
                    Nouveau {activeTab === 'materials' ? 'Support' : activeTab === 'announcements' ? 'Annonce' : 'Devoir'}
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-8 border-b border-slate-100">
                  {[
                    { id: 'materials', label: 'Supports', icon: DocumentIcon },
                    { id: 'announcements', label: 'Annonces', icon: MegaphoneIcon },
                    { id: 'assignments', label: 'Devoirs', icon: ClipboardDocumentCheckIcon }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                        activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mise à jour du dataset...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-full"
                  >
                    {/* Materials View */}
                    {activeTab === 'materials' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {materials.length === 0 ? (
                          <EmptyState label="Bibliothèque vide" description="Commencez par ajouter des fichiers PDF ou des liens." />
                        ) : materials.map((item, idx) => (
                          <MaterialCard key={item.id} item={item} idx={idx} onDelete={handleDeleteMaterial} />
                        ))}
                      </div>
                    )}

                    {/* Announcements View */}
                    {activeTab === 'announcements' && (
                      <div className="max-w-4xl mx-auto space-y-6">
                        {announcements.length === 0 ? (
                          <EmptyState label="Aucune annonce" description="Publiez un message important pour vos étudiants." />
                        ) : announcements.map((item, idx) => (
                          <AnnouncementCard key={item.id} item={item} idx={idx} />
                        ))}
                      </div>
                    )}

                    {/* Assignments View */}
                    {activeTab === 'assignments' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {assignments.length === 0 ? (
                          <EmptyState label="Zéro devoir" description="Planifiez un travail à rendre pour vos classes." />
                        ) : assignments.map((item, idx) => (
                          <AssignmentCard key={item.id} item={item} idx={idx} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Dynamic Add Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl p-10 overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900">
                <XCircleIcon className="w-8 h-8" />
              </button>

              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                  {uploading ? <ArrowPathIcon className="w-8 h-8 animate-spin" /> : activeTab === 'materials' ? <DocumentIcon className="w-8 h-8" /> : activeTab === 'announcements' ? <MegaphoneIcon className="w-8 h-8" /> : <ClipboardDocumentCheckIcon className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-outfit">Nouveau {activeTab === 'materials' ? 'Support' : activeTab === 'announcements' ? 'Annonce' : 'Devoir'}</h3>
                  <p className="text-sm text-slate-400 font-medium">{uploading ? 'Téléversement vers Cloudinary...' : 'Sera sauvegardé instantanément dans le dataset.'}</p>
                </div>
              </div>

              <div className="space-y-6">
                {activeTab === 'materials' && (
                  <>
                    <Input label="Titre" placeholder="Ex: Chapitre 1..." value={newMaterial.title} onChange={v => setNewMaterial(p => ({ ...p, title: v }))} />
                    <div className="grid grid-cols-2 gap-4">
                      <TypeBtn active={newMaterial.type === 'FILE'} onClick={() => setNewMaterial(p => ({ ...p, type: 'FILE' }))} label="Fichier" icon={DocumentIcon} />
                      <TypeBtn active={newMaterial.type === 'LINK'} onClick={() => setNewMaterial(p => ({ ...p, type: 'LINK' }))} label="Lien Web" icon={GlobeAltIcon} />
                    </div>
                    
                    {newMaterial.type === 'FILE' ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          selectedFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                        }`}
                      >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        <DocumentArrowUpIcon className={`w-12 h-12 mb-3 ${selectedFile ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                        {selectedFile ? (
                          <div className="text-center">
                            <p className="text-sm font-black text-emerald-700">{selectedFile.name}</p>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Prêt pour Cloudinary ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-600">Cliquez pour choisir un fichier</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">PDF, DOCX, Images...</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input label="URL / Lien" placeholder="https://..." value={newMaterial.url} onChange={v => setNewMaterial(p => ({ ...p, url: v }))} icon={LinkIcon} />
                    )}
                  </>
                )}

                {activeTab === 'announcements' && (
                  <>
                    <Input label="Titre" placeholder="Avis important..." value={newAnnouncement.title} onChange={v => setNewAnnouncement(p => ({ ...p, title: v }))} />
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contenu du message</label>
                      <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={newAnnouncement.content} onChange={e => setNewAnnouncement(p => ({ ...p, content: e.target.value }))} />
                    </div>
                    <button onClick={() => setNewAnnouncement(p => ({ ...p, isImportant: !p.isImportant }))} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newAnnouncement.isImportant ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                      <BellIcon className="w-4 h-4" /> Marquer comme Important
                    </button>
                  </>
                )}

                {activeTab === 'assignments' && (
                  <>
                    <Input label="Titre du devoir" placeholder="Ex: Mini-Projet React..." value={newAssignment.title} onChange={v => setNewAssignment(p => ({ ...p, title: v }))} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Date Limite" type="date" value={newAssignment.dueDate} onChange={v => setNewAssignment(p => ({ ...p, dueDate: v }))} icon={CalendarIcon} />
                      <Input label="Note Max" type="number" value={newAssignment.maxGrade} onChange={v => setNewAssignment(p => ({ ...p, maxGrade: Number(v) }))} />
                    </div>
                    <textarea rows={3} placeholder="Instructions..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} />
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-10">
                <button disabled={uploading} onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 disabled:opacity-30">Annuler</button>
                <button disabled={uploading || (activeTab === 'materials' && newMaterial.type === 'FILE' && !selectedFile)} onClick={handleAddAction} className="flex-[2] py-4 bg-[#0A192F] text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all uppercase tracking-widest disabled:opacity-30">
                  {uploading ? 'Chargement...' : 'Sauvegarder'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sub-Components ───────────────────────────────────────

const Input = ({ label, placeholder, value, onChange, type = 'text', icon: Icon }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />}
      <input type={type} placeholder={placeholder} className={`w-full ${Icon ? 'pl-12' : 'px-6'} py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all`} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  </div>
);

const TypeBtn = ({ active, onClick, label, icon: Icon }: any) => (
  <button onClick={onClick} className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${active ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const EmptyState = ({ label, description }: any) => (
  <div className="col-span-full py-20 bg-white rounded-[3rem] border border-slate-100 text-center px-10">
    <CloudArrowUpIcon className="w-16 h-16 text-slate-100 mb-6 mx-auto" />
    <h4 className="text-lg font-black text-slate-900 font-outfit">{label}</h4>
    <p className="text-sm text-slate-400 max-w-sm mt-3 mx-auto font-medium">{description}</p>
  </div>
);

const MaterialCard = ({ item, idx, onDelete }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
    <div className="flex items-start justify-between mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${item.type === 'FILE' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'}`}>
        {item.type === 'FILE' ? <DocumentIcon className="w-7 h-7" /> : <GlobeAltIcon className="w-7 h-7" />}
      </div>
      <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"><TrashIcon className="w-5 h-5" /></button>
    </div>
    <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight font-outfit line-clamp-2">{item.title}</h4>
    <p className="text-xs text-slate-400 mb-8 line-clamp-2 font-medium">{item.description || 'Aucune description.'}</p>
    <div className="mt-auto flex items-center justify-between">
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100">Consulter</a>
    </div>
  </motion.div>
);

const AnnouncementCard = ({ item, idx }: any) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className={`p-8 rounded-[2.5rem] border-l-8 bg-white shadow-sm hover:shadow-md transition-all ${item.isImportant ? 'border-rose-500' : 'border-indigo-500'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isImportant ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
          <MegaphoneIcon className="w-5 h-5" />
        </div>
        <h4 className="text-xl font-black text-slate-900 font-outfit">{item.title}</h4>
      </div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
    </div>
    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{item.content}</p>
  </motion.div>
);

const AssignmentCard = ({ item, idx }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform" />
    <div className="flex items-center justify-between mb-6 relative">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400">
        <ClipboardDocumentCheckIcon className="w-8 h-8" />
      </div>
      <div className="text-right">
        <span className="text-[10px] font-black text-slate-300 uppercase block mb-1 tracking-widest">Note Max</span>
        <span className="text-xl font-black text-slate-900">/ {item.maxGrade}</span>
      </div>
    </div>
    <h4 className="text-xl font-black text-slate-900 mb-2 font-outfit leading-tight">{item.title}</h4>
    <p className="text-sm text-slate-400 mb-8 line-clamp-3 font-medium">{item.description}</p>
    <div className="mt-auto flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
      <CalendarIcon className="w-5 h-5 text-indigo-500" />
      <div>
        <span className="text-[10px] font-black text-slate-400 uppercase block tracking-tighter">Échéance</span>
        <span className="text-xs font-bold text-slate-900">{new Date(item.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
    </div>
  </motion.div>
);

export default ProfessorCoursesPage;
