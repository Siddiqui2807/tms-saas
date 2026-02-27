import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TimeEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    task_description: "",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get("time-entries/");
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await api.post("time-entries/", formData);

      alert("Entry created successfully");

      setFormData({ date: "", hours: "", task_description: "" });
      fetchEntries();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Creation failed"
      );
    }
  };

  const handleSubmitEntry = async (id) => {
    try {
      await api.patch(`time-entries/${id}/submit/`, {});

      alert("Time entry submitted successfully");
      fetchEntries();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Submission failed"
      );
    }
  };

  if (loading) {
    return <div>Loading time entries...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Create Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Time Entry</h2>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />

          <input
            type="number"
            step="0.5"
            name="hours"
            placeholder="Hours"
            value={formData.hours}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />

          <input
            type="text"
            name="task_description"
            placeholder="Task Description"
            value={formData.task_description}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 md:col-span-3"
          >
            Add Entry
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">My Time Entries</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Hours</th>
                <th className="px-4 py-2 border">Task</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="text-center">
                  <td className="px-4 py-2 border">{entry.date}</td>
                  <td className="px-4 py-2 border">{entry.hours}</td>
                  <td className="px-4 py-2 border">
                    {entry.task_description}
                  </td>

                  <td className="px-4 py-2 border">
                    <StatusBadge status={entry.status} />
                  </td>

                  <td className="px-4 py-2 border">
                    {entry.status === "DRAFT" && (
                      <button
                        onClick={() => handleSubmitEntry(entry.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const base = "px-2 py-1 rounded text-sm font-medium";

  const colors = {
    DRAFT: "bg-gray-200 text-gray-800",
    SUBMITTED: "bg-yellow-200 text-yellow-800",
    APPROVED: "bg-green-200 text-green-800",
    REJECTED: "bg-red-200 text-red-800",
  };

  return (
    <span className={`${base} ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}