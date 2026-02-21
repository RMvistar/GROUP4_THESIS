import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useDataStore = create((set) => ({
  data: [], // Gina store and Data halin sa backend
  loading: false, //True sya samtang ga fetch ang data
  error: null,

  //diri na ang fetching sang data (for admin with auth)
  fetchData: async () => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;

      const res = await fetch("http://localhost:5001/api/data/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await res.json();

      set({ data: result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching data:", err);
    }
  },

  // Public fetch for all users (no auth required)
  fetchPublicData: async () => {
    set({ loading: true, error: null });

    try {
      const res = await fetch("http://localhost:5001/api/data/alerts");

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await res.json();

      set({ data: result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching data:", err);
    }
  },
}));
