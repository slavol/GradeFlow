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

export default function ProfessorDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const loadQuizzes = async () => {
    try {
      // 🔹 ENDPOINT CORECT
      const res = await api.get("/professor/list");
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteQuiz = async (id: number) => {
    if (!confirm("Sigur vrei să ștergi acest quiz?")) return;
    try {
      // 🔹 ENDPOINT CORECT
      await api.delete(`/professor/delete/${id}`);
      loadQuizzes();
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergere");
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const navigate = useNavigate();

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
            Vizualizează quiz-urile tale, gestionează studenții și creează noi evaluări.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Creează Quiz */}
          <a
            href="/professor/create-quiz"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            + Creează un Quiz
          </a>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Quiz-uri create" value={quizzes.length} />
        <StatCard title="Studenți evaluați" value="—" />
        <StatCard title="Întrebări totale" value={calculateTotalQuestions(quizzes)} />
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Quiz-urile tale</h2>

        {quizzes.length === 0 ? (
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
                  <td className="p-3">{new Date(q.created_at).toLocaleString()}</td>

                  <td className="p-3 flex gap-3 justify-end">
                    <button
                      onClick={() =>
                        (window.location.href = `/professor/quiz/${q.id}`)
                      }
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Vezi
                    </button>

                    <button
                      onClick={() =>
                        (window.location.href = `/professor/edit-quiz/${q.id}`)
                      }
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
      <a
        href="/professor/sessions"
        className="block mt-6 px-5 py-3 bg-purple-600 text-white rounded-xl text-center hover:bg-purple-700"
      >
        📊 Vezi sesiuni susținute
      </a>
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

function calculateTotalQuestions(_quizzes: any[]) {
  // deocamdată placeholder – îl vom lega la un endpoint real mai târziu
  return "—";
}