"use client";

import { useEffect, useMemo, useState } from "react";
import { UserAPI, BookAPI, BorrowAPI, resolveBookImage } from "@/services/api";
import Toast from "@/components/Toast";
import type { Book, Borrow, User, ToastData } from "@/types";

export default function BorrowingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [records, setRecords] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Flow: 1) pick a book  2) pick a member  3) confirm
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookId, setBookId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [issuing, setIssuing] = useState(false);

  const [bookQuery, setBookQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");

  const [historyUserId, setHistoryUserId] = useState("");
  const [history, setHistory] = useState<Borrow[] | null>(null);

  const notify = (message: string, type: ToastData["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, b, r] = await Promise.all([UserAPI.getAll(), BookAPI.getAll(), BorrowAPI.getAll()]);
      setUsers(Array.isArray(u) ? u : []);
      setBooks(Array.isArray(b) ? b : []);
      setRecords(Array.isArray(r) ? r : []);
    } catch (e) {
      notify((e as Error).message, "error");
      setUsers([]);
      setBooks([]);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Only books with stock can be borrowed, filtered instantly on the front end
  const availableBooks = useMemo(() => {
    const inStock = books.filter((b) => Number(b.quantity) > 0);
    const q = bookQuery.trim().toLowerCase();
    if (!q) return inStock;
    return inStock.filter(
        (b) =>
            (b.title || "").toLowerCase().includes(q) ||
            (b.author || "").toLowerCase().includes(q) ||
            (b.isbn || "").toLowerCase().includes(q)
    );
  }, [books, bookQuery]);

  const filteredUsers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
        (u) => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    );
  }, [users, memberQuery]);

  const selectedUser = users.find((u) => u.id === userId);
  const selectedBook = books.find((b) => b.id === bookId);

  const resetFlow = () => {
    setStep(1);
    setBookId(null);
    setUserId(null);
    setBookQuery("");
    setMemberQuery("");
  };

  const confirmBorrow = async () => {
    if (!userId || !bookId) return;
    setIssuing(true);
    try {
      await BorrowAPI.save({ userId, bookId });
      notify(`"${selectedBook?.title}" borrowed by ${selectedUser?.name}.`);
      resetFlow();
      await loadAll();
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setIssuing(false);
    }
  };

  const isReturned = (r: Borrow) => r.returned || r.status === "RETURNED" || !!r.returnDate;

  const returnBook = async (id: number) => {
    try {
      await BorrowAPI.returnBook(id);
      notify("Book checked back in.");
      loadAll();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const lookupHistory = async () => {
    if (!historyUserId) return;
    try {
      const data = await BorrowAPI.historyByUser(historyUserId);
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      notify((e as Error).message, "error");
      setHistory([]);
    }
  };

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Circulation Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Borrowing Desk</h1>
            <p className="text-slate-400 mt-2 text-base max-w-xl">
              Pick a book, pick a member, and confirm the circulation cycle.
            </p>
          </div>
        </div>

        {/* --- Step flow --- */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            {(
                [
                  [1, "Book"],
                  [2, "Member"],
                  [3, "Confirm"],
                ] as const
            ).map(([n, label], i) => (
                <div key={n} className="flex items-center gap-3 shrink-0">
              <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      step === n
                          ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-500/50"
                          : step > n
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700/50"
                  }`}
              >
                {n}
              </span>
                  <span className={`text-sm font-semibold ${step === n ? "text-white" : "text-slate-400"}`}>{label}</span>
                  {i < 2 && <span className="w-12 h-px bg-slate-800 mx-2" />}
                </div>
            ))}
          </div>

          {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Choose a book</h2>
                <div className="relative mb-6">
                  <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                  <input
                      value={bookQuery}
                      onChange={(e) => setBookQuery(e.target.value)}
                      placeholder="Search by book name…"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                  />
                </div>
                {loading ? (
                    <p className="text-sm text-slate-400 py-8 text-center">Loading books…</p>
                ) : availableBooks.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80">
                      {books.length === 0 ? "No books in the catalog yet." : "No available books match your search."}
                    </p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
                      {availableBooks.map((b) => {
                        const img = resolveBookImage(b);
                        return (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setBookId(b.id);
                                  setStep(2);
                                }}
                                className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all text-left shadow-md"
                            >
                              <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-800">
                                {img ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <svg className="w-5 h-5 text-amber-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors">{b.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{b.author} · <span className="text-emerald-400 font-semibold">{b.quantity} left</span></p>
                              </div>
                            </button>
                        );
                      })}
                    </div>
                )}
              </div>
          )}

          {step === 2 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Choose a member</h2>
                  <button onClick={() => setStep(1)} className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">← change book</button>
                </div>
                {selectedBook && (
                    <p className="text-xs text-slate-400 mb-4 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/80">
                      Borrowing: <span className="font-bold text-white">{selectedBook.title}</span>
                    </p>
                )}
                <div className="relative mb-6">
                  <input
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Search members by name or email…"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                  />
                </div>
                {filteredUsers.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80">
                      {users.length === 0 ? "No members registered yet." : "No members match your search."}
                    </p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
                      {filteredUsers.map((u) => (
                          <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setUserId(u.id);
                                setStep(3);
                              }}
                              className="group p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all text-left shadow-md"
                          >
                            <p className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors">{u.name}</p>
                            <p className="text-xs text-slate-400 mt-1 truncate">{u.email}</p>
                          </button>
                      ))}
                    </div>
                )}
              </div>
          )}

          {step === 3 && selectedUser && selectedBook && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Confirm Circulation</h2>
                  <button onClick={() => setStep(2)} className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">← change member</button>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 justify-between shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
                      {resolveBookImage(selectedBook) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveBookImage(selectedBook)!} alt="" className="w-full h-full object-cover" />
                      ) : (
                          <svg className="w-8 h-8 text-amber-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Book</span>
                      <p className="font-bold text-white text-base mt-0.5">{selectedBook.title}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-3 block">Assigned Member</span>
                      <p className="font-bold text-white text-base mt-0.5">{selectedUser.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start sm:self-center">
                Ready to issue
              </span>
                </div>
                <button
                    onClick={confirmBorrow}
                    disabled={issuing}
                    className="mt-6 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-amber-600/20 transition-all w-full sm:w-auto"
                >
                  {issuing ? "Processing…" : "Confirm borrow transaction"}
                </button>
              </div>
          )}
        </section>

        {/* --- History lookup --- */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Member History Audit</h2>
          <div className="flex gap-3 mb-6 max-w-md">
            <input
                value={historyUserId}
                onChange={(e) => setHistoryUserId(e.target.value)}
                placeholder="Enter Member ID"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <button
                onClick={lookupHistory}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all shrink-0"
            >
              Look up
            </button>
          </div>
          {history !== null && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
                {history.length === 0 ? (
                    <p className="px-6 py-6 text-sm text-slate-400">No borrow history records found for this member.</p>
                ) : (
                    history.map((r, i) => (
                        <div key={r.id ?? i} className="px-6 py-4 flex items-center justify-between text-sm">
                          <span className="text-slate-400 font-mono text-xs">#{r.id ?? "—"}</span>
                          <span className="text-slate-200 font-medium">Book ID <span className="text-white font-bold">{r.bookId}</span></span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isReturned(r) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                    {isReturned(r) ? "Returned" : "Active"}
                  </span>
                        </div>
                    ))
                )}
              </div>
          )}
        </section>

        {/* --- All records --- */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">All Circulation Records</h2>
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Member ID</th>
                <th className="px-6 py-4">Book ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
              {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading records…</td>
                  </tr>
              )}
              {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No borrow records found in system.</td>
                  </tr>
              )}
              {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{r.id}</td>
                    <td className="px-6 py-4 text-slate-200 font-medium">{r.userId}</td>
                    <td className="px-6 py-4 text-slate-200 font-medium">{r.bookId}</td>
                    <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isReturned(r) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                      {isReturned(r) ? "Returned" : "Active Out"}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isReturned(r) && (
                          <button
                              onClick={() => returnBook(r.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/20 transition-all"
                          >
                            Check in
                          </button>
                      )}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </section>

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
  );
}