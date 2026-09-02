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
    <div className="rise-in">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Catalog</h1>
        <p className="text-muted text-sm mt-1">Add titles, keep stock accurate, and search instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <form onSubmit={submit} className="border border-line rounded-2xl p-5 h-fit">
          <h2 className="font-bold text-ink mb-4">{editingId ? `Edit title #${editingId}` : "Add a title"}</h2>
          <div className="space-y-3">
            <Field label="ISBN">
              <input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className="input" placeholder="978-0134685991" />
            </Field>
            <Field label="Title">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Effective Java" />
            </Field>
            <Field label="Author">
              <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input" placeholder="Joshua Bloch" />
            </Field>
            <Field label="Category">
              <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" placeholder="Technology" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
              </Field>
              <Field label="Quantity">
                <input required type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input" />
              </Field>
            </div>
            {!editingId && (
              <Field label="Cover image">
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="input" />
              </Field>
            )}
          </div>
          <div className="flex gap-2 mt-5">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving…" : editingId ? "Save changes" : "Add to catalog"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div>
          <div className="relative mb-5">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
              className="input pl-9"
            />
          </div>

          {loading && <p className="text-muted text-sm">Loading catalog…</p>}
          {!loading && visibleBooks.length === 0 && (
            <p className="text-muted text-sm border border-line rounded-2xl p-6 text-center">
              {books.length === 0 ? "No titles in the catalog yet." : "No titles match your search."}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
      className="group text-left border border-line rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-surface flex items-center justify-center overflow-hidden relative">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const sibling = e.currentTarget.nextSibling as HTMLElement | null;
              if (sibling) sibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-full h-full items-center justify-center text-primary/40"
          style={{ display: img ? "none" : "flex" }}
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <span className="absolute top-2 right-2 badge bg-white/90 text-primary shadow-sm backdrop-blur-sm">
          {book.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-ink leading-snug truncate">{book.title}</h3>
        <p className="text-sm text-muted truncate">{book.author}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-ink text-sm">Rs {Number(book.price).toLocaleString()}</span>
          <span className={`text-xs font-medium ${Number(book.quantity) > 0 ? "text-success" : "text-danger"}`}>
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
    <div>
      <div className="aspect-[16/9] bg-surface flex items-center justify-center overflow-hidden rounded-t-2xl relative">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-14 h-14 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center hover:bg-white shadow-sm"
        >
          ×
        </button>
      </div>
      <div className="p-6">
        <span className="badge bg-primary-soft text-primary mb-3">{book.category}</span>
        <h2 className="text-xl font-extrabold text-ink leading-snug">{book.title}</h2>
        <p className="text-muted mt-0.5">{book.author}</p>

        <dl className="grid grid-cols-2 gap-4 mt-5 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">ISBN</dt>
            <dd className="text-ink mt-0.5">{book.isbn}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Price</dt>
            <dd className="text-ink mt-0.5">Rs {Number(book.price).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">In stock</dt>
            <dd className={`mt-0.5 font-medium ${Number(book.quantity) > 0 ? "text-success" : "text-danger"}`}>
              {book.quantity}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Book ID</dt>
            <dd className="text-ink mt-0.5">#{book.id}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 mt-6">
          <button onClick={onEdit} className="btn-primary">Edit title</button>
          <button onClick={onReduceStock} className="btn-ghost">−1 stock</button>
          <button onClick={onRemove} className="btn-ghost text-danger border-danger/20 hover:bg-danger/5 ml-auto">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
