import { createLearnerData } from "./defaults";
import { profileSchema, type Profile } from "./models";
import type { LearnerRepository } from "./persistence";

// Replace this adapter at the service boundary when adding database-backed accounts.
export function createDemoService(repository: LearnerRepository) {
  return {
    read: () => repository.load(),
    start(timezone: string) {
      const current = repository.load();
      if (current.status === "error") throw new Error(current.message);
      if (current.status === "ready") return current.data;
      const data = createLearnerData({
        id: "demo-learner",
        isDemo: true,
        timezone,
      });
      repository.save(data);
      return data;
    },
    updateProfile(profile: Profile) {
      const current = repository.load();
      if (current.status !== "ready")
        throw new Error("Start a demo before updating preferences.");
      const parsed = profileSchema.parse(profile);
      if (parsed.id !== current.data.profile.id || !parsed.isDemo)
        throw new Error("Cannot change demo identity.");
      const data = { ...current.data, profile: parsed };
      repository.save(data);
      return data;
    },
    reset: () => repository.reset(),
  };
}
