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
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 shadow-2xl z-40">
          <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
            <Link href="/" className="font-black text-xl tracking-tight text-white flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              L
            </span>
              <span>Library<span className="text-indigo-400">.</span></span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                  <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                          active
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/50"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                      }`}
                  >
                    <svg className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {ICONS[link.icon]}
                    </svg>
                    {link.label}
                  </Link>
              );
            })}
          </nav>
          <div className="px-6 py-5 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-400">API Gateway</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-slate-300 font-mono truncate px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] select-all">
              {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089"}
            </p>
          </div>
        </aside>

        {/* Mobile: compact top bar */}
        <header className="md:hidden bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 shadow-xl">
          <div className="px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg tracking-tight text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
              L
            </span>
              <span>Library<span className="text-indigo-400">.</span></span>
            </Link>
          </div>
          <nav className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                  <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                          active
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/50"
                              : "text-slate-400 bg-slate-800/50 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                      }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {ICONS[link.icon]}
                    </svg>
                    {link.label}
                  </Link>
              );
            })}
          </nav>
        </header>
      </>
  );
}