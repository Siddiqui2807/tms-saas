import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Briefcase, LogOut, Moon, Sun, User } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../hooks/useTheme";

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium";

const linkClass = ({ isActive }) =>
  `${linkBase} ${
    isActive
      ? "bg-white/10 text-white"
      : "text-white/80 hover:text-white hover:bg-white/10"
  }`;

function roleNav(role) {
  const base = [
    { to: "/app/dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
    { to: "/app/tasks", label: "Tasks", icon: <Briefcase size={18} /> },
    { to: "/app/profile", label: "Profile", icon: <User size={18} /> },
  ];

  if (role === "MANAGER" || role === "TEAM_LEADER") {
    base.splice(2, 0, { to: "/app/manager", label: "Manager Overview", icon: <BarChart3 size={18} /> });
  }
  if (role === "HR_EMPLOYEE") {
    base.splice(2, 0, { to: "/app/hr", label: "HR Management", icon: <BarChart3 size={18} /> });
  }
  if (role === "ADMIN") {
    base.splice(2, 0, { to: "/app/admin", label: "Admin Panel", icon: <BarChart3 size={18} /> });
  }

  return base;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const items = roleNav(user?.role);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex md:w-72 md:flex-col bg-hero-gradient">
          <div className="px-6 py-6 border-b border-white/15">
            <div className="text-white font-semibold tracking-tight text-xl">
              TMS Pro
            </div>
            <div className="text-white/70 text-sm mt-1">
              Time & Task Management
            </div>
          </div>

          <nav className="px-4 py-4 flex-1 space-y-1">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-white/15">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">
                  {user?.full_name}
                </div>
                <div className="text-white/70 text-xs truncate">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 text-white px-3 py-2 text-sm transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800">
            <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {user?.role?.replaceAll("_", " ")}{user?.department ? ` • ${user.department}` : ""}
                </div>
                <div className="text-lg font-semibold tracking-tight truncate">
                  Welcome back, {user?.full_name?.split(" ")?.[0] || "User"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 text-sm transition"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 md:px-8 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
