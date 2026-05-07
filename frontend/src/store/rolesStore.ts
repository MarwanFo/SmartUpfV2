import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Role {
  id: string;
  name: string;
  scope: string;
  description: string;
  isSystem: boolean;
}

interface RolesState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
}

const API_URL = 'http://localhost:3001/api/roles';

export const useRolesStore = create<RolesState>((set) => ({
  roles: [],
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().accessToken;
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || response.data;
      set({ roles: data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors du chargement des rôles', 
        isLoading: false 
      });
    }
  }
}));
