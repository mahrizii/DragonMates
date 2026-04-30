import type { ReactNode } from "react";
import NavBar from "@/components/NavBar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
