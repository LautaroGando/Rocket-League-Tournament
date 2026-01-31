import { create } from "zustand";

interface ModalOptions {
  title: string;
  message: string;
  type: "alert" | "confirm" | "prompt";
  defaultValue?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
}

interface UiState {
  modal: ModalOptions | null;
  showAlert: (title: string, message: string) => Promise<void>;
  showConfirm: (title: string, message: string) => Promise<boolean>;
  showPrompt: (
    title: string,
    message: string,
    defaultValue?: string,
  ) => Promise<string | null>;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  modal: null,

  showAlert: (title, message) => {
    return new Promise((resolve) => {
      set({
        modal: {
          title,
          message,
          type: "alert",
          onConfirm: () => {
            set({ modal: null });
            resolve();
          },
        },
      });
    });
  },

  showConfirm: (title, message) => {
    return new Promise((resolve) => {
      set({
        modal: {
          title,
          message,
          type: "confirm",
          onConfirm: () => {
            set({ modal: null });
            resolve(true);
          },
          onCancel: () => {
            set({ modal: null });
            resolve(false);
          },
        },
      });
    });
  },

  showPrompt: (title, message, defaultValue = "") => {
    return new Promise((resolve) => {
      set({
        modal: {
          title,
          message,
          type: "prompt",
          defaultValue,
          onConfirm: (value) => {
            set({ modal: null });
            resolve(value || null);
          },
          onCancel: () => {
            set({ modal: null });
            resolve(null);
          },
        },
      });
    });
  },

  closeModal: () => set({ modal: null }),
}));
