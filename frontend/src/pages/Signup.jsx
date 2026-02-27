import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const roles = [
  { value: "SALES_EMPLOYEE", label: "Sales Employee" },
  { value: "IT_EMPLOYEE", label: "IT Employee" },
  { value: "HR_EMPLOYEE", label: "HR Employee" },
  { value: "MANAGER", label: "Manager" },
  { value: "TEAM_LEADER", label: "Team Leader" },
];

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("IT_EMPLOYEE");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        role,
        department,
        phone,
      });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.detail ||
        "Registration failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div
        className="hidden lg:block relative"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative p-12 h-full flex flex-col justify-end">
          <div className="text-white text-3xl font-semibold tracking-tight">
            Build your workflow
          </div>
          <div className="text-white/80 mt-2 max-w-md">
            Create an account to manage tasks, timelines, and track progress with
            role-based dashboards.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-8"
        >
          <div className="text-2xl font-semibold tracking-tight">Create account</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Choose your role and start using the platform.
          </div>

          <input
            className="w-full mt-6 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            className="w-full mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Password (min 8 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <input
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <input
            className="w-full mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}

          <button
            disabled={submitting}
            className="w-full mt-6 rounded-xl bg-hero-gradient text-white py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>

          <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
