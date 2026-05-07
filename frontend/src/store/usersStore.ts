import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roleId: string;
  buildingId?: string;
  role: { id: string; name: string };
  building?: { id: string; name: string };
  
  studentProfile?: any;
  professorProfile?: any;
  parentProfile?: any;
}

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: any) => Promise<any>;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string) => Promise<any>;
}

const API_URL = 'http://localhost:3001/api/users';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      const data = response.data.data || response.data;
      set({ users: data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors du chargement des utilisateurs', 
        isLoading: false 
      });
      throw error;
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, userData, getAuthHeaders());
      // Refresh the list after creation
      const refreshResponse = await axios.get(API_URL, getAuthHeaders());
      const data = refreshResponse.data.data || refreshResponse.data;
      set({ users: data, isLoading: false });
      return response.data; // Return the new user + tempPassword
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      await axios.patch(`${API_URL}/${id}`, userData, getAuthHeaders());
      // Refresh the list after update
      const response = await axios.get(API_URL, getAuthHeaders());
      const data = response.data.data || response.data;
      set({ users: data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la suppression', 
        isLoading: false 
      });
      throw error;
    }
  },

  resetUserPassword: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${id}/reset-password`, {}, getAuthHeaders());
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe', 
        isLoading: false 
      });
      throw error;
    }
  }
}));
