import React, { useEffect, useState } from 'react';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  CalculatorIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:3001/api';

interface Grade {
  id: string;
  value: number;
  type: string;
}

interface CourseResult {
  id: string;
  name: string;
  code: string;
  moduleType: 'STANDARD' | 'PFA' | 'PFE';
  grades: Grade[];
  unjustifiedAbsencesCount?: number;
}

const StudentGradesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [courses, setCourses] = useState<CourseResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesWithGrades = async () => {
      try {
        const res = await axios.get(`${API}/student/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const data = res.data.data || res.data || [];
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Erreur lors du chargement de vos notes');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchCoursesWithGrades();
  }, [accessToken]);

  const calculateFinal = (course: CourseResult) => {
    if (course.moduleType === 'PFA' || course.moduleType === 'PFE') {
      const project = course.grades?.find(g => g.type === 'PROJECT')?.value;
      return project !== undefined ? project.toFixed(2) : '0.00';
    }

    const cc1 = course.grades?.find(g => g.type === 'QUIZ')?.value;
    const cc2 = course.grades?.find(g => g.type === 'PROJECT')?.value;
    const exam = course.grades?.find(g => g.type === 'EXAM')?.value;
    const ratt = course.grades?.find(g => g.type === 'RATTRAPAGE')?.value;
    
    // Si aucune note n'est saisie, on retourne 0
    if (cc1 === undefined && cc2 === undefined && exam === undefined && ratt === undefined) {
      return '0.00';
    }

    const val1 = cc1 || 0;
    const val2 = cc2 || 0;
    const valExam = exam || 0;
    
    const ccAvg = (val1 + val2) / 2;
    const examToUse = (ratt !== undefined && ratt > valExam) ? ratt : valExam;
    let total = (ccAvg * 0.25) + (examToUse * 0.75);

    // Appliquer la pénalité d'absence: -0.25 par absence non justifiée au-delà de 4
    if (course.unjustifiedAbsencesCount && course.unjustifiedAbsencesCount > 4) {
      const penalty = (course.unjustifiedAbsencesCount - 4) * 0.25;
      total = Math.max(0, total - penalty);
    }

    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ON FILTRE ICI : On ne garde que les cours qui ont au moins UNE note sauvegardée par le prof
  const evaluatedCourses = courses.filter(c => c.grades && c.grades.length > 0);

  // Moyenne générale basée uniquement sur les cours évalués
  const globalAverage = evaluatedCourses.length > 0 
    ? (evaluatedCourses.reduce((acc, curr) => acc + parseFloat(calculateFinal(curr)), 0) / evaluatedCourses.length).toFixed(2)
    : '--';

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-0">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black text-slate-900">Notes & Résultats</h1>
          <p className="text-slate-500 font-medium mt-1">Seuls les modules avec des notes sauvegardées sont affichés.</p>
        </div>
        
        <div className="bg-gradient-to-r from-[#0A192F] to-indigo-900 px-8 py-4 rounded-3xl shadow-lg flex items-center gap-6">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-indigo-200 border border-white/20">
            <AcademicCapIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Moyenne Générale</p>
            <p className="text-3xl font-black text-white">{globalAverage} <span className="text-sm font-medium text-indigo-200/50">/20</span></p>
          </div>
        </div>
      </div>

      {evaluatedCourses.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <CalculatorIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-wider">Aucune note publiée</h3>
          <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
            Vos professeurs n'ont pas encore sauvegardé de notes pour vos modules ce semestre. 
            Dès qu'une note (CC ou Examen) est enregistrée, elle apparaîtra ici instantanément.
          </p>
          <div className="mt-8 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 inline-flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <ExclamationCircleIcon className="w-4 h-4" />
            Modules totaux chargés : {courses.length}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Module / UE</th>
                  <th className="px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">CC 1</th>
                  <th className="px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">CC 2</th>
                  <th className="px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Examen</th>
                  <th className="px-4 py-6 text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] text-center">Ratt</th>
                  <th className="px-8 py-6 text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] text-right whitespace-nowrap">Moyenne Finale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {evaluatedCourses.map(course => {
                  const cc1 = course.grades?.find(g => g.type === 'QUIZ')?.value;
                  const cc2 = course.grades?.find(g => g.type === 'PROJECT')?.value;
                  const exam = course.grades?.find(g => g.type === 'EXAM')?.value;
                  const ratt = course.grades?.find(g => g.type === 'RATTRAPAGE')?.value;
                  const final = calculateFinal(course);
                  const isPassed = parseFloat(final) >= 10;
                  
                  const absencesCount = course.unjustifiedAbsencesCount || 0;
                  const penalty = absencesCount > 4 ? (absencesCount - 4) * 0.25 : 0;

                  return (
                    <tr key={course.id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            <BookOpenIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{course.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{course.code}</p>
                            {absencesCount > 0 && (
                              <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${penalty > 0 ? 'text-rose-500' : 'text-amber-500'}`}>
                                {absencesCount} absence(s) non justifiée(s)
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold inline-block min-w-[3.5rem] ${cc1 !== undefined ? 'bg-slate-100 text-slate-700 shadow-sm border border-slate-200' : 'text-slate-300'}`}>
                          {cc1 !== undefined ? cc1 : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold inline-block min-w-[3.5rem] ${cc2 !== undefined ? 'bg-slate-100 text-slate-700 shadow-sm border border-slate-200' : 'text-slate-300'}`}>
                          {cc2 !== undefined ? cc2 : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-4 py-2 rounded-xl text-sm font-black inline-block min-w-[3.5rem] ${exam !== undefined ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-slate-300'}`}>
                          {exam !== undefined ? exam : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-4 py-2 rounded-xl text-sm font-black inline-block min-w-[3.5rem] ${ratt !== undefined ? 'bg-rose-50 text-rose-700 border border-rose-100 shadow-sm' : 'text-slate-300'}`}>
                          {ratt !== undefined ? ratt : '--'}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-xl font-black font-outfit ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {final}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isPassed ? 'Validé' : 'Non Validé'}
                          </span>
                          {penalty > 0 && (
                            <span className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              <ExclamationCircleIcon className="w-3 h-3" /> -{penalty} pts (Absences)
                            </span>
                          )}
                        </div>
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
  );
};

export default StudentGradesPage;
