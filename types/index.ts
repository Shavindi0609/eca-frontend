export type UserRole = "MEMBER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  image?: string | null;
  imagePath?: string | null;
  coverUrl?: string | null;
}

export interface BookFormData {
  isbn: string;
  title: string;
  author: string;
  category: string;
  price: string;
  quantity: string;
}

export interface Borrow {
  id: number;
  userId: number;
  bookId: number;
  returned?: boolean;
  status?: string;
  returnDate?: string | null;
}

export interface BorrowPayload {
  userId: number;
  bookId: number;
}

export type ToastType = "success" | "error";

export interface ToastData {
  message: string;
  type: ToastType;
}
