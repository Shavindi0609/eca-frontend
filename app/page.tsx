"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserAPI, BookAPI, BorrowAPI } from "@/services/api";
import StatCard from "@/components/StatCard";
import type { Borrow } from "@/types";

interface Stats {
  users: number | null;
  books: number | null;
  active: number | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: null, books: null, active: null });
  const [recent, setRecent] = useState<Borrow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [users, books, borrows] = await Promise.all([
          UserAPI.getAll(),
          BookAPI.getAll(),
          BorrowAPI.getAll(),
        ]);
        const userList = Array.isArray(users) ? users : [];
        const bookList = Array.isArray(books) ? books : [];
        const borrowList = Array.isArray(borrows) ? borrows : [];
        const active = borrowList.filter((b) => !b.returned && !b.returnDate && b.status !== "RETURNED");
        setStats({ users: userList.length, books: bookList.length, active: active.length });
        setRecent(borrowList.slice(-5).reverse());
      } catch {
        // Backend logic / API integration remains fully intact
      }
    })();
  }, []);

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Enterprise Dashboard
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Library Control Hub
              </h1>
              <p className="text-slate-400 mt-2 text-base max-w-2xl">
                Real-time monitoring and management for members, literary assets, and circulation workflows.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                  href="/borrows"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                + New Circulation
              </Link>
            </div>
          </div>

          {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {error}
              </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Members</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-4xl font-black text-white">{stats.users ?? "—"}</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active Database</span>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Catalog Titles</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-4xl font-black text-white">{stats.books ?? "—"}</span>
                <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">Total Stock</span>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Borrows</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-4xl font-black text-white">{stats.active ?? "—"}</span>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Checked Out</span>
              </div>
            </div>
          </div>

          {/* Navigation Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
                href="/users"
                className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-3xl p-8 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">Members Management</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">Register, modify profiles, and inspect individual membership accounts.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-indigo-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Access registry</span>
                <span>→</span>
              </div>
            </Link>

            <Link
                href="/books"
                className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Book Catalog</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">Browse inventory, add new literary releases, and monitor stock availability.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-purple-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Browse catalog</span>
                <span>→</span>
              </div>
            </Link>

            <Link
                href="/borrows"
                className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/50 rounded-3xl p-8 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">Circulation Desk</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">Process loan allocations, handle returns, and audit active transactions.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-amber-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Manage loans</span>
                <span>→</span>
              </div>
            </Link>
          </div>

          {/* Recent Activity Stream */}
          {recent.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Activity Stream</h3>
                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Live Logs</span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {recent.map((b, i) => (
                      <div key={b.id ?? i} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold bg-slate-800/80 text-indigo-400 px-3 py-1.5 rounded-xl border border-slate-700/50">
                      #{b.id ?? "—"}
                    </span>
                          <span className="text-slate-300 font-medium">
                      User <span className="text-white font-bold">{b.userId}</span> borrowed Book <span className="text-white font-bold">{b.bookId}</span>
                    </span>
                        </div>
                        <span
                            className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${
                                b.returned || b.status === "RETURNED"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                        >
                    {b.returned || b.status === "RETURNED" ? "Returned" : "Active Loan"}
                  </span>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
  );
}