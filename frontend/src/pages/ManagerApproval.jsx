import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ManagerApproval() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedEntries();
  }, []);

  const fetchSubmittedEntries = async () => {
    try {
      const response = await api.get("reports/submitted/"); // ✅ FIXED
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching submitted entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      await api.patch(`time-entries/${id}/approve/`, {
        status: decision,
      });

      alert(`Entry ${decision.toLowerCase()} successfully`);
      fetchSubmittedEntries();
    } catch (error) {
      alert(error.response?.data?.error || "Action failed");
    }
  };

  if (loading) {
    return <div>Loading submitted entries...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Submitted Time Entries
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Hours</th>
              <th className="px-4 py-2 border">Task</th>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="text-center">
                <td className="px-4 py-2 border">{entry.date}</td>
                <td className="px-4 py-2 border">{entry.hours}</td>
                <td className="px-4 py-2 border">{entry.task_description}</td>
                <td className="px-4 py-2 border">{entry.user}</td>
                <td className="px-4 py-2 border space-x-2">
                  <button
                    onClick={() => handleDecision(entry.id, "APPROVED")}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleDecision(entry.id, "REJECTED")}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}