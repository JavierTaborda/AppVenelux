import { create } from "zustand";
import type { VeneluxMaterial } from "../types/request";

type SelectedMap = Record<string, number>;
type CustomItemsMap = Record<string, VeneluxMaterial>;

interface SelectedItemsStore {
  selected: SelectedMap;
  customItems: CustomItemsMap;
  setSelected: (next: SelectedMap) => void;
  upsertCustomItem: (item: VeneluxMaterial) => void;
  removeCustomItem: (item: VeneluxMaterial) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  getQuantity: (key: string) => number;
  // Typed helpers that accept a VeneluxMaterial
  incByItem: (item: VeneluxMaterial) => void;
  decByItem: (item: VeneluxMaterial) => void;
  removeByItem: (item: VeneluxMaterial) => void;
  getQuantityByItem: (item: VeneluxMaterial) => number;
  clear: () => void;
}

export const useSelectedItemsStore = create<SelectedItemsStore>((set, get) => {
  const keyOf = (item: VeneluxMaterial) =>
    String(item.codigo || item.codart || item.material);

  return {
    selected: {},
    customItems: {},
    setSelected: (next) => set({ selected: next }),
    upsertCustomItem: (item) => {
      const k = keyOf(item);
      set((state) => ({
        customItems: {
          ...state.customItems,
          [k]: item,
        },
      }));
    },
    removeCustomItem: (item) => {
      const k = keyOf(item);
      set((state) => {
        const nextCustom = { ...state.customItems };
        const nextSelected = { ...state.selected };
        if (k in nextCustom) delete nextCustom[k];
        if (k in nextSelected) delete nextSelected[k];
        return {
          customItems: nextCustom,
          selected: nextSelected,
        };
      });
    },
    inc: (key) =>
      set((state) => ({ selected: { ...state.selected, [key]: (state.selected[key] || 0) + 1 } })),    
    
    dec: (key) =>
      set((state) => {
        const next = { ...state.selected };
        const val = (next[key] || 0) - 1;
        if (val <= 0) delete next[key];
        else next[key] = val;
        return { selected: next };
      }),
    getQuantity: (key) => get().selected[key] || 0,
    incByItem: (item) => {
      const k = keyOf(item);
      set((state) => {
        const current = state.selected[k] || 0;
        return { selected: { ...state.selected, [k]: current + 1 } };
      });
    },
    decByItem: (item) => {
      const k = keyOf(item);
      set((state) => {
        const next = { ...state.selected };
        const val = (next[k] || 0) - 1;
        if (val <= 0) delete next[k];
        else next[k] = val;
        return { selected: next };
      });
    },
    removeByItem: (item) => {
      const k = keyOf(item);
      set((state) => {
        const next = { ...state.selected };
        if (k in next) delete next[k];
        return { selected: next };
      });
    },
    getQuantityByItem: (item) => get().selected[keyOf(item)] || 0,
    clear: () => set({ selected: {}, customItems: {} }),
  };
});
