import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

// === TYPES ===
type StudentResult = {
  id: number;
  email: string;
  completed: boolean;
  score: number;
};

type QuestionAnalytics = {
  question_id: number;
  title: string;
  correct_answers: number;
  total_answers: number;
};

type SessionInfo = {
  id: number;
  session_code: string;
  quiz_title: string;
};

type SessionData = {
  session: SessionInfo;
  students: StudentResult[];
  analytics: QuestionAnalytics[];
};

// === COMPONENT ===
export default function SessionResults() {
  const { id } = useParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    try {
      const res = await api.get(`/professor/session/${id}/results`);
      console.log("RESULTS:", res.data);
      setSessionData(res.data);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea rezultatelor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Se încarcă rezultatele...</div>;

  if (!sessionData)
    return <div className="p-10 text-center">Nu există date pentru această sesiune.</div>;

  const { session, students, analytics } = sessionData;

  // === CALCULATE SUMMARY ===
  const total = students.length;
  const completed = students.filter((s: StudentResult) => s.completed).length;

  const avgScore =
    completed > 0
      ? Math.round(
          students
            .filter((s: StudentResult) => s.completed)
            .reduce((acc: number, cur: StudentResult) => acc + cur.score, 0) /
            completed
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#f4f6fc] p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Rezultate sesiune</h1>

          <div className="text-right">
            <p className="text-gray-600">Cod sesiune:</p>
            <p className="font-mono text-xl font-bold">{session.session_code}</p>
          </div>
        </div>

        <p className="text-gray-500 mt-1">
          {session.quiz_title} — {total} participanți
        </p>

        {/* STATISTICS */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <StatCard title="Participanți" value={total} />
          <StatCard title="Finalizate" value={completed} />
          <StatCard title="Scor mediu" value={avgScore} />
        </div>

        {/* STUDENT LIST */}
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
              {students.map((s: StudentResult) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{s.email}</td>

                  <td className="p-3">
                    {s.completed ? (
                      <span className="text-green-600 font-semibold">Finalizat</span>
                    ) : (
                      <span className="text-orange-500 font-semibold">În progres</span>
                    )}
                  </td>

                  <td className="p-3 font-semibold">
                    {s.completed ? `${s.score} pct` : "—"}
                  </td>

                  <td className="p-3 text-right">
                    {s.completed && (
                      <a
                        href={`/professor/session/${id}/student/${s.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Vezi detalii
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BACK BUTTON */}
        <a
          href="/professor/dashboard"
          className="mt-10 inline-block px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
        >
          ⬅ Înapoi la Dashboard
        </a>
      </div>

      {/* QUESTION ANALYTICS */}
      <div className="max-w-5xl mx-auto mt-10 bg-white shadow-xl p-8 rounded-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Analytics pe întrebări</h2>

        <div className="space-y-4">
          {analytics.map((a: QuestionAnalytics) => {
            const rate =
              a.total_answers > 0
                ? Math.round((a.correct_answers / a.total_answers) * 100)
                : 0;

            return (
              <div key={a.question_id} className="p-4 bg-gray-50 rounded-lg border">
                <p className="font-medium text-gray-800">{a.title}</p>

                <p className="text-gray-600 mt-1">
                  Răspunsuri corecte: {a.correct_answers}/{a.total_answers} ({rate}%)
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === SMALL COMPONENT ===
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl p-6 text-center shadow">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}