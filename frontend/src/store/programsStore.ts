import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Program {
  id: string;
  departmentId: string;
  facultyId: string;
  buildingId?: string;
  code: string;
  name: string;
  cycle: 'LICENCE' | 'MASTER' | 'INGENIEUR' | 'PREPA' | 'DOCTORAT' | 'FORMATION_PRO';
  duration: number;
  coordinatorId?: string;
  
  hasPFA: boolean;
  pfaYear?: number;
  pfaSemester?: string;
  
  hasPFE: boolean;
  pfeYear?: number;
  pfeSemester?: string;
  
  building?: { id: string; name: string };
  department?: { id: string; name: string };
  faculty?: { id: string; name: string };
}

interface ProgramsState {
  programs: Program[];
  isLoading: boolean;
  error: string | null;
  fetchPrograms: () => Promise<void>;
  createProgram: (data: Partial<Program>) => Promise<void>;
  updateProgram: (id: string, data: Partial<Program>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
}

export const useProgramsStore = create<ProgramsState>((set) => ({
  programs: [],
  isLoading: false,
  error: null,

  fetchPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.get('http://localhost:3001/api/programs', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ programs: res.data.data || res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProgram: async (data) => {
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.post('http://localhost:3001/api/programs', data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set((state) => ({ programs: [...state.programs, res.data.data || res.data] }));
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },

  updateProgram: async (id, data) => {
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.put(`http://localhost:3001/api/programs/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const updated = res.data.data || res.data;
      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? updated : p)),
      }));
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },

  deleteProgram: async (id) => {
    try {
      const { accessToken } = useAuthStore.getState();
      await axios.delete(`http://localhost:3001/api/programs/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
      }));
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },
}));
