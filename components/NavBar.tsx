"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell, Compass, House, Settings, UserRound, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/preferences", label: "Profile", icon: UserRound },
  { href: "/matches", label: "Matches", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

function navItemIsActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`);
}

export default function NavBar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        const count = (data.notifications ?? []).filter((n: { read: boolean }) => !n.read).length;
        setUnreadCount(count);
      } catch {
        // non-critical, fail silently
      }
    }
    fetchUnread();
  }, [pathname]);

  useEffect(() => {
    const handler = (e: Event) => {
      setUnreadCount((e as CustomEvent).detail);
    };
    window.addEventListener("unread-count", handler);
    return () => window.removeEventListener("unread-count", handler);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-50 border-b border-blue-900/20 bg-[#07294d] shadow-[0_8px_24px_rgba(7,41,77,0.28)]">
      <div className="grid w-full grid-cols-6 justify-items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = navItemIsActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[88px] w-full min-w-0 flex-col items-center justify-center gap-2 px-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#0a3a6e] text-[#ffc600]"
                  : "text-blue-100 hover:bg-[#0a3a6e] hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}>
              {href === "/notifications" && unreadCount > 0 ? (
                <div className="relative">
                  <Icon className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                </div>
              ) : (
                <Icon className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
              )}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
