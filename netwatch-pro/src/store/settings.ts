import { create } from "zustand";
import { Preferences } from "@capacitor/preferences";

interface SettingsState {
  timeout: number;
  concurrency: number;
  notifications: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  set: (patch: Partial<Omit<SettingsState, "hydrate" | "set" | "hydrated">>) => void;
}

const KEY = "netwatch.settings";

export const useSettings = create<SettingsState>((set, get) => ({
  timeout: 5000,
  concurrency: 12,
  notifications: true,
  hydrated: false,
  hydrate: async () => {
    try {
      const { value } = await Preferences.get({ key: KEY });
      if (value) {
        const parsed = JSON.parse(value);
        set({ ...get(), ...parsed, hydrated: true });
        return;
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true });
  },
  set: (patch) => {
    set(patch);
    const { timeout, concurrency, notifications } = get();
    Preferences.set({
      key: KEY,
      value: JSON.stringify({ timeout, concurrency, notifications }),
    }).catch(() => {});
  },
}));
