import { create } from "zustand";

export const useAuthStore = create((set) => ({
  //ang initial state
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Login functions namun
  login: async (name, password) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      set({
        user: data.user, // contains role
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });

      return data.user; // allow redirect logic
    } catch (err) {
      set({
        error: err.message,
        loading: false,
        isAuthenticated: false,
      });
      throw err;
    }
  },

  // REGISTER
  register: async (name, email, password) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      set({ loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false };
    }
  },

  // LOGOUT
  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    }),
}));
