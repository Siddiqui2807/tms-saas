import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, CheckCircle2, ClipboardList, Users } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { refreshDashboardStats, useDashboardStats } from "../stores/dashboardStatsStore";

export default function Dashboard() {
  const { user } = useAuth();
  const statsState = useDashboardStats();

  if (statsState.status === "loading" || statsState.status === "idle") {
    return <div>Loading dashboard...</div>;
  }

  if (statsState.status === "error") {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-600">{statsState.error}</div>
        <button
          onClick={refreshDashboardStats}
          className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = statsState.data;

  const tasksByStatus = Array.isArray(stats.tasks_by_status) ? stats.tasks_by_status : [];
  const statusCount = (key) => tasksByStatus.find((x) => x.status === key)?.count || 0;

  const barData = [
    { name: "Pending", value: statusCount("PENDING") },
    { name: "In Progress", value: statusCount("IN_PROGRESS") },
    { name: "Completed", value: statusCount("COMPLETED") },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {user?.role === "ADMIN"
              ? "Organization overview"
              : user?.role === "MANAGER" || user?.role === "TEAM_LEADER"
              ? `Department overview${stats.department ? ` • ${stats.department}` : ""}`
              : "Your work overview"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {user?.role === "ADMIN" ? (
          <KpiCard title="Users" value={stats.users_total || 0} icon={<Users size={22} />} />
        ) : null}

        <KpiCard title="Tasks" value={stats.tasks_total || 0} icon={<ClipboardList size={22} />} />
        <KpiCard title="In Progress" value={statusCount("IN_PROGRESS")} icon={<BarChart3 size={22} />} />
        <KpiCard title="Completed" value={statusCount("COMPLETED")} icon={<CheckCircle2 size={22} />} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Tasks by status</div>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-300">{title}</div>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">
        <CountUp end={Number(value) || 0} duration={1} />
      </div>
    </div>
  );
}
