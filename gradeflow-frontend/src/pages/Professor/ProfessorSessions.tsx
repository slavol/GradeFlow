import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import ProfessorNavbar from "../../components/ProfessorNavbar";

interface Session {
  id: number;
  session_code: string;
  status: "active" | "closed";
  created_at: string;
}

export default function ProfessorSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSessions = async () => {
    try {
      const res = await api.get("/professor/sessions/live");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea sesiunilor live");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">📡 Sesiuni live active</h1>

        {loading ? (
          <p className="text-gray-600">Se încarcă…</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-600">Nu există sesiuni active.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">
                    Cod sesiune:{" "}
                    <span className="font-mono">{s.session_code}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Creată la {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/professor/session/${s.id}`)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Intră
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}