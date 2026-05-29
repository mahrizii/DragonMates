import type { ReactNode } from "react";
import NavBar from "@/components/NavBar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="flex-1 bg-[#f5f6fa]">{children}</main>
    </>
  );
}
