import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  buildingId?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          // The backend wraps responses in a { success, data: { ... } } structure
          const { accessToken, refreshToken, user } = response.data.data || response.data;
          
          // Configure axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          const message = err.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await axios.post(`${API_URL}/auth/logout`, { refreshToken });
          }
        } finally {
          axios.defaults.headers.common['Authorization'] = '';
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'upf-auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist tokens and user — never persist loading/error states
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
