import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export default function Tasks() {
  const { user } = useAuth();
  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "TEAM_LEADER";

  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    due_date: "",
    assigned_to_id: "",
  });

  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("tasks/");
      setTasks(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignees = async () => {
    try {
      const response = await api.get("auth/assignees/");
      setAssignees(response.data);
    } catch {
      setAssignees([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAssignees();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    setCreating(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
      };
      await api.post("tasks/", payload);
      setForm({ title: "", description: "", priority: "MEDIUM", due_date: "", assigned_to_id: "" });
      await fetchTasks();
    } catch (err) {
      setError(JSON.stringify(err?.response?.data || "Creation failed"));
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`tasks/${taskId}/status/`, { status });
      await fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.error || "Status update failed");
    }
  };

  const removeTask = async (taskId) => {
    try {
      await api.delete(`tasks/${taskId}/`);
      await fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Create, assign, and track progress with status and priority.
          </div>
        </div>
      </div>

      {canCreate ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
          <div className="text-lg font-semibold">Create task</div>
          <form className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3" onSubmit={createTask}>
            <input
              className="lg:col-span-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
            <input
              className="lg:col-span-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
            <select
              className="lg:col-span-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              value={form.priority}
              onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
            >
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              className="lg:col-span-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((s) => ({ ...s, due_date: e.target.value }))}
            />
            <select
              className="lg:col-span-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              value={form.assigned_to_id}
              onChange={(e) => setForm((s) => ({ ...s, assigned_to_id: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name} ({a.role.replaceAll("_", " ")})
                </option>
              ))}
            </select>
            <button
              disabled={creating}
              className="lg:col-span-8 rounded-xl bg-hero-gradient text-white py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
          {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
        </div>
      ) : null}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="text-lg font-semibold">All tasks</div>
          <button
            onClick={fetchTasks}
            className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-6">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-slate-600 dark:text-slate-300">No tasks yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Title</th>
                  <th className="text-left px-6 py-3 font-semibold">Assignee</th>
                  <th className="text-left px-6 py-3 font-semibold">Priority</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Due</th>
                  <th className="text-right px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-t border-slate-200/70 dark:border-slate-800">
                    <td className="px-6 py-4">
                      <Link
                        to={`/app/tasks/${t.id}`}
                        className="font-semibold hover:underline"
                      >
                        {t.title}
                      </Link>
                      {t.description ? (
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {t.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      {t.assigned_to?.full_name || (t.assigned_to?.email ? t.assigned_to.email : "Unassigned")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={t.priority === "HIGH" ? "red" : t.priority === "LOW" ? "slate" : "amber"}>
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={t.status === "COMPLETED" ? "green" : t.status === "IN_PROGRESS" ? "blue" : "slate"}>
                        {t.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{t.due_date || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                          value={t.status}
                          onChange={(e) => updateStatus(t.id, e.target.value)}
                        >
                          {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {canCreate ? (
                          <button
                            onClick={() => removeTask(t.id)}
                            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && !canCreate ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}

function Badge({ children, tone }) {
  const tones = {
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}
