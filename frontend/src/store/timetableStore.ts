import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface TimetableSlot {
  id?: string;
  courseId: string;
  classId: string;
  buildingId: string;
  room: string;
  dayOfWeek: 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI';
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: string;
  status: 'DRAFT' | 'PUBLISHED';
  course?: {
    name: string;
    professor: { firstName: string; lastName: string };
  };
}

interface TimetableState {
  currentTimetable: TimetableSlot[];
  isLoading: boolean;
  error: string | null;
  fetchTimetable: (classId: string) => Promise<void>;
  generateTimetable: (params: { classId: string; academicYear: string; semester: string }) => Promise<TimetableSlot[]>;
  generateBatchTimetable: (params: { classIds: string[]; academicYear: string; semester: string }) => Promise<any>;
  publishTimetable: (params: { classId: string; academicYear: string; semester: string }) => Promise<void>;
  publishAllTimetables: (params: { buildingId?: string; academicYear: string; semester: string }) => Promise<void>;
  deleteTimetable: (params: { classId: string; academicYear: string; semester: string }) => Promise<void>;
}

export const useTimetableStore = create<TimetableState>((set) => ({
  currentTimetable: [],
  isLoading: false,
  error: null,

  fetchTimetable: async (classId) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.get(`http://localhost:3001/api/timetable/class/${classId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ currentTimetable: Array.isArray(res.data) ? res.data : (res.data.data || []), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Single class — still uses the batch endpoint under the hood
  generateTimetable: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.post(`http://localhost:3001/api/timetable/generate`, {
        classIds: [params.classId],
        academicYear: params.academicYear,
        semester: params.semester
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ isLoading: false });
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // BATCH — ALL classes in ONE call
  generateBatchTimetable: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.post(`http://localhost:3001/api/timetable/generate`, params, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 120000, // 2 min timeout for large batches
      });
      set({ isLoading: false });
      return res.data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  publishTimetable: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      await axios.post(`http://localhost:3001/api/timetable/publish`, params, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  publishAllTimetables: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      await axios.post(`http://localhost:3001/api/timetable/publish-all`, params, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTimetable: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      await axios.post(`http://localhost:3001/api/timetable/delete`, params, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
