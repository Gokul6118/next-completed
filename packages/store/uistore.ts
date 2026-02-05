import { create } from "zustand";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  date: string;
  endDate: string;
};

type UIStore = {
  sheetOpen: boolean;
  editTodo: Todo | null;

  openSheet: () => void;
  closeSheet: () => void;

  setEditTodo: (todo: Todo) => void;
  clearEditTodo: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  sheetOpen: false,
  editTodo: null,

  openSheet: () => set({ sheetOpen: true }),
  closeSheet: () => set({ sheetOpen: false }),

  setEditTodo: (todo) =>
    set({
      editTodo: { ...todo },   
      sheetOpen: true,         
    }),

  clearEditTodo: () =>
    set({
      editTodo: null,
    }),
}));
