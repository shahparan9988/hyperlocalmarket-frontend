import {create} from 'zustand';
import { authStorage } from '../services/authStorage';

export const useAuthStore = create((set) => ({
    user: null,
    userId: authStorage.getAuthData().userId,
    isAuthenticated: authStorage.isAuthenticated(),

    setAuth: ({ userId, user }) =>
    set({
      userId,
      user: user || null,
      isAuthenticated: true,
    }),

    setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

    clearAuth: () => 
    set({
      user: null,
      userId: null,
      isAuthenticated: false,
    }),
}));