import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import StudentNavbar from "../../components/StudentNavbar";

import {
  ArrowLeftIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

interface AnswerDetails {
  question_id: number;
  question_text: string;
  correct_answers: { id: number; text: string }[];
  selected_answers: { id: number; text: string }[];
  is_correct: boolean;
  explanation_text?: string | null;
  explanation_created_at?: string | null;
}

interface LeaderboardEntry {
  email: string;
  score: number;
  completed: boolean;
  finished_at: string | null;
}

type ExplainState = {
  open: boolean;
  loading: boolean;
  text: string | null;
  error: string | null;
  createdAt?: string | null;
};

export default function StudentResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answers, setAnswers] = useState<AnswerDetails[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [explain, setExplain] = useState<Record<number, ExplainState>>({});

  const loadResults = async () => {
    try {
      const res = await api.get(`/student/session/${sessionId}/results`);

      setScore(res.data.score ?? 0);
      setTotal(res.data.total ?? 0);

      const normalizedAnswers: AnswerDetails[] = (res.data.answers || []).map((a: any) => ({
        question_id: a.question_id,
        question_text: a.question_text || "",
        correct_answers: Array.isArray(a.correct_answers) ? a.correct_answers : [],
        selected_answers: Array.isArray(a.selected_answers) ? a.selected_answers : [],
        is_correct: Boolean(a.is_correct),

        explanation_text: a.explanation_text ?? null,
        explanation_created_at: a.explanation_created_at ?? null,
      }));

      setAnswers(normalizedAnswers);
      setLeaderboard(res.data.leaderboard || []);

      const init: Record<number, ExplainState> = {};
      for (const a of normalizedAnswers) {
        const cachedText =
          typeof a.explanation_text === "string" && a.explanation_text.trim().length > 0
            ? a.explanation_text.trim()
            : null;

        init[a.question_id] = {
          open: false,
          loading: false,
          text: cachedText,
          error: null,
          createdAt: a.explanation_created_at ?? null,
        };
      }
      setExplain(init);
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

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const wrongCount = useMemo(() => answers.filter((a) => !a.is_correct).length, [answers]);

  const toggleExplain = (questionId: number) => {
    setExplain((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { open: false, loading: false, text: null, error: null }),
        open: !(prev[questionId]?.open ?? false),
      },
    }));
  };

  const generateExplanation = async (questionId: number) => {
    if (!sessionId) return;

    setExplain((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { open: true, loading: false, text: null, error: null }),
        open: true,
        loading: true,
        error: null,
      },
    }));

    try {
      const res = await api.post(
        `/student/session/${sessionId}/explanation/${questionId}`,
        {
          sessionId: Number(sessionId),
          questionId: Number(questionId),
        }
      );

      const text = String(res.data?.explanation ?? "").trim();
      if (!text) throw new Error("AI nu a returnat o explicație.");

      setExplain((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId]),
          open: true,
          loading: false,
          text,
          error: null,
          createdAt: res.data?.explanation_created_at ?? prev[questionId]?.createdAt ?? null,
        },
      }));

      setAnswers((prev) =>
        prev.map((a) =>
          a.question_id === questionId
            ? {
                ...a,
                explanation_text: text,
                explanation_created_at: res.data?.explanation_created_at ?? a.explanation_created_at ?? null,
              }
            : a
        )
      );
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Eroare la generarea explicației.";
      setExplain((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId]),
          open: true,
          loading: false,
          text: null,
          error: msg,
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <StudentNavbar />
        <div className="p-10 text-center text-gray-700">Se încarcă rezultatele…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Înapoi la Dashboard
          </button>

          <div className="hidden sm:flex gap-3">
            <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
              <div className="text-xs text-gray-500">Întrebări</div>
              <div className="text-lg font-extrabold text-gray-900">{total}</div>
            </div>
            <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
              <div className="text-xs text-gray-500">Greșite</div>
              <div className="text-lg font-extrabold text-red-600">{wrongCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Rezultatele tale</h1>
              <p className="text-gray-600 mt-1">
                Ai terminat sesiunea. Mai jos vezi răspunsurile și (dacă ai greșit) explicații generate cu AI.
              </p>
            </div>

            <div className="text-center md:text-right">
              <div className="text-6xl font-extrabold text-purple-600 leading-none">
                {score} / {total}
              </div>
              <div className="text-gray-600 mt-2 font-semibold">{percentage}% răspunsuri corecte</div>

              <div className="mt-3 w-full md:w-64 h-3 bg-gray-100 rounded-full overflow-hidden border">
                <div
                  className="h-full bg-purple-600"
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 border">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-900">Răspunsuri detaliate</h2>

          {answers.length === 0 ? (
            <p className="text-gray-500 text-center">Nu există răspunsuri disponibile.</p>
          ) : (
            <div className="space-y-5">
              {answers.map((a, index) => {
                const ex = explain[a.question_id];
                const userAns =
                  a.selected_answers.length > 0 ? a.selected_answers.map((x) => x.text).join(", ") : "—";
                const correctAns =
                  a.correct_answers.length > 0 ? a.correct_answers.map((x) => x.text).join(", ") : "—";

                return (
                  <div
                    key={a.question_id}
                    className={`rounded-2xl border overflow-hidden ${
                      a.is_correct ? "border-green-200" : "border-red-200"
                    }`}
                  >
                    <div className={`p-5 ${a.is_correct ? "bg-green-50" : "bg-red-50"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            {a.is_correct ? (
                              <CheckCircleIcon className="w-6 h-6 text-green-700" />
                            ) : (
                              <XCircleIcon className="w-6 h-6 text-red-700" />
                            )}
                            <p className="font-extrabold text-gray-900">
                              {index + 1}. {a.question_text}
                            </p>
                          </div>

                          <div className="mt-3 text-sm text-gray-800 space-y-1">
                            <p>
                              <span className="font-bold">Răspunsul tău:</span>{" "}
                              <span className={a.is_correct ? "text-green-800" : "text-red-800"}>
                                {userAns}
                              </span>
                            </p>
                            <p>
                              <span className="font-bold">Răspuns corect:</span>{" "}
                              <span className="text-gray-900">{correctAns}</span>
                            </p>
                          </div>
                        </div>

                        {!a.is_correct && (
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExplain(a.question_id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 font-bold text-sm text-gray-800"
                            >
                              {ex?.open ? (
                                <>
                                  Ascunde <ChevronUpIcon className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  Explică <ChevronDownIcon className="w-4 h-4" />
                                </>
                              )}
                            </button>

                            {ex?.open && !ex?.text && (
                              <button
                                type="button"
                                disabled={ex?.loading}
                                onClick={() => generateExplanation(a.question_id)}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-extrabold text-sm transition ${
                                  ex?.loading
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                              >
                                <SparklesIcon className="w-4 h-4" />
                                {ex?.loading ? "Generez..." : "Generează explicația"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {!a.is_correct && ex?.open && (
                      <div className="p-5 bg-white">
                        {ex.loading && <div className="text-sm text-gray-600">Se generează explicația…</div>}

                        {ex.error && (
                          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                            {ex.error}
                          </div>
                        )}

                        {ex.text && (
                          <div className="text-sm text-gray-800 bg-purple-50/50 border border-purple-200 rounded-xl p-4 whitespace-pre-line">
                            {ex.text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-8 border">
          <div className="flex items-center gap-2 mb-6">
            <TrophyIcon className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-extrabold text-gray-900">Clasament</h2>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center">Clasamentul nu este disponibil.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <div
                  key={`${entry.email}-${i}`}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border"
                >
                  <span className="font-bold text-gray-900">
                    #{i + 1} — {entry.email}
                  </span>
                  <span className="text-purple-700 font-extrabold">{entry.score} pct</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-3 bg-gray-300 rounded-2xl hover:bg-gray-400 transition font-bold"
          >
            ⬅ Înapoi la Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}