import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      set({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set({ loading: false, error: null });

      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false };
    }
  },

  logout: () => set({ user: null, token: null }),
}));
