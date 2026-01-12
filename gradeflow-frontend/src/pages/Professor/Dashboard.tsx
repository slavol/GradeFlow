import { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import ProfessorNavbar from "../../components/ProfessorNavbar";

interface Quiz {
  id: number;
  title: string;
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

  const loadQuizzes = async () => {
    const res = await api.get("/professor/list");
    setQuizzes(res.data);
  };

  const loadStats = async () => {
    const res = await api.get("/professor/stats");
    setStats(res.data);
  };

  useEffect(() => {
    Promise.all([loadQuizzes(), loadStats()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const deleteQuiz = async (id: number) => {
    if (!confirm("Sigur vrei să ștergi acest quiz?")) return;
    await api.delete(`/professor/delete/${id}`);
    loadQuizzes();
    loadStats();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Professor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Gestionează quiz-uri și sesiuni live.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate("/professor/create-quiz")}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              ➕ Creează Quiz
            </button>

            <button
              onClick={() => navigate("/professor/sessions/live")}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
            >
              🔴 Sesiuni live
            </button>

            <button
              onClick={() => navigate("/professor/sessions/history")}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
            >
              📜 Istoric sesiuni
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Quiz-uri create" value={stats?.total_quizzes ?? "—"} />
          <StatCard title="Studenți evaluați" value={stats?.total_students ?? "—"} />
          <StatCard title="Întrebări totale" value={stats?.total_questions ?? "—"} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border">
          <h2 className="text-2xl font-semibold mb-6">Quiz-urile tale</h2>

          {loading ? (
            <p className="text-gray-600">Se încarcă...</p>
          ) : quizzes.length === 0 ? (
            <p className="text-gray-600">Nu ai creat încă niciun quiz.</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-gray-700">
                      <th className="p-3 text-left">Titlu</th>
                      <th className="p-3 text-left">Cod</th>
                      <th className="p-3 text-left">Timp</th>
                      <th className="p-3 text-left">Creat</th>
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
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <ActionButtons
                              onView={() => navigate(`/professor/quiz/${q.id}`)}
                              onEdit={() => navigate(`/professor/edit-quiz/${q.id}`)}
                              onDelete={() => deleteQuiz(q.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="border rounded-xl p-4 shadow-sm bg-white"
                  >
                    <h3 className="font-semibold text-lg">{q.title}</h3>

                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p><strong>Cod:</strong> {q.join_code}</p>
                      <p><strong>Timp:</strong> {q.time_limit} min</p>
                      <p>
                        <strong>Creat:</strong>{" "}
                        {new Date(q.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-4">
                      <ActionButtons
                        vertical
                        onView={() => navigate(`/professor/quiz/${q.id}`)}
                        onEdit={() => navigate(`/professor/edit-quiz/${q.id}`)}
                        onDelete={() => deleteQuiz(q.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}

function ActionButtons({
  onView,
  onEdit,
  onDelete,
  vertical = false,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  vertical?: boolean;
}) {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition text-center";

  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-row"} gap-2`}>
      <button onClick={onView} className={`${base} bg-gray-200 hover:bg-gray-300`}>
        Vezi
      </button>
      <button
        onClick={onEdit}
        className={`${base} bg-yellow-400 text-white hover:bg-yellow-500`}
      >
        Editează
      </button>
      <button
        onClick={onDelete}
        className={`${base} bg-red-500 text-white hover:bg-red-600`}
      >
        Șterge
      </button>
    </div>
  );
}