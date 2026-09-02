import type { Book, Borrow, BorrowPayload, User, UserFormData } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers:
      options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json", ...options.headers }
        : options.headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      // response wasn't JSON — keep default message
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/* ---------------- User Service ---------------- */
export const UserAPI = {
  save: (user: UserFormData) =>
    request<User>("/api/users/save", { method: "POST", body: JSON.stringify(user) }),
  getById: (id: number | string) => request<User>(`/api/users/${id}`),
  getAll: () => {
    console.log("Fetching all users from API...");
    return request<User[]>("/api/users/getAll");
  },
  update: (id: number | string, user: UserFormData) =>
    request<User>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(user) }),
  remove: (id: number | string) => request<void>(`/api/users/${id}`, { method: "DELETE" }),
  exists: (id: number | string) => request<boolean>(`/api/users/${id}/exists`),
};

/* ---------------- Book Service ---------------- */
export const BookAPI = {
  save: (formData: FormData) => request<Book>("/api/books/save", { method: "POST", body: formData }),
  getAll: () => request<Book[]>("/api/books/getAll"),
  getById: (id: number | string) => request<Book>(`/api/books/${id}`),
  getByIsbn: (isbn: string) => request<Book>(`/api/books/isbn/${isbn}`),
  update: (id: number | string, book: Partial<Book>) =>
    request<Book>(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(book) }),
  remove: (id: number | string) => request<void>(`/api/books/${id}`, { method: "DELETE" }),
  searchByTitle: (title: string) => request<Book[]>(`/api/books/search?title=${encodeURIComponent(title)}`),
  getByCategory: (category: string) =>
    request<Book[]>(`/api/books/category/${encodeURIComponent(category)}`),
  reduceStock: (id: number | string, quantity: number) =>
    request<Book>(`/api/books/${id}/reduce-stock?quantity=${quantity}`, { method: "PATCH" }),
};

/* ---------------- Borrow Service ---------------- */
export const BorrowAPI = {
  save: (payload: BorrowPayload) =>
    request<Borrow>("/api/borrows/save", { method: "POST", body: JSON.stringify(payload) }),
  returnBook: (id: number | string) => request<Borrow>(`/api/borrows/${id}/return`, { method: "PUT" }),
  historyByUser: (userId: number | string) => request<Borrow[]>(`/api/borrows/user/${userId}`),
  getAll: () => request<Borrow[]>("/api/borrows/getAll"),
};

/* ---------------- Helpers ---------------- */
// Books may come back with the cover under different field names, and as
// either a full URL or a path relative to the gateway — normalize it here.
export function resolveBookImage(book?: Book | null): string | null {
  const raw = book?.imageUrl || book?.image || book?.imagePath || book?.coverUrl || null;
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}
