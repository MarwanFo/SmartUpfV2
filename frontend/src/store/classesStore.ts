import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Class {
  id: string;
  name: string;
  level: number;
  academicYear: string;
  capacity?: number;
  roomNumber?: string;
  programId: string;
  buildingId: string;
  program?: { id: string; name: string; code: string };
  building?: { id: string; name: string };
  students?: any[];
  _count?: { students: number };
}

interface ClassesState {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  fetchClasses: (filters?: { programId?: string; buildingId?: string; level?: number }) => Promise<void>;
  createClass: (data: any) => Promise<void>;
  updateClass: (id: string, data: any) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  splitPromotion: (params: any) => Promise<void>;
  fetchClassById: (id: string) => Promise<Class>;
}

const API_URL = 'http://localhost:3001/api/classes';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const useClassesStore = create<ClassesState>((set, get) => ({
  classes: [],
  isLoading: false,
  error: null,

  fetchClasses: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.programId) params.append('programId', filters.programId);
      if (filters?.buildingId) params.append('buildingId', filters.buildingId);
      if (filters?.level) params.append('level', filters.level.toString());

      const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
      const data = response.data.data || response.data;
      set({ classes: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createClass: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(API_URL, data, getAuthHeaders());
      get().fetchClasses();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateClass: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.patch(`${API_URL}/${id}`, data, getAuthHeaders());
      get().fetchClasses();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteClass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      set(state => ({
        classes: state.classes.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  splitPromotion: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/split`, params, getAuthHeaders());
      get().fetchClasses();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchClassById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
      return response.data.data || response.data;
    } catch (error: any) {
      throw error;
    }
  }
}));
