import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================================
  // LOAD HISTORY FROM BACKEND
  // =============================================
  const loadHistory = async () => {
    try {
      const res = await api.get("/student/session/history");
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("HISTORY LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-xl border border-gray-200">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-gray-900 text-center">
          Student Dashboard
        </h1>

        <p className="text-gray-600 text-center mt-2">
          Bine ai venit! Poți intra într-o sesiune de quiz folosind codul oferit de profesor.
        </p>

        {/* JOIN BUTTON */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/student/join"
            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl shadow hover:bg-blue-700 transition"
          >
            🚀 Join Quiz
          </Link>
        </div>

        {/* HISTORY SECTION */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            📘 Istoricul Rezultatelor
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Se încarcă...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500">
              Nu ai participat la niciun quiz încă.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div
                  key={h.student_session_id}
                  className="p-4 bg-gray-50 border rounded-xl shadow-sm"
                >
                  <p className="font-semibold text-lg">{h.quiz_title}</p>

                  <p className="text-sm text-gray-600">
                    Scor: <strong>{h.score}</strong>
                  </p>

                  <p className="text-sm text-gray-600">
                    {h.completed ? "✔ Finalizat" : "⏳ În desfășurare"}
                  </p>

                  {h.finished_at && (
                    <p className="text-xs text-gray-500">
                      Terminare: {new Date(h.finished_at).toLocaleString()}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/student/session/${h.session_id}/results`)
                    }
                    className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Vezi rezultatele
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}