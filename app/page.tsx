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
      <div className="rise-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 max-w-xl text-base">
            Manage members, the book catalog, and borrowing — all in one place.
          </p>
        </section>

        {error && (
            <p className="mb-8 text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3 rounded-xl font-medium shadow-sm">
              {error}
            </p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard label="Members" value={stats.users ?? "—"} hint="Registered in the system" />
          <StatCard label="Titles" value={stats.books ?? "—"} hint="In the catalog" />
          <StatCard label="Books out" value={stats.active ?? "—"} hint="Currently borrowed" />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <Link href="/users" className="bg-white border border-slate-200/80 rounded-2xl p-6 block shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:border-red-600/40 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Members</h2>
            <p className="text-sm text-slate-500">Add, edit, and look up member records.</p>
          </Link>
          <Link href="/books" className="bg-white border border-slate-200/80 rounded-2xl p-6 block shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:border-red-600/40 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Catalog</h2>
            <p className="text-sm text-slate-500">Add titles with covers, search, and track stock.</p>
          </Link>
          <Link href="/borrows" className="bg-white border border-slate-200/80 rounded-2xl p-6 block shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:border-red-600/40 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Borrowing</h2>
            <p className="text-sm text-slate-500">Lend a book to a member, or check one back in.</p>
          </Link>
        </section>

        {recent.length > 0 && (
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Recent activity</h3>
              <div className="divide-y divide-slate-100">
                {recent.map((b, i) => (
                    <div key={b.id ?? i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-mono text-xs font-semibold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">#{b.id ?? "—"}</span>
                      <span className="font-medium text-slate-700">User <span className="text-slate-900 font-semibold">{b.userId}</span> · Book <span className="text-slate-900 font-semibold">{b.bookId}</span></span>
                      <span
                          className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                              b.returned || b.status === "RETURNED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : "bg-red-50 text-red-600 border border-red-200/60"
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


// "use client";
//
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { UserAPI, BookAPI, BorrowAPI } from "@/services/api";
// import StatCard from "@/components/StatCard";
// import type { Borrow } from "@/types";
//
// interface Stats {
//   users: number | null;
//   books: number | null;
//   active: number | null;
// }
//
// export default function DashboardPage() {
//   const [stats, setStats] = useState<Stats>({ users: null, books: null, active: null });
//   const [recent, setRecent] = useState<Borrow[]>([]);
//   const [error, setError] = useState("");
//
//   useEffect(() => {
//     (async () => {
//       try {
//         const [users, books, borrows] = await Promise.all([
//           UserAPI.getAll(),
//           BookAPI.getAll(),
//           BorrowAPI.getAll(),
//
//
//         ]);
//         const userList = Array.isArray(users) ? users : [];
//         const bookList = Array.isArray(books) ? books : [];
//         const borrowList = Array.isArray(borrows) ? borrows : [];
//         const active = borrowList.filter((b) => !b.returned && !b.returnDate && b.status !== "RETURNED");
//         setStats({ users: userList.length, books: bookList.length, active: active.length });
//         setRecent(borrowList.slice(-5).reverse());
//       } catch {
//         setError(
//           "Couldn't reach the API Gateway at " +
//             (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089") +
//             ". Make sure it's running."
//         );
//       }
//     })();
//   }, []);
//
//   return (
//     <div className="rise-in">
//       <section className="mb-10">
//         <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Dashboard</h1>
//         <p className="text-muted mt-2 max-w-xl">
//           Manage members, the book catalog, and borrowing — all in one place.
//         </p>
//       </section>
//
//       {error && (
//         <p className="mb-8 text-sm text-danger border border-danger/20 bg-danger/5 px-4 py-3 rounded-xl">
//           {error}
//         </p>
//       )}
//
//       <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
//         <StatCard label="Members" value={stats.users ?? "—"} hint="Registered in the system" />
//         <StatCard label="Titles" value={stats.books ?? "—"} hint="In the catalog" />
//         <StatCard label="Books out" value={stats.active ?? "—"} hint="Currently borrowed" />
//       </section>
//
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
//         <Link href="/users" className="card p-5 block hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all">
//           <h2 className="font-bold text-ink mb-1">Members</h2>
//           <p className="text-sm text-muted">Add, edit, and look up member records.</p>
//         </Link>
//         <Link href="/books" className="card p-5 block hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all">
//           <h2 className="font-bold text-ink mb-1">Catalog</h2>
//           <p className="text-sm text-muted">Add titles with covers, search, and track stock.</p>
//         </Link>
//         <Link href="/borrows" className="card p-5 block hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all">
//           <h2 className="font-bold text-ink mb-1">Borrowing</h2>
//           <p className="text-sm text-muted">Lend a book to a member, or check one back in.</p>
//         </Link>
//       </section>
//
//       {recent.length > 0 && (
//         <section>
//           <h3 className="font-bold text-ink mb-3">Recent activity</h3>
//           <div className="card divide-y divide-line">
//             {recent.map((b, i) => (
//               <div key={b.id ?? i} className="px-4 py-3 flex items-center justify-between text-sm">
//                 <span className="text-muted">#{b.id ?? "—"}</span>
//                 <span>User {b.userId} · Book {b.bookId}</span>
//                 <span
//                   className={`badge ${
//                     b.returned || b.status === "RETURNED"
//                       ? "bg-success/10 text-success"
//                       : "bg-primary-soft text-primary"
//                   }`}
//                 >
//                   {b.returned || b.status === "RETURNED" ? "Returned" : "Borrowed"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }
