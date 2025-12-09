import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

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

  const loadResults = async () => {
    try {
      const res = await api.get(`/student/session/${sessionId}/results`);

      setScore(res.data.score);
      setTotal(res.data.total);
      setAnswers(res.data.answers);
      setLeaderboard(res.data.leaderboard);
    } catch (err: any) {
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

  if (loading)
    return <div className="p-10 text-center">Se încarcă rezultatele...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* BACK BUTTON */}
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mb-6 px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition"
        >
          ← Înapoi la Dashboard
        </button>
      </div>

      {/* SCORE CARD */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 mb-10 text-center border">
        <h1 className="text-3xl font-bold mb-4">🎉 Rezultatele tale</h1>

        <p className="text-xl text-gray-700 mb-4">Ai răspuns corect la:</p>

        <div className="text-5xl font-extrabold text-blue-600 mb-2">
          {score} / {total}
        </div>

        <div className="text-lg text-gray-600">
          {Math.round((score / total) * 100)}% scor final
        </div>
      </div>

      {/* DETAILED ANSWERS */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 border mb-10">
        <h2 className="text-2xl font-bold mb-6">📘 Rezultate detaliate</h2>

        <div className="space-y-6">
          {answers.map((a, index) => {
            const correct = a.is_correct;

            return (
              <div
                key={a.question_id}
                className={`p-4 rounded-xl border ${
                  correct
                    ? "bg-green-100 border-green-400"
                    : "bg-red-100 border-red-400"
                }`}
              >
                <p className="font-semibold mb-2">
                  {index + 1}. {a.question_text}
                </p>

                <p className="text-sm">
                  <strong>Răspunsul tău:</strong>{" "}
                  {a.selected_answers?.length
                    ? a.selected_answers.map((ans) => ans.text).join(", ")
                    : "Niciun răspuns"}
                </p>

                <p className="text-sm">
                  <strong>Răspuns corect:</strong>{" "}
                  {a.correct_answers.map((ans) => ans.text).join(", ")}
                </p>

                <p
                  className={`mt-2 font-bold ${
                    correct ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {correct ? "✔ Corect" : "✘ Greșit"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 border">
        <h2 className="text-2xl font-bold mb-6">🏆 Clasament</h2>

        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.email}
              className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border"
            >
              <span className="font-semibold">
                #{i + 1} — {entry.email}
              </span>

              <span className="text-blue-600 font-bold">
                {entry.score} puncte
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}