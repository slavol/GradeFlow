import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import StudentNavbar from "../../components/StudentNavbar";

/* ================= TYPES ================= */
interface AnswerDetails {
  question_id: number;
  question_text: string;
  correct_answers: { id: number; text: string }[];
  selected_answers: { id: number; text: string }[];
  is_correct: boolean;
}

interface LeaderboardEntry {
  email: string;
  score: number;
  completed: boolean;
  finished_at: string | null;
}

/* ================= COMPONENT ================= */
export default function StudentResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answers, setAnswers] = useState<AnswerDetails[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD RESULTS ================= */
  const loadResults = async () => {
    try {
      const res = await api.get(`/student/session/${sessionId}/results`);

      setScore(res.data.score ?? 0);
      setTotal(res.data.total ?? 0);

      // 🔐 NORMALIZARE – FOARTE IMPORTANT
      const normalizedAnswers: AnswerDetails[] = (res.data.answers || []).map(
        (a: any) => ({
          question_id: a.question_id,
          question_text: a.question_text || "",
          correct_answers: Array.isArray(a.correct_answers)
            ? a.correct_answers
            : [],
          selected_answers: Array.isArray(a.selected_answers)
            ? a.selected_answers
            : [],
          is_correct: Boolean(a.is_correct),
        })
      );

      setAnswers(normalizedAnswers);
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error("RESULTS LOAD ERROR:", err);
      alert("Nu s-au putut încărca rezultatele.");
      navigate("/student/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <StudentNavbar />
        <div className="p-10 text-center">Se încarcă rezultatele…</div>
      </div>
    );
  }

  const percentage =
    total > 0 ? Math.round((score / total) * 100) : 0;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* SCORE */}
        <div className="bg-white rounded-2xl shadow p-8 border text-center">
          <h1 className="text-3xl font-bold mb-4">🎉 Rezultatele tale</h1>

          <div className="text-6xl font-extrabold text-purple-600 mb-2">
            {score} / {total}
          </div>

          <p className="text-lg text-gray-600">
            {percentage}% răspunsuri corecte
          </p>
        </div>

        {/* ANSWERS */}
        <div className="bg-white rounded-2xl shadow p-8 border">
          <h2 className="text-2xl font-bold mb-6">
            📘 Răspunsuri detaliate
          </h2>

          {answers.length === 0 ? (
            <p className="text-gray-500 text-center">
              Nu există răspunsuri disponibile.
            </p>
          ) : (
            <div className="space-y-6">
              {answers.map((a, index) => (
                <div
                  key={a.question_id}
                  className={`p-5 rounded-xl border ${
                    a.is_correct
                      ? "bg-green-50 border-green-400"
                      : "bg-red-50 border-red-400"
                  }`}
                >
                  <p className="font-semibold mb-2">
                    {index + 1}. {a.question_text}
                  </p>

                  <p className="text-sm">
                    <strong>Răspunsul tău:</strong>{" "}
                    {a.selected_answers.length > 0
                      ? a.selected_answers.map((x) => x.text).join(", ")
                      : "—"}
                  </p>

                  <p className="text-sm">
                    <strong>Răspuns corect:</strong>{" "}
                    {a.correct_answers.length > 0
                      ? a.correct_answers.map((x) => x.text).join(", ")
                      : "—"}
                  </p>

                  <p
                    className={`mt-2 font-bold ${
                      a.is_correct
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {a.is_correct ? "✔ Corect" : "✘ Greșit"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEADERBOARD */}
        <div className="bg-white rounded-2xl shadow p-8 border">
          <h2 className="text-2xl font-bold mb-6">🏆 Clasament</h2>

          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center">
              Clasamentul nu este disponibil.
            </p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <div
                  key={`${entry.email}-${i}`}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border"
                >
                  <span className="font-semibold">
                    #{i + 1} — {entry.email}
                  </span>

                  <span className="text-purple-600 font-bold">
                    {entry.score} pct
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BACK */}
        <div className="text-center">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
          >
            ⬅ Înapoi la Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}