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
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Directory Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Members Directory</h1>
            <p className="text-slate-400 mt-2 text-base max-w-xl">
              Register and manage library members, roles, and credentials.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
          <form onSubmit={submit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl sticky top-24">
            <h2 className="font-bold text-white text-lg mb-6 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50"></span>
              {editingId ? `Edit member #${editingId}` : "Add a new member"}
            </h2>
            <div className="space-y-5">
              <Field label="Full name">
                <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    placeholder="e.g. Thamidu Chamod"
                />
              </Field>
              <Field label="Email">
                <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    placeholder="member@example.com"
                />
              </Field>
              <Field label="Role">
                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserFormData["role"] })}
                    className="w-full bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold px-5 py-3 text-sm rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Register member"}
              </button>
              {editingId && (
                  <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white border border-slate-700/80 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
              )}
            </div>
          </form>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">Registered Members</h2>
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                  {loading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading members…</td>
                      </tr>
                  )}
                  {!loading && users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                          No members yet — add the first one using the form.
                        </td>
                      </tr>
                  )}
                  {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs font-semibold">#{u.id}</td>
                        <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                        <td className="px-6 py-4 text-slate-300">{u.email}</td>
                        <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {u.role}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                              onClick={() => startEdit(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/20 transition-all"
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => remove(u.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/20 transition-all"
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
        </div>

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
  );
}