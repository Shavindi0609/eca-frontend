"use client";

import { useEffect, useState, type FormEvent } from "react";
import { UserAPI } from "@/services/api";
import Toast from "@/components/Toast";
import Field from "@/components/Field";
import type { User, UserFormData, ToastData } from "@/types";

const EMPTY: UserFormData = { name: "", email: "", role: "MEMBER" };

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<UserFormData>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = (message: string, type: ToastData["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await UserAPI.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      notify((e as Error).message, "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ name: u.name || "", email: u.email || "", role: u.role || "MEMBER" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await UserAPI.update(editingId, form);
        notify("Member updated.");
      } else {
        console.log("Saving new member:", form);
        await UserAPI.save(form);
        notify("Member registered.");
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
    if (!confirm("Remove this member?")) return;
    try {
      await UserAPI.remove(id);
      notify("Member removed.");
      load();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  return (
    <div className="rise-in">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Members</h1>
        <p className="text-muted text-sm mt-1">Register and manage library members.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <form onSubmit={submit} className="card p-5 h-fit">
          <h2 className="font-bold text-ink mb-4">{editingId ? `Edit member #${editingId}` : "Add a member"}</h2>
          <div className="space-y-3">
            <Field label="Full name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="e.g. Thamidu Chamod"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="member@example.com"
              />
            </Field>
            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserFormData["role"] })}
                className="input"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </Field>
          </div>
          <div className="flex gap-2 mt-5">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving…" : editingId ? "Save changes" : "Add member"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">Loading members…</td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No members yet — add the first one on the left.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface">
                  <td className="px-4 py-3 text-muted">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-primary-soft text-primary">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => startEdit(u)} className="link-btn">Edit</button>
                    <button onClick={() => remove(u.id)} className="link-btn text-danger">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
