import { create } from "zustand";

interface AddSlideStore {
  isOpen: boolean;
  prompt: string;
  isLoading: boolean;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setPrompt: (prompt: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAddSlideStore = create<AddSlideStore>((set) => ({
  isOpen: false,
  prompt: "",
  isLoading: false,

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, prompt: "" }),
  setPrompt: (prompt: string) => set({ prompt }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  reset: () => set({ isOpen: false, prompt: "", isLoading: false }),
}));
