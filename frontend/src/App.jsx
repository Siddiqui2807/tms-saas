import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import MainLayout from "./layouts/MainLayout";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import HRManagement from "./pages/HRManagement";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ManagerOverview from "./pages/ManagerOverview";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import TaskDetails from "./pages/TaskDetails";
import Tasks from "./pages/Tasks";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleGate({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/app"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:taskId" element={<TaskDetails />} />
        <Route path="profile" element={<Profile />} />

        <Route
          path="manager"
          element={
            <RoleGate roles={["MANAGER", "TEAM_LEADER"]}>
              <ManagerOverview />
            </RoleGate>
          }
        />
        <Route
          path="hr"
          element={
            <RoleGate roles={["HR_EMPLOYEE", "ADMIN"]}>
              <HRManagement />
            </RoleGate>
          }
        />
        <Route
          path="admin"
          element={
            <RoleGate roles={["ADMIN"]}>
              <AdminPanel />
            </RoleGate>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
