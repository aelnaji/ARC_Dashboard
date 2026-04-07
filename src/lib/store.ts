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

export interface SavedCert {
  id: string;
  supplier: string;
  poNumber: string;
  certNumber: string;
  amount: string;
  status: "draft" | "generating" | "completed" | "failed";
  aiResponse?: string;
  createdAt: string;
  updatedAt: string;
  formData?: Record<string, unknown>;
}

interface AppState {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  savedCerts: SavedCert[];
  createCert: (cert: Omit<SavedCert, "createdAt" | "updatedAt">) => void;
  updateCert: (id: string, updates: Partial<Omit<SavedCert, "id" | "createdAt">>) => void;
  deleteCert: (id: string) => void;
  getCert: (id: string) => SavedCert | undefined;
}

const defaultSettings: AppSettings = {
  nvidiaApiKey: "",
  nvidiaBaseUrl: "https://integrate.api.nvidia.com/v1",
  nvidiaModel: "meta/llama-3.1-405b-instruct",
  visionModel: "meta/llama-3.2-11b-vision-instruct",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeSection: "dashboard",
      setActiveSection: (section) => set({ activeSection: section }),
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      savedCerts: [],
      createCert: (cert) => {
        const now = new Date().toISOString();
        set((state) => ({
          savedCerts: [
            { ...cert, createdAt: now, updatedAt: now },
            ...state.savedCerts,
          ],
        }));
      },
      updateCert: (id, updates) => {
        set((state) => ({
          savedCerts: state.savedCerts.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      deleteCert: (id) => {
        set((state) => ({
          savedCerts: state.savedCerts.filter((c) => c.id !== id),
        }));
      },
      getCert: (id) => get().savedCerts.find((c) => c.id === id),
    }),
    {
      name: "arc-command-centre",
      partialize: (state) => ({
        activeSection: state.activeSection,
        settings: state.settings,
        savedCerts: state.savedCerts,
      }),
    }
  )
);
