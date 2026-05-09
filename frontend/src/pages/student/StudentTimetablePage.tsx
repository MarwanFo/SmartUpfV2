import React, { useEffect, useState } from 'react';
import type { TimetableSlot } from '../../store/timetableStore';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import TimetableGrid from '../../components/admin/TimetableGrid';
import { SparklesIcon } from '@heroicons/react/24/outline';

const API = 'http://localhost:3001/api';

const StudentTimetablePage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(`${API}/student/timetable`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        // The backend wraps responses in { success: true, data: ... }
        setSlots(res.data.data || res.data || []);
      } catch (error) {
        toast.error('Erreur lors du chargement de l\'emploi du temps');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchTimetable();
  }, [accessToken]);

  // Extract unique academic years and semesters from the fetched slots
  const uniqueYears = Array.from(new Set(slots.map(s => s.academicYear))).filter(Boolean);
  const uniqueSemesters = Array.from(new Set(slots.map(s => s.semester))).filter(Boolean);

  // Set default selections when slots are loaded
  useEffect(() => {
    if (slots.length > 0) {
      if (!selectedYear && uniqueYears.length > 0) setSelectedYear(uniqueYears[0]);
      if (!selectedSemester && uniqueSemesters.length > 0) setSelectedSemester(uniqueSemesters[0]);
    }
  }, [slots]);

  // Filter slots based on selection
  const filteredSlots = slots.filter(s => {
    const matchYear = selectedYear ? s.academicYear === selectedYear : true;
    const matchSemester = selectedSemester ? s.semester === selectedSemester : true;
    return matchYear && matchSemester;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black text-slate-900">Emploi du Temps</h1>
          <p className="text-slate-500 font-medium mt-1">Consultez votre planning académique officiel</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Année Académique</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">Semestre</option>
            {uniqueSemesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 min-h-[600px]">
        {filteredSlots.length > 0 ? (
          <TimetableGrid 
            slots={filteredSlots}
            classNameLabel={(filteredSlots[0] as any)?.class?.name || 'Votre Classe'}
            programName={(filteredSlots[0] as any)?.class?.program?.name}
            level={(filteredSlots[0] as any)?.class?.level}
            semester={selectedSemester || (filteredSlots[0] as any)?.semester || 'S1'}
            academicYear={selectedYear || (filteredSlots[0] as any)?.academicYear || '2025-2026'}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-24 opacity-50">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 text-slate-400" />
            </div>
            <span className="text-lg font-bold text-slate-500">Aucun cours prévu pour le moment.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTimetablePage;
