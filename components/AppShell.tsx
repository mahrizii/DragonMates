"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import NavBar from "./NavBar";

const NAVBAR_ROUTES = new Set([
  "/",
  "/profile",
  "/matches",
  "/messages",
  "/notifications",
]);

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const showNavBar = NAVBAR_ROUTES.has(pathname);

  return (
    <>
      <main className={showNavBar ? "pb-20" : ""}>{children}</main>
      {showNavBar ? <NavBar /> : null}
    </>
  );
}
