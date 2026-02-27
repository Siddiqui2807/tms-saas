import { useEffect, useState } from "react";
import api from "../api/axios";

const roles = [
  "SALES_EMPLOYEE",
  "IT_EMPLOYEE",
  "HR_EMPLOYEE",
  "MANAGER",
  "TEAM_LEADER",
  "ADMIN",
];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "IT_EMPLOYEE",
    department: "",
    phone: "",
  });

  const load = async () => {
    setError("");
    try {
      const [u, a] = await Promise.all([api.get("auth/users/"), api.get("activity/")]);
      setUsers(u.data);
      setActivity(a.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load admin data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api.post("auth/users/", form);
      setForm({ full_name: "", email: "", password: "", role: "IT_EMPLOYEE", department: "", phone: "" });
      await load();
    } catch (err) {
      setError(JSON.stringify(err?.response?.data || "Create failed"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Admin Panel</h2>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage users and view system activity.
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
        <div className="text-lg font-semibold">Create user</div>
        <form onSubmit={createUser} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
            required
          />
          <input
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            required
          />
          <select
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            value={form.role}
            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <input
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
          />
          <input
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
          <button
            disabled={creating}
            className="md:col-span-2 rounded-xl bg-hero-gradient text-white py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create user"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div className="text-lg font-semibold">Users</div>
            <button
              onClick={load}
              className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Email</th>
                  <th className="text-left px-6 py-3 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200/70 dark:border-slate-800">
                    <td className="px-6 py-4 font-semibold">{u.full_name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.role.replaceAll("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800">
            <div className="text-lg font-semibold">Activity</div>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-800">
            {activity.length === 0 ? (
              <div className="p-6 text-slate-600 dark:text-slate-300">No activity yet.</div>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="p-6">
                  <div className="text-sm font-semibold">{a.action.replaceAll("_", " ")}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {a.entity_type} #{a.entity_id || "-"} • {a.created_at?.slice?.(0, 19)?.replace("T", " ")}
                  </div>
                  {a.message ? (
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      {a.message}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

