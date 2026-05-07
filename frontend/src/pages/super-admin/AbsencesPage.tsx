import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useProgramsStore } from '../../store/programsStore';

const API = 'http://localhost:3001/api';

interface AttendanceSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  courseName: string;
  professorName: string;
  className: string;
  programName: string;
  programId?: string;
  buildingName: string;
  buildingId?: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

const AbsencesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const { programs, fetchPrograms } = useProgramsStore();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchPrograms();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API}/absences/sessions`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSessions(res.data?.data ?? res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const fetchSessionDetails = async (id: string) => {
    try {
      const res = await axios.get(`${API}/absences/sessions/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSelectedSession(res.data?.data ?? res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch details', err);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.courseName.toLowerCase().includes(search.toLowerCase()) ||
                        s.professorName.toLowerCase().includes(search.toLowerCase()) ||
                        s.className.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = selectedProgram === 'all' || s.programName === selectedProgram;
    
    return matchesSearch && matchesProgram;
  });

  const stats = {
    totalSessions: filteredSessions.length,
    totalAbsences: filteredSessions.reduce((acc, s) => acc + s.absent, 0),
    avgAttendance: filteredSessions.length > 0 
      ? Math.round((filteredSessions.reduce((acc, s) => acc + (s.present / (s.totalStudents || 1)), 0) / filteredSessions.length) * 100)
      : 0
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Cours', 'Professeur', 'Filiere', 'Classe', 'Presents', 'Absents', 'Retards'];
    const rows = filteredSessions.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.courseName,
      s.professorName,
      s.programName,
      s.className,
      s.present,
      s.absent,
      s.late
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_absences_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Suivi des Absences</h1>
          <p className="text-slate-500 font-medium mt-1">Surveillance globale par filière</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exporter Rapport
          </button>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Séances Filtrées', value: stats.totalSessions, icon: CalendarIcon, color: 'indigo' },
          { label: 'Total Absences', value: stats.totalAbsences, icon: ExclamationCircleIcon, color: 'rose' },
          { label: 'Taux de Présence', value: `${stats.avgAttendance}%`, icon: ChartBarIcon, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Advanced Filters ─── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher cours, prof..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase">Filière:</span>
            <select 
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
            >
              <option value="all">Toutes les filières</option>
              {programs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Sessions Table ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Détails Séance</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Localisation</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Filière / Classe</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Absences</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-slate-900 leading-tight">{session.courseName}</span>
                      <span className="text-xs font-bold text-indigo-600 mt-0.5">{session.professorName}</span>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        <span className="mx-1">•</span>
                        <ClockIcon className="w-3 h-3" />
                        {session.startTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{session.buildingName}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Bâtiment</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{session.programName}</span>
                      <span className="text-[10px] font-bold text-slate-500">{session.className}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-black ${session.absent > 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                        {session.absent}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Absents</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => fetchSessionDetails(session.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSessions.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400 font-bold italic">Aucune séance ne correspond à vos filtres.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Details Modal ─── */}
      <AnimatePresence>
        {isModalOpen && selectedSession && (
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
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-8 bg-indigo-600 text-white relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-8 right-8 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ExclamationCircleIcon className="w-6 h-6 rotate-45" />
                </button>
                <div className="flex flex-col gap-1">
                  <span className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em]">Détails de l'appel</span>
                  <h2 className="text-3xl font-black font-outfit">{selectedSession.course.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-indigo-100 text-sm font-bold">
                    <span className="flex items-center gap-1.5"><UserGroupIcon className="w-4 h-4" /> {selectedSession.class?.name}</span>
                    <span className="opacity-40">|</span>
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {new Date(selectedSession.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSession.attendances.map((att: any) => (
                    <div key={att.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                          {att.student.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{att.student.firstName} {att.student.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{att.student.email}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' :
                        att.status === 'ABSENT' ? 'bg-rose-100 text-rose-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {att.status === 'PRESENT' ? 'Présent' : att.status === 'ABSENT' ? 'Absent' : att.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AbsencesPage;
