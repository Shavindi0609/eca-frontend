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
    <div className="rise-in">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Borrowing</h1>
        <p className="text-muted text-sm mt-1">Pick a book, pick a member, confirm.</p>
      </header>

      {/* --- Step flow --- */}
      <section className="card p-6 mb-16">
        <div className="flex items-center gap-2 mb-6">
          {(
            [
              [1, "Book"],
              [2, "Member"],
              [3, "Confirm"],
            ] as const
          ).map(([n, label], i) => (
            <div key={n} className="flex items-center gap-2">
              <span
                className={`step-dot ${
                  step === n
                    ? "bg-primary text-white"
                    : step > n
                    ? "bg-primary-soft text-primary"
                    : "bg-surface text-muted border border-line"
                }`}
              >
                {n}
              </span>
              <span className={`text-sm font-medium ${step === n ? "text-ink" : "text-muted"}`}>{label}</span>
              {i < 2 && <span className="w-8 h-px bg-line mx-1" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-bold text-ink mb-3">Choose a book</h2>
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
                className="input pl-9"
              />
            </div>
            {loading ? (
              <p className="text-sm text-muted py-6 text-center">Loading books…</p>
            ) : availableBooks.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                {books.length === 0 ? "No books in the catalog yet." : "No available books match your search."}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
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
                      className="pick-tile flex items-center gap-3"
                    >
                      <div className="w-11 h-11 rounded-lg bg-surface overflow-hidden shrink-0 flex items-center justify-center">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-ink truncate">{b.title}</p>
                        <p className="text-xs text-muted mt-0.5">{b.author} · {b.quantity} left</p>
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink">Choose a member</h2>
              <button onClick={() => setStep(1)} className="link-btn text-xs">← change book</button>
            </div>
            {selectedBook && (
              <p className="text-xs text-muted mb-3">
                Borrowing <span className="font-medium text-ink">{selectedBook.title}</span>
              </p>
            )}
            <div className="relative mb-3">
              <input
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Search members…"
                className="input"
              />
            </div>
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                {users.length === 0 ? "No members registered yet." : "No members match your search."}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUserId(u.id);
                      setStep(3);
                    }}
                    className="pick-tile"
                  >
                    <p className="font-medium text-sm text-ink truncate">{u.name}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">{u.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && selectedUser && selectedBook && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">Confirm</h2>
              <button onClick={() => setStep(2)} className="link-btn text-xs">← change member</button>
            </div>
            <div className="bg-surface rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-white border border-line overflow-hidden shrink-0 flex items-center justify-center">
                  {resolveBookImage(selectedBook) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveBookImage(selectedBook)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Book</p>
                  <p className="font-bold text-ink">{selectedBook.title}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted mt-3 mb-1">Member</p>
                  <p className="font-bold text-ink">{selectedUser.name}</p>
                </div>
              </div>
              <span className="badge bg-primary-soft text-primary self-start sm:self-center">Ready to confirm</span>
            </div>
            <button onClick={confirmBorrow} disabled={issuing} className="btn-primary mt-5 w-full sm:w-auto">
              {issuing ? "Borrowing…" : "Confirm borrow"}
            </button>
          </div>
        )}
      </section>

      {/* --- History lookup --- */}
      <section className="mb-10">
        <h2 className="font-bold text-ink mb-3">Look up a member&apos;s history</h2>
        <div className="flex gap-2 mb-4 max-w-md">
          <input
            value={historyUserId}
            onChange={(e) => setHistoryUserId(e.target.value)}
            placeholder="Member ID"
            className="input"
          />
          <button onClick={lookupHistory} className="btn-primary shrink-0">Look up</button>
        </div>
        {history !== null && (
          <div className="card divide-y divide-line">
            {history.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted">No borrow history for this member.</p>
            ) : (
              history.map((r, i) => (
                <div key={r.id ?? i} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-muted">#{r.id ?? "—"}</span>
                  <span>Book {r.bookId}</span>
                  <span className={`badge ${isReturned(r) ? "bg-success/10 text-success" : "bg-primary-soft text-primary"}`}>
                    {isReturned(r) ? "Returned" : "Borrowed"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* --- All records --- */}
      <section>
        <h2 className="font-bold text-ink mb-3">All borrow records</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">Loading records…</td>
                </tr>
              )}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">No borrow records yet.</td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-surface">
                  <td className="px-4 py-3 text-muted">{r.id}</td>
                  <td className="px-4 py-3">{r.userId}</td>
                  <td className="px-4 py-3">{r.bookId}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${isReturned(r) ? "bg-success/10 text-success" : "bg-primary-soft text-primary"}`}>
                      {isReturned(r) ? "Returned" : "Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isReturned(r) && (
                      <button onClick={() => returnBook(r.id)} className="link-btn">Check in</button>
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
