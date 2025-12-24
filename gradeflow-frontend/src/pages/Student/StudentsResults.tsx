import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import StudentNavbar from "../../components/StudentNavbar";

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

export default function StudentResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answers, setAnswers] = useState<AnswerDetails[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================
  // LOAD RESULTS
  // =====================================
  const loadResults = async () => {
    try {
      const res = await api.get(`/student/session/${sessionId}/results`);

      setScore(res.data.score);
      setTotal(res.data.total);
      setAnswers(res.data.answers);
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error(err);
      alert("Nu s-au putut încărca rezultatele.");
      navigate("/student/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <StudentNavbar />
        <div className="p-10 text-center">Se încarcă rezultatele...</div>
      </div>
    );
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* SCORE CARD */}
        <div className="bg-white rounded-2xl shadow p-8 border text-center">
          <h1 className="text-3xl font-bold mb-4">🎉 Rezultatele tale</h1>

          <div className="text-6xl font-extrabold text-blue-600 mb-2">
            {score} / {total}
          </div>

          <p className="text-lg text-gray-600">
            {percentage}% răspunsuri corecte
          </p>
        </div>

        {/* ANSWERS */}
        <div className="bg-white rounded-2xl shadow p-8 border">
          <h2 className="text-2xl font-bold mb-6">📘 Răspunsuri detaliate</h2>

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
                  {a.selected_answers.length
                    ? a.selected_answers.map((x) => x.text).join(", ")
                    : "—"}
                </p>

                <p className="text-sm">
                  <strong>Răspuns corect:</strong>{" "}
                  {a.correct_answers.map((x) => x.text).join(", ")}
                </p>

                <p
                  className={`mt-2 font-bold ${
                    a.is_correct ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {a.is_correct ? "✔ Corect" : "✘ Greșit"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="bg-white rounded-2xl shadow p-8 border">
          <h2 className="text-2xl font-bold mb-6">🏆 Clasament</h2>

          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.email}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border"
              >
                <span className="font-semibold">
                  #{i + 1} — {entry.email}
                </span>

                <span className="text-blue-600 font-bold">
                  {entry.score} pct
                </span>
              </div>
            ))}
          </div>
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