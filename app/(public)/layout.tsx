import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
export default function Layout({ children }: { children: ReactNode }) {
  return <PublicLayout marketing>{children}</PublicLayout>;
}
