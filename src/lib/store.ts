import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Section =
  | "dashboard"
  | "payment-certs"
  | "supplier-comparison"
  | "agent-monitor"
  | "process-flows"
  | "settings";

export interface AppSettings {
  nvidiaApiKey: string;
  nvidiaBaseUrl: string;
  nvidiaModel: string;
  visionModel: string;
}

interface AppState {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  nvidiaApiKey: "",
  nvidiaBaseUrl: "https://integrate.api.nvidia.com/v1",
  nvidiaModel: "meta/llama-3.1-405b-instruct",
  visionModel: "meta/llama-3.2-11b-vision-instruct",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeSection: "dashboard",
      setActiveSection: (section) => set({ activeSection: section }),
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "arc-command-centre",
      partialize: (state) => ({
        activeSection: state.activeSection,
        settings: state.settings,
      }),
    }
  )
);
