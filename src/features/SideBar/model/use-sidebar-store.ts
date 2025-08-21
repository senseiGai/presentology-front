import { create } from "zustand";

interface SideBarState {
  activeItem: string;
  isCollapsed: boolean;
  setActiveItem: (item: string) => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSideBarStore = create<SideBarState>((set) => ({
  activeItem: "Создать презентацию",
  isCollapsed: false,

  setActiveItem: (item) => set({ activeItem: item }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
