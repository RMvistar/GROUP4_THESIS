import { create } from "zustand";

export const useAuthStore = create((set) => ({
  //ang initial state - Load from localStorage
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,

  // Login functions namun
  login: async (name, password) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user, // contains role
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return data.user; // allow redirect logic
    } catch (err) {
      const errorMessage =
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Please check if the backend is running."
          : err.message;

      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
      });
      throw err;
    }
  },

  // REGISTER
  register: async (first_name, last_name, name, email, password, role) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          name,
          email,
          password,
          role,
        }),
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
  logout: () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
