import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const API = 'http://localhost:3001/api/professor';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: AttendanceStatus;
  attendanceId: string | null;
}

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string;
  courseName: string;
  className?: string;
  attendanceCount: number;
}

interface TimetableSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  timetable: TimetableSlot[];
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

const statusConfig: Record<AttendanceStatus, { label: string; color: string; bg: string; border: string; icon: React.FC<any> }> = {
  PRESENT: { label: 'Présent', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircleIcon },
  ABSENT:  { label: 'Absent',  color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    icon: XCircleIcon },
  LATE:    { label: 'Retard',  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: ClockIcon },
  EXCUSED: { label: 'Excusé', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    icon: ExclamationCircleIcon },
};

const ProfessorAttendancePage: React.FC = () => {
  const { accessToken } = useAuthStore();
  
  // ─── Phase 1: Logic & Data Fetching ──────────────────────────────────
  const [hierarchy, setHierarchy] = useState<FiliereHierarchy[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<FiliereHierarchy | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassHierarchy | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');


  // Helper: get auth config with current token
  const authConfig = () => ({ headers: { Authorization: `Bearer ${accessToken}` } });

  // 1. Load hierarchy
  useEffect(() => {
    if (!accessToken) return;
    axios.get(`${API}/attendance/hierarchy`, authConfig()).then(res => {
      const payload = res.data?.data ?? res.data;
      setHierarchy(Array.isArray(payload) ? payload : []);
    }).catch(err => console.error('Hierarchy fetch failed:', err.response?.status, err.message));
  }, [accessToken]);

  // 2. Load sessions when course is selected
  const loadSessions = useCallback(async (course: Course) => {
    setSelectedCourse(course);
    setSelectedSession(null);
    setStudents([]);
    setLoading(true);
    try {
      const res = await axios.get(`${API}/courses/${course.id}/sessions`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const payload = res.data?.data ?? res.data;
      const allSessions = Array.isArray(payload) ? payload : [];
      
      // Filter sessions by the currently selected class to avoid showing other groups' sessions
      if (selectedClass) {
        setSessions(allSessions.filter((s: Session) => s.className === selectedClass.name));
      } else {
        setSessions(allSessions);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedClass]);

  // 3. Load attendance sheet when session is selected
  const loadAttendanceSheet = useCallback(async (session: Session) => {
    setSelectedSession(session);
    setSaved(false);
    setLoading(true);
    try {
      const res = await axios.get(`${API}/sessions/${session.id}/attendance`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const payload = res.data?.data ?? res.data;
      const fetchedStudents = Array.isArray(payload.students) ? payload.students : [];
      setStudents(fetchedStudents);

      setSaved(session.attendanceCount > 0);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // 4. Mark a student's status
  const markStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    setSaved(false);
  };

  // 5. Mark all present
  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
    setSaved(false);
  };

  // 6. Save attendance
  const saveAttendance = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      await axios.post(`${API}/sessions/${selectedSession.id}/attendance/bulk`, {
        records: students.map(s => ({ studentId: s.id, status: s.status }))
      }, { headers: { Authorization: `Bearer ${accessToken}` } });
      setSaved(true);
      toast.success('Appel enregistré avec succès !');
    } catch (err) {
      console.error('Failed to save attendance:', err);
      toast.error('Erreur lors de la sauvegarde de l\'appel.');
    } finally {
      setSaving(false);
    }
  };

  // 7. Create session from timetable slot or manual
  const createSession = async (slot: TimetableSlot) => {
    if (!selectedCourse) return;
    setLoading(true);
    
    const sessionData = {
      date: new Date().toISOString().split('T')[0], // Today
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: 'CM', // Default
      notes: `Séance planifiée - ${selectedClass?.name || ''}`,
      classId: selectedClass?.id
    };

    try {
      const res = await axios.post(`${API}/courses/${selectedCourse.id}/sessions`, sessionData, { headers: { Authorization: `Bearer ${accessToken}` } });
      const createdSession = res.data?.data ?? res.data;
      await loadSessions(selectedCourse);
      // Automatically select the new session
      loadAttendanceSheet(createdSession);
      toast.success('Séance créée !');
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Une séance existe déjà pour ce créneau aujourd'hui !");
      } else {
        console.error('Failed to create session:', err);
        toast.error("Erreur lors de la création de la séance.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const lateCount = students.filter(s => s.status === 'LATE' || s.status === 'EXCUSED').length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── Left Sidebar: Navigation ────────────────────────── */}
      <div className="w-80 shrink-0 bg-slate-50/40 border-r border-slate-200 flex flex-col overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-slate-200/60 bg-white/50">
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit tracking-tight">Espace Pédagogique</h2>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest opacity-70">Navigation Smart-UPF</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {hierarchy.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400 italic">Aucune affectation trouvée.</p>
            </div>
          )}
          
          {hierarchy.map(filiere => (
            <div key={filiere.id} className="group">
              <button
                onClick={() => {
                  setSelectedFiliere(selectedFiliere?.id === filiere.id ? null : filiere);
                  setSelectedClass(null);
                  setSelectedCourse(null);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                  selectedFiliere?.id === filiere.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' 
                    : 'bg-white border border-slate-200/60 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedFiliere?.id === filiere.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <AcademicCapIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 block">Filière</span>
                    <span className="text-sm font-extrabold truncate max-w-[140px] block leading-tight">{filiere.name}</span>
                  </div>
                </div>
                <ChevronRightIcon className={`w-4 h-4 transition-transform duration-500 ${selectedFiliere?.id === filiere.id ? 'rotate-90' : 'opacity-40 group-hover:opacity-100'}`} />
              </button>

              {selectedFiliere?.id === filiere.id && (
                <div className="space-y-2 pl-4 mt-2">
                  {filiere.classes.map(clazz => (
                    <div key={clazz.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedClass(selectedClass?.id === clazz.id ? null : clazz);
                          setSelectedCourse(null);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${
                          selectedClass?.id === clazz.id 
                            ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm' 
                            : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <UserGroupIcon className={`w-4 h-4 ${selectedClass?.id === clazz.id ? 'text-indigo-500' : 'text-slate-300'}`} />
                        {clazz.name}
                      </button>
                      
                      {selectedClass?.id === clazz.id && (
                        <div className="pl-6 space-y-1.5 py-1">
                          {clazz.courses.map(course => (
                            <button
                              key={course.id}
                              onClick={() => loadSessions(course)}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-extrabold transition-all ${
                                selectedCourse?.id === course.id 
                                  ? 'bg-indigo-500 text-white shadow-md' 
                                  : 'text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${selectedCourse?.id === course.id ? 'bg-white' : 'bg-slate-300'}`} />
                              <span className="truncate">{course.name}</span>
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

      {/* ─── Middle: Sessions List ───────────────────────────── */}
      <div className="w-64 shrink-0 bg-slate-50/50 border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-outfit">Séances</h2>
            {selectedCourse && <p className="text-xs text-slate-500 truncate max-w-[140px]">{selectedCourse.name}</p>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {!selectedCourse && (
            <p className="text-sm text-slate-400 italic text-center mt-8">← Choisissez un cours</p>
          )}
          {loading && !selectedSession && (
            <div className="flex justify-center mt-8">
              <ArrowPathIcon className="w-6 h-6 text-cyan-500 animate-spin" />
            </div>
          )}
          {selectedCourse && sessions.length === 0 && !loading && (
            <p className="text-sm text-slate-400 italic text-center mt-8 px-4">Aucune séance. Créez-en une avec +</p>
          )}
          {/* ─── Timetable Slots (Suggested) ─── */}
          {selectedCourse && selectedCourse.timetable.length > 0 && (
            <div className="mb-4 px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Emploi du temps</h3>
              {selectedCourse.timetable.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => createSession(slot)}
                  className="w-full text-left p-3 mb-1.5 rounded-xl bg-white border border-dashed border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md uppercase">{slot.dayOfWeek}</span>
                    <PlusIcon className="w-3 h-3 text-cyan-400 group-hover:text-cyan-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">{selectedClass?.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {slot.startTime} - {slot.endTime} • Salle {slot.room}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="h-px bg-slate-200 my-4 mx-2" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3">Historique / Présences</h3>

          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => loadAttendanceSheet(session)}
              className={`w-full text-left p-3.5 rounded-xl transition-all ${
                selectedSession?.id === session.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  selectedSession?.id === session.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{session.type}</span>
              </div>
              <p className="text-sm font-bold">
                {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-[10px] font-medium ${selectedSession?.id === session.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {session.startTime} → {session.endTime}
                </p>
                {session.className && (
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    selectedSession?.id === session.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {session.className}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main: Attendance Sheet ──────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
            <CalendarDaysIcon className="w-16 h-16 opacity-30" />
            <p className="text-base font-semibold">Sélectionnez une séance pour faire l'appel</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2.5 py-1 text-xs font-bold bg-[#0A192F] text-cyan-400 rounded-lg">{selectedSession.type}</span>
                    <h3 className="text-xl font-extrabold text-slate-900 font-outfit">{selectedSession.courseName}</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(selectedSession.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' '}• {selectedSession.startTime} – {selectedSession.endTime}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Quick Stats */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-lg">
                      ✓ {presentCount}
                    </span>
                    <span className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-lg">
                      ✗ {absentCount}
                    </span>
                    <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-lg">
                      ⏱ {lateCount}
                    </span>
                  </div>

                  <button
                    onClick={markAllPresent}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <CheckCircleSolid className="w-4 h-4 text-emerald-500" />
                    Tous Présents
                  </button>

                  <button
                    onClick={saveAttendance}
                    disabled={saving || saved}
                    className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all shadow-md ${
                      saved
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5'
                    } disabled:opacity-70`}
                  >
                    {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : saved ? <CheckIcon className="w-4 h-4" /> : null}
                    {saving ? 'Envoi...' : saved ? 'Appel Envoyé' : 'Envoyer'}
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center mt-16">
                  <ArrowPathIcon className="w-8 h-8 text-cyan-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student, idx) => {
                    return (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-100 to-blue-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 font-bold text-slate-700 text-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">{student.lastName} {student.firstName}</p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(Object.keys(statusConfig) as AttendanceStatus[]).map(status => {
                            const s = statusConfig[status];
                            const isActive = student.status === status;
                            return (
                              <button
                                key={status}
                                onClick={() => !saved && markStatus(student.id, status)}
                                disabled={saved}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  isActive
                                    ? `${s.bg} ${s.color} ${s.border} shadow-sm`
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
                                } ${saved ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <s.icon className="w-3.5 h-3.5" />
                                <span>{s.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default ProfessorAttendancePage;
