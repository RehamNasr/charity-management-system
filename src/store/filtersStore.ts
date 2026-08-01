import { create } from 'zustand';

/**
 * Global filters shared across dashboard widgets and list screens (e.g. an active
 * governorate/date-range filter). Business modules populate/read this once they exist;
 * the shape here is deliberately generic so it isn't reworked per-module.
 */
interface GlobalFilters {
  governorateId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

interface FiltersState {
  filters: GlobalFilters;
  setFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  resetFilters: () => void;
}

const initialFilters: GlobalFilters = {
  governorateId: null,
  dateFrom: null,
  dateTo: null,
};

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },
  resetFilters: () => {
    set({ filters: initialFilters });
  },
}));
