"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookAPI, resolveBookImage } from "@/services/api";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import type { Book, BookFormData, ToastData } from "@/types";

const EMPTY: BookFormData = { isbn: "", title: "", author: "", category: "", price: "", quantity: "" };

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<BookFormData>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const [detailsBook, setDetailsBook] = useState<Book | null>(null);

  const notify = (message: string, type: ToastData["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await BookAPI.getAll();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      notify((e as Error).message, "error");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Instant, front-end only search — filters the already-loaded catalog
  // as the person types, no extra request to the backend.
  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
        (b) =>
            (b.title || "").toLowerCase().includes(q) ||
            (b.author || "").toLowerCase().includes(q) ||
            (b.category || "").toLowerCase().includes(q) ||
            (b.isbn || "").toLowerCase().includes(q)
    );
  }, [books, query]);

  const startEdit = (b: Book) => {
    setDetailsBook(null);
    setEditingId(b.id);
    setForm({
      isbn: b.isbn || "",
      title: b.title || "",
      author: b.author || "",
      category: b.category || "",
      price: String(b.price ?? ""),
      quantity: String(b.quantity ?? ""),
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
    setImageFile(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await BookAPI.update(editingId, {
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity),
        });
        notify("Title updated.");
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (imageFile) fd.append("image", imageFile);
        await BookAPI.save(fd);
        notify("Title added to catalog.");
      }
      cancelEdit();
      await load();
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this title from the catalog?")) return;
    try {
      await BookAPI.remove(id);
      notify("Title removed.");
      setDetailsBook(null);
      load();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const reduceStock = async (id: number) => {
    try {
      await BookAPI.reduceStock(id, 1);
      notify("Stock reduced by 1.");
      load();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Inventory Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Catalog</h1>
            <p className="text-slate-400 mt-2 text-base max-w-xl">
              Add titles, keep stock accurate, and search instantly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Form Section */}
          <form onSubmit={submit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              <span>{editingId ? `Edit title #${editingId}` : "Add a title"}</span>
              {editingId && (
                  <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Editing Mode</span>
              )}
            </h2>
            <div className="space-y-4">
              <Field label="ISBN">
                <input
                    required
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="978-0134685991"
                />
              </Field>
              <Field label="Title">
                <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Effective Java"
                />
              </Field>
              <Field label="Author">
                <input
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Joshua Bloch"
                />
              </Field>
              <Field label="Category">
                <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Technology"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price">
                  <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </Field>
                <Field label="Quantity">
                  <input
                      required
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </Field>
              </div>
              {!editingId && (
                  <Field label="Cover image">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer transition-all"
                    />
                  </Field>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Add to catalog"}
              </button>
              {editingId && (
                  <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all duration-200"
                  >
                    Cancel
                  </button>
              )}
            </div>
          </form>

          {/* Content Section */}
          <div className="space-y-6">
            <div className="relative">
              <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
              <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author, category or ISBN…"
                  className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-xl"
              />
            </div>

            {loading && <p className="text-slate-400 text-sm">Loading catalog…</p>}
            {!loading && visibleBooks.length === 0 && (
                <div className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-12 text-center shadow-xl">
                  <p className="text-slate-400 text-sm">
                    {books.length === 0 ? "No titles in the catalog yet." : "No titles match your search."}
                  </p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleBooks.map((b) => (
                  <BookCard key={b.id} book={b} onOpen={() => setDetailsBook(b)} />
              ))}
            </div>
          </div>
        </div>

        <Modal open={!!detailsBook} onClose={() => setDetailsBook(null)}>
          {detailsBook && (
              <BookDetails
                  book={detailsBook}
                  onEdit={() => startEdit(detailsBook)}
                  onRemove={() => remove(detailsBook.id)}
                  onReduceStock={async () => {
                    await reduceStock(detailsBook.id);
                    setDetailsBook((prev) => (prev ? { ...prev, quantity: Number(prev.quantity) - 1 } : prev));
                  }}
                  onClose={() => setDetailsBook(null)}
              />
          )}
        </Modal>

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
  );
}

interface BookCardProps {
  book: Book;
  onOpen: () => void;
}

function BookCard({ book, onOpen }: BookCardProps) {
  const img = resolveBookImage(book);
  return (
      <button
          onClick={onOpen}
          className="group text-left border border-slate-800 bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden relative">
          {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                  src={img}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const sibling = e.currentTarget.nextSibling as HTMLElement | null;
                    if (sibling) sibling.style.display = "flex";
                  }}
              />
          ) : null}
          <div
              className="w-full h-full items-center justify-center text-purple-400/40"
              style={{ display: img ? "none" : "flex" }}
          >
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-purple-400 border border-slate-700/50 shadow-lg">
          {book.category}
        </span>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base leading-snug truncate group-hover:text-purple-400 transition-colors">{book.title}</h3>
            <p className="text-sm text-slate-400 truncate mt-1">{book.author}</p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
            <span className="font-bold text-white text-sm">Rs {Number(book.price).toLocaleString()}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${Number(book.quantity) > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
            {book.quantity} in stock
          </span>
          </div>
        </div>
      </button>
  );
}

interface BookDetailsProps {
  book: Book;
  onEdit: () => void;
  onRemove: () => void;
  onReduceStock: () => void;
  onClose: () => void;
}

function BookDetails({ book, onEdit, onRemove, onReduceStock, onClose }: BookDetailsProps) {
  const img = resolveBookImage(book);
  return (
      <div className="bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden relative">
          {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={book.title} className="w-full h-full object-cover" />
          ) : (
              <svg className="w-16 h-16 text-purple-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
          )}
          <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-800 border border-slate-700/50 shadow-lg transition-all"
          >
            ✕
          </button>
        </div>
        <div className="p-8">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 inline-block mb-4">
          {book.category}
        </span>
          <h2 className="text-2xl font-black text-white leading-snug">{book.title}</h2>
          <p className="text-slate-400 mt-1 font-medium">{book.author}</p>

          <dl className="grid grid-cols-2 gap-6 mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">ISBN</dt>
              <dd className="text-white font-mono mt-1">{book.isbn}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Price</dt>
              <dd className="text-white font-semibold mt-1">Rs {Number(book.price).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">In stock</dt>
              <dd className={`mt-1 font-bold ${Number(book.quantity) > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {book.quantity}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Book ID</dt>
              <dd className="text-white font-mono mt-1">#{book.id}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-800">
            <button
                onClick={onEdit}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition-all"
            >
              Edit title
            </button>
            <button
                onClick={onReduceStock}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              −1 stock
            </button>
            <button
                onClick={onRemove}
                className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-sm border border-rose-500/20 transition-all ml-auto"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
  );
}