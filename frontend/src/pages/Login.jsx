import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid credentials");
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
            "url(https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative p-12 h-full flex flex-col justify-end">
          <div className="text-white text-3xl font-semibold tracking-tight">
            Welcome to TMS Pro
          </div>
          <div className="text-white/80 mt-2 max-w-md">
            A modern platform for tasks, timelines, and role-based dashboards.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-8"
      >
        <div className="text-2xl font-semibold tracking-tight">Sign in</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use your email and password to access your dashboard.
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full mt-6 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error ? (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 rounded-xl bg-hero-gradient text-white py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          No account?{" "}
          <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-semibold">
            Create one
          </Link>
        </div>
      </form>
    </div>
    </div>
  );
}
