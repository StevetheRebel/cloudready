import { learnerDataSchema, type LearnerData } from "./models";
import { ONBOARDING_STORAGE_KEY } from "./onboarding";

export const DEMO_STORAGE_KEY = "cloudready:demo:v1";
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export type LoadResult =
  | { status: "empty" }
  | { status: "ready"; data: LearnerData }
  | { status: "error"; message: string };
export interface LearnerRepository {
  load(): LoadResult;
  save(data: LearnerData): void;
  reset(): void;
}

// Demo-only adapter. Authenticated records will live behind server-side services.
export function createDemoRepository(storage: StoragePort): LearnerRepository {
  return {
    load() {
      try {
        const raw = storage.getItem(DEMO_STORAGE_KEY);
        if (!raw) return { status: "empty" };
        const parsed = learnerDataSchema.safeParse(JSON.parse(raw));
        if (!parsed.success || !parsed.data.profile.isDemo)
          return {
            status: "error",
            message:
              "Saved demo data could not be read. Reset it explicitly to start again.",
          };
        return { status: "ready", data: parsed.data };
      } catch {
        return {
          status: "error",
          message: "Demo storage is unavailable or contains unreadable data.",
        };
      }
    },
    save(data) {
      const valid = learnerDataSchema.parse(data);
      if (!valid.profile.isDemo)
        throw new Error("This repository accepts demo data only.");
      // Whitelisted schema strips unknown properties, including accidental secrets.
      storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(valid));
    },
    reset() {
      storage.removeItem(DEMO_STORAGE_KEY);
      storage.removeItem(ONBOARDING_STORAGE_KEY);
    },
  };
}
