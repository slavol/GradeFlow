import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

// ===== TYPES =====
type StudentRow = {
  student_session_id: number;
  email: string;
  score: number;
  completed: boolean;
};

type QuestionAnalytics = {
  question_id: number;
  title: string;
  position: number;
  total_answers: number;
  correct_answers: number;
};

type SessionData = {
  session: {
    id: number;
    session_code: string;
    quiz_id: number;
    status: string;
    created_at: string;
  };
  students: StudentRow[];
  analytics: QuestionAnalytics[];
};

export default function SessionResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD SESSION RESULTS
  // =====================================================
  const loadResults = async () => {
    try {
      const res = await api.get(`/professor/session/${id}/results`);

      setData({
        session: res.data.session,
        students: res.data.students,
        analytics: res.data.analytics,
      });
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea rezultatelor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  // =====================================================
  // EXPORT CSV (Axios + blob = NO 401 error)
  // =====================================================
  const handleCSVDownload = async () => {
    try {
      const res = await api.get(`/professor/session/${id}/export`, {
        responseType: "blob", // <-- IMPORTANT
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `session_${id}_results.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("CSV EXPORT ERROR:", err);
      alert("Nu s-a putut descărca fișierul CSV.");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Se încarcă rezultatele...</div>;

  if (!data)
    return <div className="p-10 text-center">Nu există rezultate pentru această sesiune.</div>;

  const { session, students, analytics } = data;

  const total = students.length;
  const completed = students.filter((s) => s.completed).length;
  const avgScore =
    completed > 0
      ? Math.round(
          students.reduce(
            (acc, cur) => acc + (cur.completed ? cur.score : 0),
            0
          ) / completed
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#f4f6fc] p-8">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rezultate sesiune</h1>

            <p className="text-gray-500 mt-1">
              Quiz #{session.quiz_id} • {total} participanți
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-600">Cod sesiune:</p>
            <p className="font-mono text-xl font-bold">{session.session_code}</p>

            {/* EXPORT CSV BUTTON */}
            <button
              onClick={handleCSVDownload}
              className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <StatCard title="Participanți" value={total} />
          <StatCard title="Finalizate" value={completed} />
          <StatCard title="Scor mediu" value={avgScore} />
        </div>

        {/* STUDENTS TABLE */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10">Studenți</h2>

        <div className="mt-4 overflow-hidden border rounded-xl">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr className="text-left text-gray-700">
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Scor</th>
                <th className="p-3 text-right">Detalii</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.student_session_id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{s.email}</td>

                  <td className="p-3">
                    {s.completed ? (
                      <span className="text-green-600 font-semibold">Finalizat</span>
                    ) : (
                      <span className="text-orange-600 font-semibold">În progres</span>
                    )}
                  </td>

                  <td className="p-3">
                    {s.completed ? (
                      <span className="font-semibold">{s.score} pct</span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-3 text-right">
                    {s.completed && (
                      <button
                        onClick={() =>
                          navigate(`/professor/session/${id}/student/${s.student_session_id}`)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Vezi detalii
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/professor/sessions")}
          className="mt-10 inline-block px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
        >
          ⬅ Înapoi la Istoric
        </button>
      </div>

      {/* ANALYTICS */}
      <div className="max-w-5xl mx-auto mt-10 bg-white shadow-xl p-8 rounded-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Analytics pe întrebări</h2>

        <div className="space-y-4">
          {analytics.map((q) => {
            const rate =
              q.total_answers > 0
                ? Math.round((q.correct_answers / q.total_answers) * 100)
                : 0;

            return (
              <div key={q.question_id} className="p-4 bg-gray-50 rounded-xl border">
                <p className="font-medium text-gray-800">
                  {q.position + 1}. {q.title}
                </p>

                <p className="text-gray-600 mt-1">
                  Corecte: {q.correct_answers}/{q.total_answers} ({rate}%)
                </p>

                <div className="w-full bg-gray-300 h-3 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// SMALL COMPONENT
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl p-6 text-center shadow">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}