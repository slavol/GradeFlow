import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";
import StudentNavbar from "../../components/StudentNavbar";

interface HistoryItem {
  id: number; 
  score: number;
  completed: boolean;
  finished_at?: string;
  quiz_sessions: {
    id: number; 
    quizzes: {
      title: string;
    };
  };
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await api.get("/student/session/history");
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("HISTORY LOAD ERROR:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <StudentNavbar />

      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Intră într-un quiz sau verifică rezultatele tale anterioare.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">🚀 Alătură-te unui Quiz</h2>
          <p className="text-gray-600 mb-6">
            Introdu codul primit de la profesor pentru a începe.
          </p>

          <Link
            to="/student/join"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-semibold"
          >
            Join Quiz
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border">
          <h2 className="text-2xl font-bold mb-6">
            📘 Istoric rezultate
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Se încarcă...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500">
              Nu ai participat încă la niciun quiz.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="p-6 bg-gray-50 rounded-2xl border shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {h.quiz_sessions.quizzes.title}
                    </h3>

                    <p className="text-sm text-gray-600 mt-2">
                      Scor:{" "}
                      <span className="font-semibold">
                        {h.completed ? `${h.score} pct` : "—"}
                      </span>
                    </p>

                    <p className="text-sm mt-1">
                      {h.completed ? (
                        <span className="text-green-600 font-semibold">
                          ✔ Finalizat
                        </span>
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          ⏳ În desfășurare
                        </span>
                      )}
                    </p>

                    {h.finished_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Finalizat la{" "}
                        {new Date(h.finished_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {h.completed && (
                    <button
                      onClick={() =>
                        navigate(
                          `/student/session/${h.quiz_sessions.id}/results`
                        )
                      }
                      className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      Vezi rezultatele
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}