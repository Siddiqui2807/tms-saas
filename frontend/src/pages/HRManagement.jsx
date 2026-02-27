import { useEffect, useState } from "react";
import api from "../api/axios";

export default function HRManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const res = await api.get("auth/users/");
        setUsers(res.data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load users");
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">HR Management</h2>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          View employee directory and roles.
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="text-lg font-semibold">Users</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Name</th>
                <th className="text-left px-6 py-3 font-semibold">Email</th>
                <th className="text-left px-6 py-3 font-semibold">Role</th>
                <th className="text-left px-6 py-3 font-semibold">Department</th>
                <th className="text-left px-6 py-3 font-semibold">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-200/70 dark:border-slate-800">
                  <td className="px-6 py-4 font-semibold">{u.full_name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.role.replaceAll("_", " ")}</td>
                  <td className="px-6 py-4">{u.department || "-"}</td>
                  <td className="px-6 py-4">{u.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

