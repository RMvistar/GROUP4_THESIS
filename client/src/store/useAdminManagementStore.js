import { create } from "zustand";
import { useAuthStore } from "./useAuthStore.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const useAdminManagementStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,

  // Create new user
  register: async (
    first_name,
    last_name,
    username,
    email,
    government_id,
    password,
    role,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API_BASE_URL}/api/users/CreateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          email,
          government_id,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      set({ loading: false });
      return {
        success: true,
        message: data.message || "User created successfully",
        user: data.user,
      };
    } catch (err) {
      const message =
        err?.name === "TypeError"
          ? "Cannot connect to backend server. Please make sure backend is running on port 5001."
          : err.message;

      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // Get all users for user management table
  getUsers: async () => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      set({ loading: false });
      return { success: true, users: data };
    } catch (err) {
      const message =
        err?.name === "TypeError"
          ? "Cannot connect to backend server. Please make sure backend is running on port 5001."
          : err.message;

      set({ error: message, loading: false });
      return { success: false, message, users: [] };
    }
  },

  // Get all roles for dropdowns
  getRolesList: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch roles");
      return { success: true, roles: data };
    } catch (err) {
      return { success: false, roles: [] };
    }
  },

  findUserById: async (userId) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to find user");
      set({ loading: false });
      return { success: true, user: data };
    } catch (error) {
      const message =
        error?.name === "TypeError"
          ? "Cannot connect to backend server. Please make sure backend is running on port 5001."
          : error.message;

      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateUser: async (userId, { first_name, last_name, email, role }) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ first_name, last_name, email, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");

      set({ loading: false });
      return {
        success: true,
        message: data.message || "User updated successfully",
        user: data.user,
      };
    } catch (err) {
      const message =
        err?.name === "TypeError"
          ? "Cannot connect to backend server. Please make sure backend is running on port 5001."
          : err.message;

      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : { message: await res.text() };
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      set({ loading: false });
      return {
        success: true,
        message: data.message || "User deleted successfully",
      };
    } catch (err) {
      const message =
        err?.name === "TypeError"
          ? "Cannot connect to backend server. Please make sure backend is running on port 5001."
          : err.message;

      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // Admin resets another user's password.
  // The backend generates a random temporary password, saves it (hashed),
  // sets mustChangePassword: true, and emails the user.
  resetPassword: async (userId) => {
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(
        `${API_BASE_URL}/api/users/${userId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      return { success: true, message: data.message };
    } catch (err) {
      const message =
        err?.name === "TypeError"
          ? "Cannot connect to backend server. Please make sure backend is running on port 5001."
          : err.message;
      return { success: false, message };
    }
  },
}));
