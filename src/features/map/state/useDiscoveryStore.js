import { create } from "zustand";
import {
  DEFAULT_DISCOVERY_FILTERS,
  DEFAULT_MAP_VIEW,
  DEFAULT_ROUTE_MODE,
} from "../constants/discoveryDefaults";

export const useDiscoveryStore = create((set) => ({
  selectedStoreId: null,
  searchTerm: "",
  viewMode: DEFAULT_MAP_VIEW,
  filters: { ...DEFAULT_DISCOVERY_FILTERS },
  routeMode: DEFAULT_ROUTE_MODE,
  routeRequested: false,

  selectStore: (storeId) =>
    set({
      selectedStoreId: storeId,
      routeRequested: false,
    }),

  clearSelectedStore: () =>
    set({
      selectedStoreId: null,
      routeRequested: false,
    }),

  setSearchTerm: (searchTerm) => set({ searchTerm }),

  setViewMode: (viewMode) => set({ viewMode }),

  updateFilter: (filterName, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [filterName]: value,
      },
      selectedStoreId: null,
      routeRequested: false,
    })),

  resetFilters: () =>
    set({
      filters: { ...DEFAULT_DISCOVERY_FILTERS },
      selectedStoreId: null,
      routeRequested: false,
    }),

  setRouteMode: (routeMode) => set({ routeMode }),
  requestRoute: () => set({ routeRequested: true }),
  clearRoute: () => set({ routeRequested: false }),
}));

