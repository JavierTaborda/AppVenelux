import { create } from "zustand";
import type { RequestItem } from "../types/request";

type SelectedMap = Record<string, number>;

interface SelectedItemsStore {
  selected: SelectedMap;
  setSelected: (next: SelectedMap) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  getQuantity: (key: string) => number;
  // Typed helpers that accept a RequestItem
  incByItem: (item: RequestItem) => void;
  decByItem: (item: RequestItem) => void;
  removeByItem: (item: RequestItem) => void;
  getQuantityByItem: (item: RequestItem) => number;
  clear: () => void;
}

export const useSelectedItemsStore = create<SelectedItemsStore>((set, get) => {
  const keyOf = (item: RequestItem) => item.codart || item.description;

  return {
    selected: {},
    setSelected: (next) => set({ selected: next }),
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
        const max = item.quantity ?? Number.MAX_SAFE_INTEGER;
        if (current >= max) return { selected: state.selected };
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
    clear: () => set({ selected: {} }),
  };
});
