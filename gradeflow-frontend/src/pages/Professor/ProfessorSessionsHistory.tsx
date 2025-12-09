import { useEffect, useState } from "react";
import api from "../../api/api";

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

  // ============================================================
  // LOAD HISTORY
  // ============================================================
  const load = async () => {
    try {
      const res = await api.get("/professor/sessions/history");

      console.log("HISTORY RESPONSE:", res.data);

      // Acceptă orice format: array simplu sau { sessions: [...] }
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.sessions)
        ? res.data.sessions
        : [];

      setSessions(data);
    } catch (err) {
      console.error("HISTORY ERROR:", err);
      setSessions([]); // evită crash .map
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ============================================================
  // DELETE SESSION
  // ============================================================
  const deleteSession = async (sessionId: number) => {
    if (!confirm("Sigur vrei să ștergi această sesiune?")) return;

    try {
      await api.delete(`/professor/session/${sessionId}/delete`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergerea sesiunii.");
    }
  };

  // ============================================================
  // UI STATES
  // ============================================================
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-700">
        Se încarcă istoricul sesiunilor...
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6fc] p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Nu există sesiuni susținute încă.
          </h1>
          <p className="text-gray-600 mb-6">
            Creează un quiz și pornește o sesiune live pentru a apărea aici.
          </p>

          <a
            href="/professor/dashboard"
            className="inline-block px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            ⬅ Înapoi la Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#f4f6fc] p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Istoric sesiuni</h1>
            <p className="text-gray-500 mt-1">
              Vizionează toate sesiunile trecute și accesează rezultatele lor.
            </p>
          </div>
        </div>

        <div className="overflow-hidden border rounded-xl bg-white">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr className="text-left text-gray-700">
                <th className="p-3">Quiz</th>
                <th className="p-3">Cod sesiune</th>
                <th className="p-3">Status</th>
                <th className="p-3">Creat la</th>
                <th className="p-3 text-right">Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition">

                  {/* QUIZ TITLE */}
                  <td className="p-3">
                    {s.quiz_title || `Quiz #${s.quiz_id}`}
                  </td>

                  {/* SESSION CODE */}
                  <td className="p-3 font-mono">{s.session_code}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    {s.status === "active" ? (
                      <span className="text-green-600 font-semibold">Activă</span>
                    ) : (
                      <span className="text-gray-600 font-semibold">Închisă</span>
                    )}
                  </td>

                  {/* CREATED AT */}
                  <td className="p-3">
                    {new Date(s.created_at).toLocaleString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">

                      <a
                        href={`/professor/session/${s.id}/results`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Rezultate
                      </a>

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

        <a
          href="/professor/dashboard"
          className="mt-8 inline-block px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
        >
          ⬅ Înapoi la Dashboard
        </a>
      </div>
    </div>
  );
}