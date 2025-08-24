import { create } from "zustand";

type ConfirmDeleteOptions = {
  title?: string;
  onConfirm?: () => void; // что делать при удалении
  description?: string;
};

type State = {
  open: boolean;
  title: string;
  description?: string;
  onConfirm?: () => void;
  openModal: (opts?: ConfirmDeleteOptions) => void;
  closeModal: () => void;
};

export const useConfirmDeleteStore = create<State>((set) => ({
  open: false,
  title: "Название презентации",
  description: "После удаления восстановить презентацию будет невозможно",
  onConfirm: undefined,

  openModal: (opts) =>
    set(() => ({
      open: true,
      title: opts?.title ?? "Название презентации",
      description:
        opts?.description ??
        "После удаления восстановить презентацию будет невозможно",
      onConfirm: opts?.onConfirm,
    })),

  closeModal: () =>
    set(() => ({
      open: false,
      onConfirm: undefined,
    })),
}));
