"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

type IconKey = "dashboard" | "members" | "catalog" | "borrows";

const ICONS: Record<IconKey, JSX.Element> = {
  dashboard: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" />
  ),
  members: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
  ),
  catalog: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  ),
  borrows: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
};

interface NavLink {
  href: string;
  label: string;
  icon: IconKey;
}

const LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/users", label: "Members", icon: "members" },
  { href: "/books", label: "Catalog", icon: "catalog" },
  { href: "/borrows", label: "Borrowing", icon: "borrows" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: fixed vertical sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white border-r border-line">
        <div className="h-16 flex items-center px-6 border-b border-line">
          <Link href="/" className="font-extrabold text-lg tracking-tight text-ink">
            Library<span className="text-primary">.</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-primary text-white shadow-sm shadow-primary/30" : "text-muted hover:text-ink hover:bg-surface"
                }`}
              >
                <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  {ICONS[link.icon]}
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-line text-xs text-muted">
          API Gateway
          <p className="text-ink font-medium truncate mt-0.5">
            {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089"}
          </p>
        </div>
      </aside>

      {/* Mobile: compact top bar */}
      <header className="md:hidden bg-white border-b border-line sticky top-0 z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-base tracking-tight text-ink">
            Library<span className="text-primary">.</span>
          </Link>
        </div>
        <nav className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  active ? "bg-primary-soft text-primary" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
