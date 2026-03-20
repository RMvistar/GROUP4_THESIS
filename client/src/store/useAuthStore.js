import { create } from "zustand";
import {
  getStoredToken,
  isTokenExpired,
  clearAuthStorage,
} from "../utils/authToken.js";

// On startup, clear any stale/expired/malformed token so it never gets sent to the server
const _initialToken = getStoredToken();
if (!_initialToken || isTokenExpired(_initialToken)) {
  clearAuthStorage();
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const normalizeAuthUser = (user) => ({
  id: user?.id || user?._id || "",
  name: user?.name || user?.username || "",
  first_name: user?.first_name || "",
  last_name: user?.last_name || "",
  email: user?.email || "",
  government_id: user?.government_id || "",
  role: user?.role || null,
  mustChangePassword: user?.mustChangePassword || false,
});

export const useAuthStore = create((set, get) => ({
  //ang initial state - Load from localStorage (re-read after cleanup above)
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,

  fetchCurrentUser: async () => {
    const token = get().token || getStoredToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch current user");
      }

      const data = await res.json();
      const normalizedUser = normalizeAuthUser(data);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      set({ user: normalizedUser, isAuthenticated: true });
      return normalizedUser;
    } catch (err) {
      console.error("Failed to hydrate current user:", err);
      return null;
    }
  },

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

      const normalizedUser = normalizeAuthUser(data.user);

      // Save to localStorage
      localStorage.setItem("token", data.token);
      // data.user now includes mustChangePassword from the backend.
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      set({
        user: normalizedUser, // contains role
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return normalizedUser; // allow redirect logic
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
  register: async (first_name, last_name, name, email, password, role = null) => {
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
    // Clear persisted auth state used across the app
    clearAuthStorage();

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

if (_initialToken && !isTokenExpired(_initialToken)) {
  useAuthStore.getState().fetchCurrentUser();
}
