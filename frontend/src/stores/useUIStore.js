import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      // GLOBAL SORT
      sort: "newest",

      // GLOBAL FILTER (for admin page)
      filter: "",

      // GLOBAL SEARCH (for admin page)
      search: "",

      // MUTATORS
      setSort: (value) => set({ sort: value }),
      setFilter: (value) => set({ filter: value }),
      setSearch: (value) => set({ search: value }),

      // RESETTERS
      resetFilters: () => set({ filter: "" }),
      resetSort: () => set({ sort: "newest" }),
      resetSearch: () => set({ search: "" }),
    }),
    {
      name: "ui-store",
    }
  )
);
