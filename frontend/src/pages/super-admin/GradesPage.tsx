import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useProgramsStore } from '../../store/programsStore';
import toast from 'react-hot-toast';

const API = 'http://localhost:3001/api';

interface CourseGradeSummary {
  id: string;
  courseId: string;
  classId: string;
  name: string;
  code: string;
  professorName: string;
  className: string;
  programName: string;
  buildingId: string;
  buildingName: string;
  totalStudents: number;
  gradedStudentsCount: number;
  average: number;
}

const GradesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const { fetchPrograms } = useProgramsStore();
  const [summaries, setSummaries] = useState<CourseGradeSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    fetchSummaries();
    fetchPrograms();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const [sumRes, buildRes] = await Promise.all([
        axios.get(`${API}/grades/admin/summary`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        axios.get(`${API}/buildings`, { headers: { Authorization: `Bearer ${accessToken}` } })
      ]);
      setSummaries(sumRes.data?.data ?? sumRes.data);
      setBuildings(buildRes.data?.data ?? buildRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      toast.error('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async (courseId: string, classId: string) => {
    try {
      const res = await axios.get(`${API}/grades/admin/course/${courseId}`, {
        params: { classId },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSelectedCourseDetail(res.data?.data ?? res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch course details', err);
      toast.error('Erreur lors du chargement des détails.');
    }
  };

  const filteredSummaries = summaries.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.professorName.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = selectedProgram === 'all' || s.programName === selectedProgram;
    const matchesBuilding = selectedBuilding === 'all' || s.buildingId === selectedBuilding;
    const matchesClass = selectedClass === 'all' || s.className === selectedClass;
    const hasGrades = s.gradedStudentsCount > 0;
    
    return matchesSearch && matchesProgram && matchesBuilding && matchesClass && (showEmpty || hasGrades);
  });

  const availablePrograms = Array.from(new Set(
    summaries
      .filter(s => selectedBuilding === 'all' || s.buildingId === selectedBuilding)
      .map(s => s.programName)
  ));

  const availableClasses = Array.from(new Set(
    summaries
      .filter(s => (selectedBuilding === 'all' || s.buildingId === selectedBuilding) && 
                   (selectedProgram === 'all' || s.programName === selectedProgram))
      .map(s => s.className)
  ));

  const stats = {
    totalCourses: filteredSummaries.length,
    globalAvg: filteredSummaries.length > 0 
      ? (filteredSummaries.reduce((acc, s) => acc + s.average, 0) / filteredSummaries.length).toFixed(2)
      : '0.00',
    completionRate: filteredSummaries.length > 0
      ? Math.round((filteredSummaries.reduce((acc, s) => acc + (s.gradedStudentsCount / (s.totalStudents || 1)), 0) / filteredSummaries.length) * 100)
      : 0
  };

  const exportToCSV = () => {
    const headers = ['Cours', 'Professeur', 'Filiere', 'Classe', 'Etudiants', 'Notes Saisies', 'Moyenne'];
    const rows = filteredSummaries.map(s => [
      s.name,
      s.professorName,
      s.programName,
      s.className,
      s.totalStudents,
      s.gradedStudentsCount,
      s.average
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_notes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-outfit tracking-tight uppercase">Pilotage des Notes</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Surveillance des performances académiques</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowEmpty(!showEmpty)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 ${
              showEmpty ? 'bg-upf-primary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showEmpty ? 'Masquer les vides' : 'Afficher tout'}
          </button>
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Cours Monitorés', value: stats.totalCourses, icon: AcademicCapIcon, color: 'indigo' },
          { label: 'Taux de Saisie', value: `${stats.completionRate}%`, icon: CheckCircleIcon, color: 'emerald' },
          { label: 'Moyenne Globale', value: stats.globalAvg, icon: ChartBarIcon, color: 'blue' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 md:w-7 md:h-7 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 font-outfit">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Advanced Filters ─── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un cours, prof..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-upf-primary transition-all font-bold"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Bâtiment</span>
            <select 
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedProgram('all');
                setSelectedClass('all');
              }}
              className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-3 focus:ring-2 focus:ring-upf-primary"
            >
              <option value="all">Choisir un bâtiment</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {selectedBuilding !== 'all' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="space-y-1.5"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Filière</span>
                <select 
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setSelectedClass('all');
                  }}
                  className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-3 focus:ring-2 focus:ring-upf-primary"
                >
                  <option value="all">Toutes les filières</option>
                  {availablePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedProgram !== 'all' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="space-y-1.5"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Classe</span>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-3 focus:ring-2 focus:ring-upf-primary"
                >
                  <option value="all">Toutes les classes</option>
                  {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Courses Table ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-upf-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black text-upf-primary uppercase tracking-widest">Chargement des données...</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Unité d'Enseignement</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Taux Saisie</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Moyenne</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map((s) => {
                const completion = Math.round((s.gradedStudentsCount / (s.totalStudents || 1)) * 100);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-900 leading-tight">{s.name}</span>
                        <span className="text-xs font-bold text-upf-primary mt-0.5">{s.professorName}</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="w-3 h-3" />
                            {s.className}
                          </div>
                          <span className="hidden sm:inline opacity-50">•</span>
                          <span className="truncate max-w-[150px]">{s.programName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? 'bg-emerald-500' : 'bg-upf-primary'}`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{s.gradedStudentsCount} / {s.totalStudents} Étud.</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-black font-outfit ${s.average >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {s.average}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Note Moyenne</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => fetchCourseDetail(s.courseId, s.classId)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-upf-primary transition-all shadow-lg shadow-slate-200"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Inspecter</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filteredSummaries.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400 font-bold italic">Aucun cours trouvé pour ces critères.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      <AnimatePresence>
        {isModalOpen && selectedCourseDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-upf-primary text-white relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ExclamationCircleIcon className="w-5 h-5 md:w-6 md:h-6 rotate-45" />
                </button>
                <div className="flex flex-col gap-1 pr-8">
                  <span className="text-upf-primary/30 text-[10px] font-black uppercase tracking-[0.2em]">Détails des Notes</span>
                  <h2 className="text-xl md:text-3xl font-black font-outfit leading-tight">{selectedCourseDetail.course.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-upf-primary/20 text-[10px] md:text-sm font-bold uppercase tracking-wider">
                    <UserGroupIcon className="w-4 h-4" /> Carnet de Notes Complet
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Étudiant</th>
                          {selectedCourseDetail.course.moduleType === 'STANDARD' ? (
                            <>
                              <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CC 1</th>
                              <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CC 2</th>
                              <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">EXAM</th>
                              <th className="px-3 py-4 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">RATT</th>
                            </>
                          ) : (
                            <th className="px-3 py-4 text-[10px] font-black text-upf-primary uppercase tracking-widest text-center">Note Projet</th>
                          )}
                          <th className="px-6 py-4 text-[10px] font-black text-upf-primary uppercase tracking-widest text-right">Moyenne</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedCourseDetail.students.map((entry: any) => {
                          const cc1 = entry.grades.find((g: any) => g.type === 'QUIZ')?.value ?? '-';
                          const cc2 = entry.grades.find((g: any) => g.type === 'PROJECT')?.value ?? '-';
                          const exam = entry.grades.find((g: any) => g.type === 'EXAM')?.value ?? '-';
                          const ratt = entry.grades.find((g: any) => g.type === 'RATTRAPAGE')?.value ?? '-';
                          
                          // Calculate average for modal
                          let avg = '-';
                          const isProject = selectedCourseDetail.course.moduleType === 'PFA' || selectedCourseDetail.course.moduleType === 'PFE';
  
                          if (isProject) {
                             avg = cc2 !== '-' ? cc2.toFixed(2) : '-';
                          } else if (cc1 !== '-' || cc2 !== '-' || exam !== '-') {
                            const v1 = cc1 === '-' ? 0 : cc1;
                            const v2 = cc2 === '-' ? 0 : cc2;
                            const vex = exam === '-' ? 0 : exam;
                            const vratt = ratt === '-' ? null : ratt;
  
                            const examToUse = (vratt !== null && vratt > vex) ? vratt : vex;
                            avg = (((v1 + v2) / 2 * 0.25) + (examToUse * 0.75)).toFixed(2);
                          }
  
                          return (
                            <tr key={entry.student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 md:px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-upf-primary/10 text-upf-primary flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase">
                                    {entry.student.firstName[0]}{entry.student.lastName[0]}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-slate-900 truncate">{entry.student.firstName} {entry.student.lastName}</span>
                                    <span className="text-[10px] text-slate-400 font-medium truncate">{entry.student.email}</span>
                                  </div>
                                </div>
                              </td>
                              {selectedCourseDetail.course.moduleType === 'STANDARD' ? (
                                <>
                                  <td className="px-3 py-4 text-center font-bold text-slate-600 text-sm">{cc1}</td>
                                  <td className="px-3 py-4 text-center font-bold text-slate-600 text-sm">{cc2}</td>
                                  <td className="px-3 py-4 text-center font-bold text-upf-primary text-sm">{exam}</td>
                                  <td className="px-3 py-4 text-center font-bold text-rose-600 text-sm">{ratt}</td>
                                </>
                              ) : (
                                <td className="px-3 py-4 text-center font-black text-upf-primary text-base bg-upf-primary/10/30">{cc2}</td>
                              )}
                              <td className="px-6 py-4 text-right">
                                <span className={`text-sm font-black ${parseFloat(avg) >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {avg}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Fermer l'Inspection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradesPage;

