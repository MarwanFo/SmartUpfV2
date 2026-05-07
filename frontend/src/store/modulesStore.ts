import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface AcademicModule {
  id: string;
  programIds?: string[];
  code: string;
  name: string;
  credits: number;
  coefficient: number;
  links?: { 
    programId: string; 
    year: number; 
    semester: string; 
    weeklyHours: number;
  }[];
  
  programs?: { 
    id: string; 
    year: number; 
    semester: string; 
    weeklyHours: number;
    program: { id: string; name: string; code: string; buildingId: string } 
  }[];
}

interface ModulesState {
  modules: AcademicModule[];
  isLoading: boolean;
  error: string | null;
  fetchModules: () => Promise<void>;
  createModule: (data: Partial<AcademicModule>) => Promise<void>;
  updateModule: (id: string, data: Partial<AcademicModule>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
}

export const useModulesStore = create<ModulesState>((set) => ({
  modules: [],
  isLoading: false,
  error: null,

  fetchModules: async () => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.get('http://localhost:3001/api/academic-modules', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ modules: res.data.data || res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createModule: async (data) => {
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.post('http://localhost:3001/api/academic-modules', data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set((state) => ({ modules: [...state.modules, res.data.data || res.data] }));
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },

  updateModule: async (id, data) => {
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.put(`http://localhost:3001/api/academic-modules/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const updated = res.data.data || res.data;
      set((state) => ({
        modules: state.modules.map((m) => (m.id === id ? updated : m)),
      }));
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },

  deleteModule: async (id) => {
    try {
      const { accessToken } = useAuthStore.getState();
      await axios.delete(`http://localhost:3001/api/academic-modules/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set((state) => ({
        modules: state.modules.filter((m) => m.id !== id),
      }));
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },
}));
