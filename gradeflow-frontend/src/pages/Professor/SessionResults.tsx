import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import ProfessorNavbar from "../../components/ProfessorNavbar";

/* ================= TYPES ================= */

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

/* ================= COMPONENT ================= */

export default function SessionResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD RESULTS ================= */

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
  }, [id]);

  /* ================= EXPORT CSV ================= */

  const handleCSVDownload = async () => {
    try {
      const res = await api.get(`/professor/session/${id}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `session_${id}_results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut descărca CSV.");
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />
        <div className="p-10 text-center text-gray-600">
          Se încarcă rezultatele…
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />
        <div className="p-10 text-center text-gray-600">
          Nu există rezultate pentru această sesiune.
        </div>
      </div>
    );
  }

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

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rezultate sesiune
            </h1>
            <p className="text-gray-600 mt-1">
              Quiz #{session.quiz_id} • {total} participanți
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-gray-600">Cod sesiune</p>
            <p className="font-mono text-xl font-bold">
              {session.session_code}
            </p>

            <button
              onClick={handleCSVDownload}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard title="Participanți" value={total} />
          <StatCard title="Finalizate" value={completed} />
          <StatCard title="Scor mediu" value={avgScore} />
        </div>

        {/* STUDENTS */}
        <div className="bg-white rounded-2xl shadow p-6 border mb-10">
          <h2 className="text-2xl font-semibold mb-6">Studenți</h2>

          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Scor</th>
                  <th className="p-3 text-right">Detalii</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.student_session_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{s.email}</td>

                    <td className="p-3">
                      {s.completed ? (
                        <span className="text-green-600 font-semibold">Finalizat</span>
                      ) : (
                        <span className="text-orange-600 font-semibold">În progres</span>
                      )}
                    </td>

                    <td className="p-3">
                      {s.completed ? `${s.score} pct` : "—"}
                    </td>

                    <td className="p-3 text-right">
                      {s.completed && (
                        <button
                          onClick={() =>
                            navigate(
                              `/professor/session/${id}/student/${s.student_session_id}`
                            )
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

          {/* MOBILE */}
          <div className="md:hidden space-y-4">
            {students.map((s) => (
              <div
                key={s.student_session_id}
                className="border rounded-xl p-4 shadow-sm"
              >
                <p className="font-semibold">{s.email}</p>

                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={
                      s.completed ? "text-green-600" : "text-orange-600"
                    }
                  >
                    {s.completed ? "Finalizat" : "În progres"}
                  </span>
                </p>

                <p className="text-sm">
                  Scor: {s.completed ? `${s.score} pct` : "—"}
                </p>

                {s.completed && (
                  <button
                    onClick={() =>
                      navigate(
                        `/professor/session/${id}/student/${s.student_session_id}`
                      )
                    }
                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Vezi detalii
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="bg-white rounded-2xl shadow p-6 border mb-10">
          <h2 className="text-2xl font-semibold mb-6">
            Analytics pe întrebări
          </h2>

          <div className="space-y-4">
            {analytics.map((q) => {
              const rate =
                q.total_answers > 0
                  ? Math.round(
                      (q.correct_answers / q.total_answers) * 100
                    )
                  : 0;

              return (
                <div
                  key={q.question_id}
                  className="p-4 bg-gray-50 rounded-xl border"
                >
                  <p className="font-medium">
                    {q.position + 1}. {q.title}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Corecte: {q.correct_answers}/{q.total_answers} ({rate}%)
                  </p>

                  <div className="w-full bg-gray-300 h-3 rounded-full mt-2">
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

        {/* BACK */}
        <button
          onClick={() => navigate("/professor/sessions/history")}
          className="px-6 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
        >
          ⬅ Înapoi la Istoric
        </button>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border text-center">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}