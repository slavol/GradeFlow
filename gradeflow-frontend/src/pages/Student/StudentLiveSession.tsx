import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  question_type: "single" | "multiple";
  options: Option[];
}

type Mode = "LIVE" | "ALL";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function StudentLiveSession() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [session, setSession] = useState<any>(null);

  const [liveQuestion, setLiveQuestion] = useState<Question | null>(null);
  const [liveSelected, setLiveSelected] = useState<number[]>([]);
  const [liveIndex, setLiveIndex] = useState<number>(0);
  const [liveTotal, setLiveTotal] = useState<number>(0);
  const lastLiveQuestionIdRef = useRef<number | null>(null);

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [allAnswers, setAllAnswers] = useState<Record<number, number[]>>({}); // qId -> optionIds[]
  const [submittingAll, setSubmittingAll] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMode: Mode | null = useMemo(() => {
    const m = (session?.mode as Mode | undefined) ?? null;
    return m;
  }, [session?.mode]);

  const loadSession = async () => {
    try {
      const res = await api.get(`/student/session/${sessionId}`);

      if (res.data?.finished) {
        window.location.href = `/student/session/${sessionId}/results`;
        return;
      }

      const sess = res.data?.session ?? null;
      const mode: Mode =
        (res.data?.mode as Mode | undefined) ??
        (sess?.mode as Mode | undefined) ??
        "LIVE";

      setSession({ ...sess, mode });

      if (typeof res.data?.time_left === "number") {
        setTimeLeft(res.data.time_left);
      } else {
        setTimeLeft(null);
      }

      if (mode === "LIVE") {
        const q = res.data?.question ?? null;
        const opts: Option[] = Array.isArray(res.data?.options)
          ? res.data.options
          : [];

        const index = typeof res.data?.index === "number" ? res.data.index : 0;
        const total = typeof res.data?.total === "number" ? res.data.total : 0;

        setLiveIndex(index);
        setLiveTotal(total);

        if (!q) {
          setLiveQuestion(null);
          setLiveSelected([]);
          lastLiveQuestionIdRef.current = null;
        } else {
          const normalized: Question = {
            id: q.id,
            text: q.text ?? q.title ?? "",
            question_type: (q.question_type ?? "single") as "single" | "multiple",
            options: Array.isArray(q.options) ? q.options : opts,
          };

          if (normalized.id !== lastLiveQuestionIdRef.current) {
            lastLiveQuestionIdRef.current = normalized.id;
            setLiveSelected([]);
          }

          setLiveQuestion(normalized);
        }

        setAllQuestions([]);
        setAllAnswers({});
      } else {
        const qsRaw = Array.isArray(res.data?.questions) ? res.data.questions : [];

        const normalizedAll: Question[] = qsRaw.map((q: any) => ({
          id: q.id,
          text: q.text ?? q.title ?? "",
          question_type: (q.question_type ?? "single") as "single" | "multiple",
          options: Array.isArray(q.options) ? q.options : [],
        }));

        setAllQuestions(normalizedAll);
        setLiveQuestion(null);
        setLiveSelected([]);
        lastLiveQuestionIdRef.current = null;
      }

      setError(null);
    } catch (e: any) {
      console.error("SESSION LOAD ERROR:", e);
      setError(e?.response?.data?.error || "Eroare la încărcarea sesiunii.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    let pollId: ReturnType<typeof setInterval> | null = null;

    pollId = setInterval(() => {
      if ((session?.mode ?? "LIVE") !== "LIVE") return;
      loadSession();
    }, 2500);

    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [sessionId, session?.mode]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return null;
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [timeLeft]);

  const submitLiveAnswer = async (questionId: number, selectedOptionIds: number[]) => {
    if (!selectedOptionIds.length) return;

    try {
      await api.post(`/student/session/${sessionId}/answer`, {
        question_id: questionId,
        selected_option_ids: selectedOptionIds,
      });

      setLiveQuestion(null);
      setLiveSelected([]);
    } catch (e) {
      console.error("SUBMIT LIVE ERROR:", e);
      alert("Eroare la trimiterea răspunsului.");
    }
  };

  const onLiveToggle = (optId: number) => {
    if (!liveQuestion) return;

    if (liveQuestion.question_type === "single") {
      setLiveSelected([optId]);
      submitLiveAnswer(liveQuestion.id, [optId]);
      return;
    }

    setLiveSelected((prev) =>
      prev.includes(optId) ? prev.filter((x) => x !== optId) : [...prev, optId]
    );
  };

  const onLiveSubmitMultiple = () => {
    if (!liveQuestion) return;
    submitLiveAnswer(liveQuestion.id, liveSelected);
  };

  const toggleAllAnswer = (q: Question, optId: number) => {
    setAllAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.question_type === "single") {
        return { ...prev, [q.id]: [optId] };
      }
      return {
        ...prev,
        [q.id]: current.includes(optId)
          ? current.filter((x) => x !== optId)
          : [...current, optId],
      };
    });
  };

  const allProgress = useMemo(() => {
    const total = allQuestions.length;
    if (!total) return 0;
    const answered = allQuestions.reduce((acc, q) => acc + ((allAnswers[q.id]?.length ?? 0) > 0 ? 1 : 0), 0);
    return Math.round((answered / total) * 100);
  }, [allQuestions, allAnswers]);

  const submitAll = async () => {
    try {
      if (!allQuestions.length) return;

      const payload = allQuestions
        .map((q) => ({
          question_id: q.id,
          selected_option_ids: allAnswers[q.id] ?? [],
        }))
        .filter((x) => Array.isArray(x.selected_option_ids) && x.selected_option_ids.length > 0);

      if (payload.length === 0) {
        alert("Completează măcar o întrebare înainte să trimiți.");
        return;
      }

      setSubmittingAll(true);

      await api.post(`/student/session/${sessionId}/answer/all`, {
        answers: payload,
      });

      window.location.href = `/student/session/${sessionId}/results`;
    } catch (e) {
      console.error("SUBMIT ALL ERROR:", e);
      alert("Eroare la trimiterea răspunsurilor.");
    } finally {
      setSubmittingAll(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Se încarcă…</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!session) return <div className="p-10 text-center">Sesiunea nu există.</div>;

  const mode: Mode = (session?.mode as Mode) ?? "LIVE";

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="GradeFlow" className="h-8 w-8" />
            <span className="text-xl font-extrabold text-gray-900">GradeFlow</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                mode === "LIVE"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              MODE: {mode}
            </span>

            {timeLeft !== null && (
              <span className="text-sm font-bold text-red-600">
                ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow border p-6">
          {mode === "LIVE" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Sesiune Live</h1>
                  <p className="text-gray-600 text-sm">
                    Primești întrebările pe rând. La <b>single</b> răspunsul se trimite instant. La <b>multiple</b> dai Submit.
                  </p>
                </div>

                {!!liveTotal && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progres</div>
                    <div className="font-bold text-gray-900">
                      {clamp(liveIndex + (liveQuestion ? 1 : 0), 0, liveTotal)} / {liveTotal}
                    </div>
                  </div>
                )}
              </div>

              {!liveQuestion ? (
                <div className="text-center py-12">
                  <div className="text-2xl font-bold text-gray-900">Așteaptă întrebarea…</div>
                  <p className="text-gray-600 mt-2">Se va încărca automat.</p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <div className="text-xs font-bold text-gray-500 mb-2">
                      {liveQuestion.question_type === "single" ? "SINGLE CHOICE" : "MULTIPLE CHOICE"}
                    </div>
                    <div className="text-xl font-extrabold text-gray-900">
                      {liveQuestion.text}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(liveQuestion.options ?? []).map((opt) => {
                      const active = liveSelected.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onLiveToggle(opt.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition ${
                            active
                              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-200"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{opt.text}</span>
                            {active && (
                              <span className="text-xs font-bold text-purple-700">SELECTAT</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {liveQuestion.question_type === "multiple" && (
                    <button
                      type="button"
                      disabled={liveSelected.length === 0}
                      onClick={onLiveSubmitMultiple}
                      className={`w-full mt-6 py-3 rounded-2xl font-extrabold transition ${
                        liveSelected.length === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      Trimite răspunsul
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {mode === "ALL" && (
            <>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Sesiune All-at-once</h1>
                  <p className="text-gray-600 text-sm">
                    Vezi toate întrebările și trimiți o singură dată la final.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Completat</div>
                  <div className="font-extrabold text-gray-900">{allProgress}%</div>
                </div>
              </div>

              {(allQuestions ?? []).length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  Nu există întrebări pentru această sesiune.
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {(allQuestions ?? []).map((q, idx) => (
                      <div key={q.id} className="border rounded-3xl p-5 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-1">
                              {q.question_type === "single" ? "SINGLE" : "MULTIPLE"}
                            </div>
                            <div className="font-extrabold text-gray-900">
                              {idx + 1}. {q.text}
                            </div>
                          </div>
                          <div className="text-xs font-bold px-3 py-1 rounded-full border bg-white">
                            {(allAnswers[q.id]?.length ?? 0) > 0 ? "Răspuns ales" : "Necompletat"}
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {(q.options ?? []).map((opt) => {
                            const active = (allAnswers[q.id] ?? []).includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => toggleAllAnswer(q, opt.id)}
                                className={`w-full text-left p-4 rounded-2xl border transition ${
                                  active
                                    ? "bg-purple-50 border-purple-300 ring-2 ring-purple-200"
                                    : "bg-white hover:bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-900">{opt.text}</span>
                                  {active && <span className="text-xs font-bold text-purple-700">SELECTAT</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={submitAll}
                    disabled={submittingAll}
                    className={`w-full mt-8 py-4 rounded-2xl font-extrabold transition ${
                      submittingAll
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {submittingAll ? "Se trimite..." : "Trimite toate răspunsurile"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}