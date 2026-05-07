import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:3001/api';

export interface Building {
  id: string;
  name: string;
  code: string;
  address: string;
  description: string;
  logoUrl?: string;
  numRooms: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    filieres: number;
    users: number;
  };
}

interface BuildingsState {
  buildings: Building[];
  isLoading: boolean;
  error: string | null;
  fetchBuildings: () => Promise<void>;
  createBuilding: (data: Partial<Building>) => Promise<void>;
  updateBuilding: (id: string, data: Partial<Building>) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  hardDeleteBuilding: (id: string) => Promise<void>;
}

export const useBuildingsStore = create<BuildingsState>((set) => ({
  buildings: [],
  isLoading: false,
  error: null,

  fetchBuildings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/buildings`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      // NestJS standard response wrapper might be active
      const data = response.data.data || response.data;
      set({ buildings: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  createBuilding: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      await axios.post(`${API_URL}/buildings`, data, { headers });
      const fetchResponse = await axios.get(`${API_URL}/buildings`, { headers });
      const newData = fetchResponse.data.data || fetchResponse.data;
      set({ buildings: newData, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur de création';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateBuilding: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      await axios.patch(`${API_URL}/buildings/${id}`, data, { headers });
      const fetchResponse = await axios.get(`${API_URL}/buildings`, { headers });
      const newData = fetchResponse.data.data || fetchResponse.data;
      set({ buildings: newData, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur de mise à jour';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteBuilding: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      await axios.delete(`${API_URL}/buildings/${id}`, { headers });
      const fetchResponse = await axios.get(`${API_URL}/buildings`, { headers });
      const newData = fetchResponse.data.data || fetchResponse.data;
      set({ buildings: newData, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur de désactivation';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  hardDeleteBuilding: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      await axios.delete(`${API_URL}/buildings/${id}/permanent`, { headers });
      const fetchResponse = await axios.get(`${API_URL}/buildings`, { headers });
      const newData = fetchResponse.data.data || fetchResponse.data;
      set({ buildings: newData, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur de suppression définitive';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));
