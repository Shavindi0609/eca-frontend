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
      <div className="rise-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Members</h1>
          <p className="text-slate-500 text-base mt-1.5">Register and manage library members.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          <form onSubmit={submit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              {editingId ? `Edit member #${editingId}` : "Add a member"}
            </h2>
            <div className="space-y-4">
              <Field label="Full name">
                <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-sm rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
                    placeholder="e.g. Thamidu Chamod"
                />
              </Field>
              <Field label="Email">
                <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-sm rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
                    placeholder="member@example.com"
                />
              </Field>
              <Field label="Role">
                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserFormData["role"] })}
                    className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-sm rounded-xl text-slate-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 text-sm rounded-xl shadow-sm shadow-red-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Add member"}
              </button>
              {editingId && (
                  <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
              )}
            </div>
          </form>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {loading && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">Loading members…</td>
                    </tr>
                )}
                {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">
                        No members yet — add the first one on the left.
                      </td>
                    </tr>
                )}
                {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs font-semibold">#{u.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-5 py-4 text-slate-600">{u.email}</td>
                      <td className="px-5 py-4">
                      <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200/60">
                        {u.role}
                      </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-4">
                        <button
                            onClick={() => startEdit(u)}
                            className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                            onClick={() => remove(u.id)}
                            className="text-sm font-semibold text-slate-400 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
  );
}