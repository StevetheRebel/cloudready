"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Select } from "@/components/ui/field";
const subscribe = () => () => {};
export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-choice" className="text-sm text-muted-foreground">
        Theme
      </label>
      <Select
        id="theme-choice"
        className="w-28 text-sm"
        value={mounted ? theme : "light"}
        disabled={!mounted}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </Select>
    </div>
  );
}
