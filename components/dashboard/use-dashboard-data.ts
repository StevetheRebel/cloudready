"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDemoRepository,
  DEMO_STORAGE_KEY,
} from "@/lib/cloudready/persistence";
import { createDemoService } from "@/lib/cloudready/services";
import { createOnboardingDraftStore } from "@/lib/cloudready/onboarding-storage";
import { ONBOARDING_STORAGE_KEY } from "@/lib/cloudready/onboarding";
import type { LearnerData } from "@/lib/cloudready/models";

type State =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      data: LearnerData;
      hasDraft: boolean;
      draftError: boolean;
    };
export function useDashboardData() {
  const [state, setState] = useState<State>({ status: "loading" });
  const request = useRef(0);
  const load = useCallback(async () => {
    const version = ++request.current;
    try {
      const result = await Promise.resolve().then(() => {
        const data = createDemoService(
          createDemoRepository(window.localStorage),
        ).start(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
        const draft = createOnboardingDraftStore(window.localStorage).load(
          data.profile.id,
        );
        return {
          data,
          hasDraft: draft.status === "ready",
          draftError: draft.status === "error",
        };
      });
      if (version === request.current) setState({ status: "ready", ...result });
    } catch {
      if (version === request.current) setState({ status: "error" });
    }
  }, []);
  useEffect(() => {
    const requests = request;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void load();
    });
    function changed(event: StorageEvent) {
      if (
        event.key === null ||
        event.key === DEMO_STORAGE_KEY ||
        event.key === ONBOARDING_STORAGE_KEY
      )
        void load();
    }
    window.addEventListener("storage", changed);
    const refresh = () => {
      void load();
    };
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      requests.current++;
      window.removeEventListener("storage", changed);
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, [load]);
  return {
    state,
    refresh: () => {
      setState({ status: "loading" });
      void load();
    },
  };
}
