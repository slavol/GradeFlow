import { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

interface Quiz {
  id: number;
  title: string;
  description: string;
  join_code: string;
  time_limit: number;
  created_at: string;
}

interface Stats {
  total_quizzes: number;
  total_questions: number;
  total_students: number;
}

export default function ProfessorDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // LOAD QUIZZES LIST
  const loadQuizzes = async () => {
    try {
      const res = await api.get("/professor/list");
      setQuizzes(res.data);
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // LOAD DASHBOARD STATS
  const loadStats = async () => {
    try {
      const res = await api.get("/professor/stats");
      setStats(res.data);
    } catch (err) {
      console.error("STATS ERROR:", err);
    }
  };

  useEffect(() => {
    Promise.all([loadQuizzes(), loadStats()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const deleteQuiz = async (id: number) => {
    if (!confirm("Sigur vrei să ștergi acest quiz?")) return;

    try {
      await api.delete(`/professor/delete/${id}`);
      loadQuizzes();
      loadStats();
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergere");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Professor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Vizualizează și gestionează quiz-urile tale.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/professor/create-quiz")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            + Creează un Quiz
          </button>

          <button
            onClick={logout}
            className="px-6 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Quiz-uri create" value={stats?.total_quizzes ?? "—"} />
        <StatCard title="Studenți evaluați" value={stats?.total_students ?? "—"} />
        <StatCard title="Întrebări totale" value={stats?.total_questions ?? "—"} />
      </div>

      {/* QUIZ LIST */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Quiz-urile tale</h2>

        {loading ? (
          <p className="text-gray-600">Se încarcă...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-600">Nu ai creat încă niciun quiz.</p>
        ) : (
          <table className="w-full text-left border-collapse mt-4">
            <thead>
              <tr className="text-gray-700 border-b">
                <th className="p-3">Titlu</th>
                <th className="p-3">Cod Join</th>
                <th className="p-3">Timp</th>
                <th className="p-3">Creat la</th>
                <th className="p-3 text-right">Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{q.title}</td>
                  <td className="p-3 font-mono">{q.join_code}</td>
                  <td className="p-3">{q.time_limit} min</td>
                  <td className="p-3">
                    {new Date(q.created_at).toLocaleString()}
                  </td>

                  <td className="p-3 flex gap-3 justify-end">
                    <button
                      onClick={() => navigate(`/professor/quiz/${q.id}`)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Vezi
                    </button>

                    <button
                      onClick={() => navigate(`/professor/edit-quiz/${q.id}`)}
                      className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                    >
                      Editează
                    </button>

                    <button
                      onClick={() => deleteQuiz(q.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={() => navigate("/professor/sessions")}
        className="block mt-6 px-5 py-3 bg-purple-600 text-white rounded-xl text-center hover:bg-purple-700"
      >
        📊 Vezi sesiuni susținute
      </button>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}