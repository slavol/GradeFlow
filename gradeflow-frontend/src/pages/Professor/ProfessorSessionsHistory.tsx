import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import ProfessorNavbar from "../../components/ProfessorNavbar";

interface SessionHistoryItem {
  id: number;
  quiz_id: number;
  quiz_title?: string | null;
  session_code: string;
  status: "active" | "closed";
  created_at: string;
}

export default function ProfessorSessionsHistory() {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // =========================
  // LOAD HISTORY
  // =========================
  const load = async () => {
    try {
      const res = await api.get("/professor/sessions/history");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.sessions)
        ? res.data.sessions
        : [];

      setSessions(data);
    } catch (err) {
      console.error("HISTORY ERROR:", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // DELETE SESSION
  // =========================
  const deleteSession = async (sessionId: number) => {
    if (!confirm("Sigur vrei să ștergi această sesiune?")) return;

    try {
      await api.delete(`/professor/session/${sessionId}/delete`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      alert("Eroare la ștergerea sesiunii.");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />
        <div className="p-10 text-center text-gray-600">
          Se încarcă istoricul sesiunilor…
        </div>
      </div>
    );
  }

  // =========================
  // EMPTY STATE
  // =========================
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Nu există sesiuni susținute
          </h1>
          <p className="text-gray-600 mb-6">
            După ce închizi o sesiune live, aceasta va apărea aici.
          </p>

          <button
            onClick={() => navigate("/professor/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            ⬅ Înapoi la Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Istoric sesiuni
          </h1>
          <p className="text-gray-600 mt-1">
            Toate sesiunile închise și rezultatele lor.
          </p>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white rounded-2xl shadow border overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr className="text-gray-700 text-left">
                <th className="p-4">Quiz</th>
                <th className="p-4">Cod sesiune</th>
                <th className="p-4">Status</th>
                <th className="p-4">Creat la</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {s.quiz_title || `Quiz #${s.quiz_id}`}
                  </td>

                  <td className="p-4 font-mono">
                    {s.session_code}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={s.status} />
                  </td>

                  <td className="p-4">
                    {new Date(s.created_at).toLocaleString()}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/professor/session/${s.id}/results`)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Rezultate
                      </button>

                      <button
                        onClick={() => deleteSession(s.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow border p-4"
            >
              <h3 className="font-semibold text-lg">
                {s.quiz_title || `Quiz #${s.quiz_id}`}
              </h3>

              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <p>
                  <strong>Cod:</strong>{" "}
                  <span className="font-mono">{s.session_code}</span>
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <StatusBadge status={s.status} inline />
                </p>

                <p>
                  <strong>Creat:</strong>{" "}
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() =>
                    navigate(`/professor/session/${s.id}/results`)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Rezultate
                </button>

                <button
                  onClick={() => deleteSession(s.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/professor/dashboard")}
          className="mt-10 px-6 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
        >
          ⬅ Înapoi la Dashboard
        </button>
      </div>
    </div>
  );
}

// =========================
// STATUS BADGE
// =========================
function StatusBadge({
  status,
  inline = false,
}: {
  status: "active" | "closed";
  inline?: boolean;
}) {
  const base =
    "px-3 py-1 rounded-full text-sm font-semibold";

  const cls =
    status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700";

  return (
    <span className={`${base} ${cls} ${inline ? "" : ""}`}>
      {status === "active" ? "Activă" : "Închisă"}
    </span>
  );
}