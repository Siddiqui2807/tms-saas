import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function TaskDetails() {
  const { taskId } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newEntry, setNewEntry] = useState({
    work_description: "",
    date: "",
    hours: "",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tRes, tlRes, aRes] = await Promise.all([
        api.get(`tasks/${taskId}/`),
        api.get(`tasks/${taskId}/timeline/`),
        api.get("auth/assignees/").catch(() => ({ data: [] })),
      ]);
      setTask(tRes.data);
      setTimeline(tlRes.data);
      setAssignees(aRes.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "TEAM_LEADER";

  const updateTask = async (patch) => {
    try {
      const res = await api.patch(`tasks/${taskId}/`, patch);
      setTask(res.data);
    } catch (err) {
      setError(JSON.stringify(err?.response?.data || "Update failed"));
    }
  };

  const setStatus = async (status) => {
    try {
      const res = await api.patch(`tasks/${taskId}/status/`, { status });
      setTask(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Status update failed");
    }
  };

  const setAssignee = async (assigned_to_id) => {
    try {
      const res = await api.patch(`tasks/${taskId}/assign/`, { assigned_to_id: assigned_to_id || "" });
      setTask(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Assignment failed");
    }
  };

  const addTimeline = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`tasks/${taskId}/timeline/`, {
        work_description: newEntry.work_description,
        date: newEntry.date,
        hours: Number(newEntry.hours),
      });
      setNewEntry({ work_description: "", date: "", hours: "" });
      const tlRes = await api.get(`tasks/${taskId}/timeline/`);
      setTimeline(tlRes.data);
    } catch (err) {
      setError(JSON.stringify(err?.response?.data || "Add timeline failed"));
    }
  };

  const submitEntry = async (entryId) => {
    setError("");
    try {
      await api.patch(`timeline/${entryId}/submit/`, {});
      const tlRes = await api.get(`tasks/${taskId}/timeline/`);
      setTimeline(tlRes.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || "Submit failed");
    }
  };

  const updateEntry = async (entryId, patch) => {
    setError("");
    try {
      await api.patch(`timeline/${entryId}/`, patch);
      const tlRes = await api.get(`tasks/${taskId}/timeline/`);
      setTimeline(tlRes.data);
    } catch (err) {
      setError(JSON.stringify(err?.response?.data || "Edit failed"));
    }
  };

  const deleteEntry = async (entryId) => {
    setError("");
    try {
      await api.delete(`timeline/${entryId}/`);
      const tlRes = await api.get(`tasks/${taskId}/timeline/`);
      setTimeline(tlRes.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!task) return <div className="text-red-600">{error || "Task not found"}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link to="/app/tasks" className="text-sm text-slate-600 dark:text-slate-300 hover:underline">
            ← Back to tasks
          </Link>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight truncate">{task.title}</h2>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Created by {task.created_by?.full_name || task.created_by?.email || "Unknown"} • {task.created_at?.slice?.(0, 10)}
          </div>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
          <div className="text-lg font-semibold">Details</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Status</div>
              <select
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={task.status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Priority</div>
              <select
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={task.priority}
                onChange={(e) => updateTask({ priority: e.target.value })}
              >
                {priorityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Due date</div>
              <input
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                type="date"
                value={task.due_date || ""}
                onChange={(e) => updateTask({ due_date: e.target.value || null })}
              />
            </div>

            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Assignee</div>
              <select
                disabled={!canManage}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-60"
                value={task.assigned_to?.id || ""}
                onChange={(e) => setAssignee(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Unassigned</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.role.replaceAll("_", " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-slate-600 dark:text-slate-300">Description</div>
            <textarea
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-28"
              value={task.description || ""}
              onChange={(e) => setTask((s) => ({ ...s, description: e.target.value }))}
              onBlur={(e) => updateTask({ description: e.target.value })}
              placeholder="Add details for this task..."
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
          <div className="text-lg font-semibold">Timeline</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Add work logs and submit when ready.
          </div>

          <form onSubmit={addTimeline} className="mt-4 space-y-3">
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-24"
              placeholder="Work description"
              value={newEntry.work_description}
              onChange={(e) => setNewEntry((s) => ({ ...s, work_description: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry((s) => ({ ...s, date: e.target.value }))}
                required
              />
              <input
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                type="number"
                step="0.25"
                placeholder="Hours"
                value={newEntry.hours}
                onChange={(e) => setNewEntry((s) => ({ ...s, hours: e.target.value }))}
                required
              />
            </div>
            <button className="w-full rounded-xl bg-hero-gradient text-white py-3 font-semibold hover:opacity-95 transition">
              Add entry
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Entries</div>
          <button
            onClick={fetchAll}
            className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Refresh
          </button>
        </div>

        {timeline.length === 0 ? (
          <div className="p-6 text-slate-600 dark:text-slate-300">No timeline entries yet.</div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {timeline.map((e) => (
              <TimelineRow
                key={e.id}
                entry={e}
                onSubmit={() => submitEntry(e.id)}
                onUpdate={(patch) => updateEntry(e.id, patch)}
                onDelete={() => deleteEntry(e.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineRow({ entry, onSubmit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [work, setWork] = useState(entry.work_description);
  const [date, setDate] = useState(entry.date);
  const [hours, setHours] = useState(entry.hours);

  const save = async () => {
    await onUpdate({ work_description: work, date, hours: Number(hours) });
    setEditing(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300">
              {entry.is_submitted ? "Submitted" : "Draft"}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">{entry.date}</span>
            <span className="text-xs text-slate-600 dark:text-slate-300">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-300">{entry.hours}h</span>
          </div>

          {editing ? (
            <div className="mt-3 space-y-3">
              <textarea
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-24"
                value={work}
                onChange={(e) => setWork(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  type="number"
                  step="0.25"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {entry.work_description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!entry.is_submitted ? (
            <button
              onClick={onSubmit}
              className="text-sm font-semibold px-3 py-2 rounded-lg bg-hero-gradient text-white hover:opacity-95 transition"
            >
              Submit
            </button>
          ) : null}

          {entry.is_editable && !entry.is_submitted ? (
            editing ? (
              <>
                <button
                  onClick={save}
                  className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Delete
                </button>
              </>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
