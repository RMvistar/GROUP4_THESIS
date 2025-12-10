import { create } from "zustand";

export const useDataStore = create((set) => ({
  data: [], // Gina store and Data halin sa backend
  loading: false, //True sya samtang ga fetch ang data
  error: null,

  //diri na ang fetching sang data
  fetchData: async () => {
    set({ loading: true });

    try {
      const res = await fetch("http://localhost:5000/api/data/export");
      const result = await res.json();

      set({ data: result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
