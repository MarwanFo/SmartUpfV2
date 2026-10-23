import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
  ChartBarIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  StarIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const API = 'http://localhost:3001/api/professor';

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  value: number;
  maxValue: number;
  type: string;
}

interface StudentGradeRow {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  grades: Grade[];
}

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  moduleType: 'STANDARD' | 'PFA' | 'PFE';
}

interface ClassHierarchy {
  id: string;
  name: string;
  level: number;
  courses: Course[];
}

interface FiliereHierarchy {
  id: string;
  name: string;
  code: string;
  classes: ClassHierarchy[];
}

const ProfessorGradesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  
  // ─── Hierarchy State ──────────────────────────────────
  const [hierarchy, setHierarchy] = useState<FiliereHierarchy[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<FiliereHierarchy | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassHierarchy | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // ─── Grading State ─────────────────────────────────────
  const [gradeRows, setGradeRows] = useState<StudentGradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('S2');

  const semesters = ['S1', 'S2'];

  const authConfig = () => ({ headers: { Authorization: `Bearer ${accessToken}` } });

  // Load hierarchy
  useEffect(() => {
    if (!accessToken) return;
    axios.get(`${API}/attendance/hierarchy`, authConfig()).then(res => {
      const payload = res.data?.data ?? res.data;
      setHierarchy(Array.isArray(payload) ? payload : []);
    }).catch(err => console.error('Hierarchy fetch failed:', err));
  }, [accessToken]);

  // Load Grades
  const loadGrades = useCallback(async (course: Course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const classId = selectedClass?.id;
      const res = await axios.get(`${API}/courses/${course.id}/grades`, {
        ...authConfig(),
        params: { classId }
      });
      const payload = res.data?.data ?? res.data;
      setGradeRows(Array.isArray(payload) ? payload : []);
      setIsDirty(false); // Reset on load
    } catch (err) {
      console.error('Failed to load grades:', err);
      toast.error('Erreur lors du chargement des notes.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedClass]);

  // Handle Local Grade Change
  const handleGradeChange = (studentId: string, type: string, value: string) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue) && value !== '') return;
    if (numValue > 20) numValue = 20;
    if (numValue < 0) numValue = 0;
    
    setIsDirty(true); // Mark as modified
    
    setGradeRows(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      
      const newGrades = [...row.grades];
      const idx = newGrades.findIndex(g => g.type === type);
      
      if (idx > -1) {
        newGrades[idx] = { ...newGrades[idx], value: isNaN(numValue) ? 0 : numValue };
      } else {
        newGrades.push({
          id: 'temp-' + Date.now(),
          studentId,
          courseId: selectedCourse!.id,
          value: isNaN(numValue) ? 0 : numValue,
          maxValue: 20,
          type
        });
      }
      return { ...row, grades: newGrades };
    }));
  };

  const saveGrades = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    try {
      // Collect all grades to save
      const records: any[] = [];
      gradeRows.forEach(row => {
        row.grades.forEach(g => {
          if (['QUIZ', 'PROJECT', 'EXAM', 'RATTRAPAGE'].includes(g.type)) {
            records.push({ studentId: row.student.id, value: g.value, type: g.type });
          }
        });
      });

      await axios.post(`${API}/courses/${selectedCourse.id}/grades/bulk`, { records }, authConfig());
      toast.success('Toutes les notes ont été synchronisées !');
      setIsDirty(false); // Reset after save
      loadGrades(selectedCourse);
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRows = gradeRows.filter(r =>
    `${r.student.firstName} ${r.student.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  // Helper: Calculate final average for a row
  const calculateFinal = (grades: Grade[]) => {
    if (selectedCourse?.moduleType === 'PFA' || selectedCourse?.moduleType === 'PFE') {
      return (grades.find(g => g.type === 'PROJECT')?.value || 0).toFixed(2);
    }

    const cc1 = grades.find(g => g.type === 'QUIZ')?.value || 0;
    const cc2 = grades.find(g => g.type === 'PROJECT')?.value || 0;
    const exam = grades.find(g => g.type === 'EXAM')?.value || 0;
    const ratt = grades.find(g => g.type === 'RATTRAPAGE')?.value;
    
    const ccAvg = (cc1 + cc2) / 2;
    const examToUse = (ratt !== undefined && ratt > exam) ? ratt : exam;
    const total = (ccAvg * 0.25) + (examToUse * 0.75);
    return total.toFixed(2);
  };

  const globalStats = useMemo(() => {
    if (gradeRows.length === 0) return { avg: '0', passRate: 0 };
    const finals = gradeRows.map(r => parseFloat(calculateFinal(r.grades)));
    const sum = finals.reduce((a, b) => a + b, 0);
    const passCount = finals.filter(v => v >= 10).length;
    return {
      avg: (sum / gradeRows.length).toFixed(2),
      passRate: Math.round((passCount / gradeRows.length) * 100)
    };
  }, [gradeRows]);

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      {/* ─── Sidebar ─── */}
      <div className="hidden lg:flex w-80 shrink-0 bg-white border-r border-slate-200 flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 font-outfit">Carnet de Notes</h2>
          <p className="text-[10px] font-black text-upf-primary uppercase tracking-[0.2em] mt-1">Système 2CC + 1EXAM</p>
        </div>

        {/* Semester Filter */}
        <div className="px-4 py-3 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
            {semesters.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSemester(s)}
                className={`flex-1 min-w-[38px] py-2 rounded-xl text-[10px] font-black transition-all ${
                  selectedSemester === s 
                    ? 'bg-upf-primary text-white shadow-md shadow-upf-primary/20' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {hierarchy.map(filiere => {
            const isFiliereExpanded = selectedFiliere?.id === filiere.id;
            const classesToRender = filiere.classes;

            return (
              <div key={filiere.id} className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedFiliere(isFiliereExpanded ? null : filiere);
                    setSelectedClass(null);
                    setSelectedCourse(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isFiliereExpanded
                      ? 'bg-slate-50 text-upf-primary font-bold'
                      : 'hover:bg-slate-50/50 text-slate-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AcademicCapIcon className="w-5 h-5 text-upf-primary/80" />
                    <span className="text-sm font-outfit truncate max-w-[160px]">{filiere.code || filiere.name}</span>
                  </div>
                  <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isFiliereExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isFiliereExpanded && (
                  <div className="pl-4 border-l border-slate-100 ml-5 mt-1 space-y-1">
                    {classesToRender.map(clazz => {
                      const isClassExpanded = selectedClass?.id === clazz.id;
                      return (
                        <div key={clazz.id} className="space-y-1">
                          <button
                            onClick={() => {
                              setSelectedClass(isClassExpanded ? null : clazz);
                              setSelectedCourse(null);
                            }}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all text-left text-xs ${
                              isClassExpanded
                                ? 'text-upf-primary font-bold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserGroupIcon className="w-4 h-4 text-slate-400" />
                              <span className="font-bold">{clazz.name}</span>
                            </div>
                            <ChevronRightIcon className={`w-3 h-3 text-slate-400 transition-transform ${isClassExpanded ? 'rotate-90' : ''}`} />
                          </button>

                          {isClassExpanded && (
                            <div className="pl-3 border-l border-slate-100 ml-4 mt-1 space-y-1">
                              {clazz.courses
                                .filter(c => !selectedSemester || c.semester === selectedSemester)
                                .map(course => {
                                  const isSelected = selectedCourse?.id === course.id;
                                  return (
                                    <button
                                      key={course.id}
                                      onClick={() => loadGrades(course)}
                                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all relative group flex items-center gap-2 ${
                                        isSelected
                                          ? 'bg-upf-primary/10 text-upf-primary border-l-2 border-upf-primary'
                                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                                      }`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        isSelected ? 'bg-upf-primary scale-110' : 'bg-slate-300 group-hover:bg-slate-450'
                                      }`} />
                                      <span className="truncate block pr-2">{course.name}</span>
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedCourse ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 text-center">
            <CalculatorIcon className="w-20 h-20 opacity-20 mb-4" />
            <p className="text-lg md:text-xl font-black font-outfit uppercase tracking-[0.2em]">Sélectionnez une UE dans le menu</p>
            <p className="lg:hidden text-xs font-bold text-slate-400 mt-4 bg-white px-4 py-2 rounded-lg border border-slate-200 uppercase tracking-widest">Le menu est disponible sur grand écran</p>
          </div>
        ) : (
          <>
            {/* Header & Stats */}
            <div className="p-4 md:p-8 bg-white border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-outfit leading-tight">{selectedCourse.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <UserGroupIcon className="w-4 h-4" /> {selectedClass?.name}
                    </span>
                    <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-sm font-bold text-upf-primary uppercase tracking-widest">{selectedFiliere?.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={saveGrades} 
                    disabled={saving || !isDirty} 
                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 font-black rounded-2xl shadow-xl transition-all text-sm md:text-base ${
                      !isDirty 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-slate-900 text-white shadow-slate-200 hover:bg-upf-primary active:scale-95'
                    }`}
                  >
                    {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckIcon className="w-5 h-5" />}
                    {saving ? 'Sauv...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { label: 'Moyenne Générale', value: globalStats.avg, icon: ChartBarIcon, color: 'indigo' },
                  { label: 'Taux de Réussite', value: `${globalStats.passRate}%`, icon: StarIcon, color: 'emerald' },
                  { label: 'Étudiants Notés', value: gradeRows.length, icon: UserGroupIcon, color: 'blue' },
                ].map((s, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] bg-${s.color}-50 border border-${s.color}-100 flex items-center gap-5`}>
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-${s.color}-600`}>
                      <s.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                      <p className="text-2xl font-black text-slate-900 font-outfit">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-4 md:px-8 py-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un étudiant..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-upf-primary"
                />
              </div>
              <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">
                Formule : <span className="text-upf-primary">( (CC1+CC2)/2 * 0.25 ) + (EXAM * 0.75)</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <ArrowPathIcon className="w-12 h-12 text-upf-primary animate-spin opacity-50" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Chargement des étudiants...</p>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Étudiant</th>
                          {selectedCourse.moduleType === 'STANDARD' ? (
                            <>
                              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CC 1</th>
                              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CC 2</th>
                              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Examen</th>
                              <th className="px-4 py-5 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">Ratt</th>
                            </>
                          ) : (
                            <th className="px-4 py-5 text-[10px] font-black text-upf-primary uppercase tracking-widest text-center">
                              Note {selectedCourse.moduleType}
                            </th>
                          )}
                          <th className="px-6 md:px-8 py-5 text-[10px] font-black text-upf-primary uppercase tracking-widest text-right whitespace-nowrap">Moyenne Finale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredRows.map(row => {
                          const cc1 = row.grades.find(g => g.type === 'QUIZ')?.value ?? '';
                          const cc2 = row.grades.find(g => g.type === 'PROJECT')?.value ?? '';
                          const exam = row.grades.find(g => g.type === 'EXAM')?.value ?? '';
                          const final = calculateFinal(row.grades);
  
                          return (
                            <tr key={row.student.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 md:px-8 py-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-black text-[10px] md:text-xs text-slate-400 group-hover:text-upf-primary transition-colors uppercase">
                                    {row.student.firstName[0]}{row.student.lastName[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs md:text-sm font-black text-slate-900 truncate">{row.student.lastName} {row.student.firstName}</p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 truncate">{row.student.email}</p>
                                  </div>
                                </div>
                              </td>
                              {selectedCourse.moduleType === 'STANDARD' ? (
                                <>
                                  <td className="px-4 py-4">
                                    <input 
                                      type="number" 
                                      value={cc1} 
                                      onChange={e => handleGradeChange(row.student.id, 'QUIZ', e.target.value)}
                                      className="w-14 md:w-16 mx-auto block text-center py-2 rounded-xl bg-slate-50 border-none font-bold text-sm focus:ring-2 focus:ring-upf-primary"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <input 
                                      type="number" 
                                      value={cc2} 
                                      onChange={e => handleGradeChange(row.student.id, 'PROJECT', e.target.value)}
                                      className="w-14 md:w-16 mx-auto block text-center py-2 rounded-xl bg-slate-50 border-none font-bold text-sm focus:ring-2 focus:ring-upf-primary"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <input 
                                      type="number" 
                                      value={exam} 
                                      onChange={e => handleGradeChange(row.student.id, 'EXAM', e.target.value)}
                                      className="w-14 md:w-16 mx-auto block text-center py-2 rounded-xl bg-upf-primary/10 text-upf-primary border-none font-black text-sm focus:ring-2 focus:ring-upf-primary"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <input 
                                      type="number" 
                                      value={row.grades.find(g => g.type === 'RATTRAPAGE')?.value ?? ''} 
                                      onChange={e => handleGradeChange(row.student.id, 'RATTRAPAGE', e.target.value)}
                                      disabled={parseFloat(final) >= 10 && (row.grades.find(g => g.type === 'RATTRAPAGE')?.value ?? 0) === 0}
                                      className={`w-14 md:w-16 mx-auto block text-center py-2 rounded-xl border-none font-black text-sm focus:ring-2 focus:ring-rose-500 ${
                                        parseFloat(final) < 10 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-400 opacity-50'
                                      }`}
                                    />
                                  </td>
                                </>
                              ) : (
                                <td className="px-4 py-4">
                                  <input 
                                    type="number" 
                                    value={cc2} 
                                    onChange={e => handleGradeChange(row.student.id, 'PROJECT', e.target.value)}
                                    className="w-20 md:w-24 mx-auto block text-center py-2.5 md:py-3 rounded-2xl bg-upf-primary text-white border-none font-black text-base md:text-lg focus:ring-4 focus:ring-upf-primary/30 shadow-lg shadow-upf-primary/20"
                                  />
                                </td>
                              )}
                              <td className="px-6 md:px-8 py-4 text-right">
                                <span className={`text-base md:text-lg font-black font-outfit ${parseFloat(final) >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {final}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessorGradesPage;

