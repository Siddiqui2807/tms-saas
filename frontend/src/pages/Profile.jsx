import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    department: user?.department || "",
    phone: user?.phone || "",
    profile_image: user?.profile_image || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      full_name: user?.full_name || "",
      department: user?.department || "",
      phone: user?.phone || "",
      profile_image: user?.profile_image || "",
    });
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.patch("auth/me/", form);
      await refreshMe();
      setMessage("Profile updated");
    } catch (err) {
      setError(JSON.stringify(err?.response?.data || "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage your personal information.
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            {form.profile_image ? (
              <img src={form.profile_image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{user?.full_name}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
              {user?.email} • {user?.role?.replaceAll("_", " ")}
            </div>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Full name"
            value={form.full_name}
            onChange={(v) => setForm((s) => ({ ...s, full_name: v }))}
          />
          <Field
            label="Department"
            value={form.department}
            onChange={(v) => setForm((s) => ({ ...s, department: v }))}
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
          />
          <Field
            label="Profile image URL"
            value={form.profile_image}
            onChange={(v) => setForm((s) => ({ ...s, profile_image: v }))}
          />

          <div className="md:col-span-2">
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {message ? <div className="text-sm text-green-600">{message}</div> : null}
            <button
              disabled={saving}
              className="mt-3 rounded-xl bg-hero-gradient text-white px-5 py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 dark:text-slate-300">{label}</div>
      <input
        className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
