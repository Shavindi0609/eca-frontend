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
        setError(
          "Couldn't reach the API Gateway at " +
            (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089") +
            ". Make sure it's running."
        );
      }
    })();
  }, []);

  return (
    <div className="rise-in">
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Dashboard</h1>
        <p className="text-muted mt-2 max-w-xl">
          Manage members, the book catalog, and borrowing — all in one place.
        </p>
      </section>

      {error && (
        <p className="mb-8 text-sm text-danger border border-danger/20 bg-danger/5 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Members" value={stats.users ?? "—"} hint="Registered in the system" />
        <StatCard label="Titles" value={stats.books ?? "—"} hint="In the catalog" />
        <StatCard label="Books out" value={stats.active ?? "—"} hint="Currently borrowed" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Link href="/users" className="card p-5 block hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all">
          <h2 className="font-bold text-ink mb-1">Members</h2>
          <p className="text-sm text-muted">Add, edit, and look up member records.</p>
        </Link>
        <Link href="/books" className="card p-5 block hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all">
          <h2 className="font-bold text-ink mb-1">Catalog</h2>
          <p className="text-sm text-muted">Add titles with covers, search, and track stock.</p>
        </Link>
        <Link href="/borrows" className="card p-5 block hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all">
          <h2 className="font-bold text-ink mb-1">Borrowing</h2>
          <p className="text-sm text-muted">Lend a book to a member, or check one back in.</p>
        </Link>
      </section>

      {recent.length > 0 && (
        <section>
          <h3 className="font-bold text-ink mb-3">Recent activity</h3>
          <div className="card divide-y divide-line">
            {recent.map((b, i) => (
              <div key={b.id ?? i} className="px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-muted">#{b.id ?? "—"}</span>
                <span>User {b.userId} · Book {b.bookId}</span>
                <span
                  className={`badge ${
                    b.returned || b.status === "RETURNED"
                      ? "bg-success/10 text-success"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {b.returned || b.status === "RETURNED" ? "Returned" : "Borrowed"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
