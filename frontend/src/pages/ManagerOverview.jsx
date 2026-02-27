import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function ManagerOverview() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const [s, t] = await Promise.all([api.get("dashboard/stats/"), api.get("tasks/")]);
        setStats(s.data);
        setTasks(t.data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load manager overview");
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Manager Overview</h2>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Department tasks, progress, and quick access.
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Metric title="Department" value={stats?.department || "-"} />
        <Metric title="Tasks total" value={String(stats?.tasks_total ?? "-")} />
        <Metric
          title="Completed"
          value={String((stats?.tasks_by_status || []).find((x) => x.status === "COMPLETED")?.count || 0)}
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="text-lg font-semibold">Department tasks</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Title</th>
                <th className="text-left px-6 py-3 font-semibold">Assignee</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-left px-6 py-3 font-semibold">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-slate-200/70 dark:border-slate-800">
                  <td className="px-6 py-4">
                    <Link to={`/app/tasks/${t.id}`} className="font-semibold hover:underline">
                      {t.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{t.assigned_to?.full_name || "Unassigned"}</td>
                  <td className="px-6 py-4">{t.status.replaceAll("_", " ")}</td>
                  <td className="px-6 py-4">{t.due_date || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
      <div className="text-sm text-slate-600 dark:text-slate-300">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

