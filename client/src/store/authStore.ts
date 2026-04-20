import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface User {
  id: string; name: string; email: string; avatar?: string; role: 'ADMIN'|'OWNER'|'TENANT'; status: string;
  phone?: string; occupation?: string; company?: string; about?: string; createdAt?: string;
}

interface AuthState {
  user: User | null; token: string | null; isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, token: null, isLoading: false,

      setAuth: (user, token) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token });
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'rentease-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      },
    }
  )
)
