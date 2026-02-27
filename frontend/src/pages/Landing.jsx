import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  "Role-based dashboards for every department",
  "Task assignment with priority and status tracking",
  "Timeline entries with submit/edit controls",
  "Activity logs for full accountability",
  "Modern UI with dark/light theme support",
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/10 text-white px-4 py-2 text-sm">
                TMS Pro • Team productivity, upgraded
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-white">
                Track work, manage tasks, and move faster with clarity.
              </h1>
              <p className="mt-5 text-white/80 text-lg leading-relaxed">
                A modern, role-based time and task management platform inspired by
                time tracking dashboards and built for real teams.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 text-sm font-semibold hover:bg-slate-100 transition"
                >
                  Create account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 text-white px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-white/85">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-6 shadow-2xl">
                <div className="text-white font-semibold text-lg">
                  What you get
                </div>
                <div className="mt-4 space-y-3 text-white/80 text-sm leading-relaxed">
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                    Clean dashboards with role-aware stats and quick actions.
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                    Tasks, priorities, due dates, assignment, and status updates.
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                    Timeline tracking with submission workflow and audit logs.
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-white/70 text-sm">Start in minutes</div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition"
                  >
                    Open app
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Professional UI"
            text="Modern cards, gradients, hover transitions, and great spacing across devices."
          />
          <Card
            title="Role-based access"
            text="Admin, manager, team leader, and employees all see what they need."
          />
          <Card
            title="Production-ready backend"
            text="JWT auth, clean API structure, validation, and environment-based settings."
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {text}
      </div>
    </div>
  );
}

