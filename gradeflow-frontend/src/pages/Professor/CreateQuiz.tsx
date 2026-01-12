import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import EditQuizNavbar from "../../components/EditQuizNavbar";

import {
  PlusCircleIcon,
  TrashIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface Option {
  id?: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id?: number;
  title: string;
  question_type: "single" | "multiple";
  options: Option[];
}

type CreationType = "manual" | "ai";

function normalizeQuestionType(v: any): "single" | "multiple" {
  const s = String(v ?? "single").toLowerCase();
  if (s === "multiple" || s === "multi") return "multiple";
  return "single";
}

function extractQuestions(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload.questions)) return payload.questions;
  if (Array.isArray(payload?.data?.questions)) return payload.data.questions;
  if (Array.isArray(payload?.result?.questions)) return payload.result.questions;
  if (Array.isArray(payload?.quiz?.questions)) return payload.quiz.questions;
  return [];
}

function normalizeQuestions(raw: any[]): Question[] {
  return (raw ?? []).map((q: any) => {
    const optionsRaw = Array.isArray(q?.options) ? q.options : [];
    const opts: Option[] = optionsRaw.map((o: any) => ({
      text: String(o?.text ?? o?.title ?? "").trim(),
      is_correct: Boolean(o?.is_correct ?? false),
    }));

    while (opts.length < 2) opts.push({ text: "", is_correct: false });

    return {
      title: String(q?.title ?? q?.text ?? "").trim(),
      question_type: normalizeQuestionType(q?.question_type),
      options: opts,
    };
  });
}

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);

  const [creationType, setCreationType] = useState<CreationType>("manual");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState<string>(""); // optional prompt/instructions
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);

  const validateQuiz = () => {
    if (!title.trim()) return "Titlul quiz-ului este obligatoriu";
    if (questions.length === 0) return "Trebuie să adaugi cel puțin o întrebare";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.title.trim()) return `Întrebarea #${i + 1} nu are titlu`;
      if (q.options.length < 2)
        return `Întrebarea #${i + 1} trebuie să aibă minim 2 opțiuni`;
      if (q.options.some((o) => !o.text.trim()))
        return `Întrebarea #${i + 1} are opțiuni goale`;

      const correctCount = q.options.filter((o) => o.is_correct).length;
      if (correctCount === 0)
        return `Întrebarea #${i + 1} trebuie să aibă cel puțin un răspuns corect`;
      if (q.question_type === "single" && correctCount > 1)
        return `Întrebarea #${i + 1} permite un singur răspuns corect`;
    }

    return null;
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        title: "",
        question_type: "single",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        options: [...updated[qIndex].options, { text: "", is_correct: false }],
      };
      return updated;
    });
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts.splice(oIndex, 1);
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };

  const deleteQuestion = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated.splice(qIndex, 1);
      return updated;
    });
  };

  const generateFromDocument = async () => {
    setAiError(null);

    if (!aiFile) {
      setAiError("Te rog alege un fișier (pdf/docx) înainte să generezi.");
      return;
    }

    setAiLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", aiFile);
      if (aiHint.trim()) fd.append("hint", aiHint.trim());

      const base =
        (api as any)?.defaults?.baseURL ||
        (import.meta as any).env?.VITE_API_URL ||
        "http://localhost:7050";

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

      const res = await fetch(`${base}/ai/professor/generate-questions`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const raw = extractQuestions(data);
      const normalized = normalizeQuestions(raw);

      if (!normalized.length) {
        throw new Error("AI nu a returnat întrebări (questions: []). Verifică output-ul Gemini.");
      }

      setQuestions(normalized);
      setCreationType("ai");
    } catch (e: any) {
      console.error("AI GENERATE ERROR:", e);
      setAiError(e?.message || "Eroare la generarea întrebărilor.");
    } finally {
      setAiLoading(false);
    }
  };

  const submitQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) return alert(validationError);

    setSaving(true);
    try {
      const quizRes = await api.post("/professor/create", {
        title,
        description,
        time_limit: timeLimit,
        creation_type: creationType, // manual | ai
      });

      const quizId = quizRes.data.quiz.id;
      await api.post(`/professor/quiz/${quizId}/questions`, { questions });

      alert("Quiz creat cu succes!");
      navigate("/professor/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Eroare la creare quiz");
    } finally {
      setSaving(false);
    }
  };

  const questionCount = questions.length;

  const totalOptions = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.options?.length ?? 0), 0);
  }, [questions]);

  const canGenerate = !!aiFile && !aiLoading;

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <EditQuizNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/professor/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Înapoi la dashboard
            </button>

            <h1 className="mt-2 text-3xl font-extrabold flex items-center gap-2 text-gray-900">
              <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
              Creează un Quiz
            </h1>
            <p className="text-gray-600 mt-1">
              Creează manual sau generează dintr-un document cu AI, apoi editează și salvează.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl border bg-white">
              <div className="text-xs text-gray-500">Întrebări</div>
              <div className="font-extrabold text-gray-900">{questionCount}</div>
            </div>
            <div className="px-4 py-2 rounded-xl border bg-white">
              <div className="text-xs text-gray-500">Opțiuni</div>
              <div className="font-extrabold text-gray-900">{totalOptions}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-gray-900">Setări quiz</h2>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    creationType === "manual"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                >
                  {creationType === "manual" ? "MANUAL" : "AI"}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Titlu</label>
                  <input
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Test capitolul 3"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Descriere</label>
                  <textarea
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Instrucțiuni / detalii pentru studenți"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    Limită de timp (minute)
                  </label>

                  <div className="mt-2 flex gap-4 items-center">
                    <input
                      type="range"
                      min={1}
                      max={60}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full"
                    />
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-24 p-2 border rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-lg font-extrabold text-gray-900">Metodă creare</h2>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreationType("manual")}
                  className={`px-3 py-2 rounded-xl border text-sm font-bold transition ${
                    creationType === "manual"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setCreationType("ai")}
                  className={`px-3 py-2 rounded-xl border text-sm font-bold transition ${
                    creationType === "ai"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                  }`}
                >
                  AI
                </button>
              </div>

              {creationType === "ai" && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                    Generează întrebări din document
                  </div>

                  <div
                    className="mt-3 p-4 rounded-2xl border border-dashed bg-purple-50/40 hover:bg-purple-50 transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white border">
                        <DocumentArrowUpIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">
                          {aiFile ? aiFile.name : "Click pentru a încărca fișier"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Acceptă: PDF, DOCX (după cum ai în backend).
                        </div>
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setAiFile(f);
                      setAiError(null);
                    }}
                  />

                  <div className="mt-3">
                    <label className="text-xs font-bold text-gray-600">Instrucțiuni (opțional)</label>
                    <textarea
                      className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                      value={aiHint}
                      onChange={(e) => setAiHint(e.target.value)}
                      rows={3}
                      placeholder='Ex: "Generează 10 întrebări, nivel mediu, în română."'
                    />
                  </div>

                  {aiError && (
                    <div className="mt-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
                      {aiError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={generateFromDocument}
                    className={`mt-4 w-full py-3 rounded-2xl font-extrabold transition ${
                      canGenerate
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {aiLoading ? "Generez..." : "Generează întrebările"}
                  </button>

                  <div className="text-xs text-gray-500 mt-2">
                    După generare, întrebările apar în editorul de mai jos și le poți edita manual.
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <button
                type="button"
                onClick={submitQuiz}
                disabled={saving}
                className={`w-full py-3 rounded-2xl font-extrabold text-lg transition ${
                  saving
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {saving ? "Se salvează..." : "Salvează Quiz-ul"}
              </button>

              <div className="mt-3 text-xs text-gray-500">
                Tip creare: <b>{creationType}</b>. Întrebări: <b>{questionCount}</b>.
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <h2 className="text-2xl font-extrabold text-gray-900">Întrebări</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Adaugă întrebare
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="mt-8 p-6 rounded-2xl border bg-gray-50 text-center">
                  <div className="text-lg font-bold text-gray-900">Nu ai întrebări încă.</div>
                  <p className="text-gray-600 mt-1">
                    Apasă “Adaugă întrebare” sau, dacă ești pe AI, încarcă un document și apasă “Generează”.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="relative bg-gray-50 p-6 rounded-2xl border">
                      <button
                        type="button"
                        onClick={() => deleteQuestion(qIndex)}
                        className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600"
                        title="Șterge întrebarea"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>

                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          className="flex-1 p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder={`Titlu întrebare #${qIndex + 1}`}
                          value={q.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const updated = [...prev];
                              updated[qIndex] = { ...updated[qIndex], title: val };
                              return updated;
                            });
                          }}
                        />

                        <select
                          className="p-3 border rounded-xl bg-white"
                          value={q.question_type}
                          onChange={(e) => {
                            const val = e.target.value as "single" | "multiple";
                            setQuestions((prev) => {
                              const updated = [...prev];

                              if (val === "single") {
                                const opts = updated[qIndex].options.map((o) => ({ ...o }));
                                const firstCorrect = opts.findIndex((o) => o.is_correct);
                                opts.forEach((o, idx) => (o.is_correct = idx === firstCorrect && firstCorrect !== -1));
                                updated[qIndex] = { ...updated[qIndex], question_type: val, options: opts };
                              } else {
                                updated[qIndex] = { ...updated[qIndex], question_type: val };
                              }

                              return updated;
                            });
                          }}
                        >
                          <option value="single">Un singur răspuns</option>
                          <option value="multiple">Răspunsuri multiple</option>
                        </select>
                      </div>

                      <div className="mt-5 space-y-3">
                        {q.options.map((opt, oIndex) => {
                          const inputType = q.question_type === "single" ? "radio" : "checkbox";
                          const radioName = `q-${qIndex}-correct`;

                          return (
                            <div key={oIndex} className="flex gap-3 items-center">
                              <input
                                type={inputType}
                                name={inputType === "radio" ? radioName : undefined}
                                checked={opt.is_correct}
                                onChange={() => {
                                  setQuestions((prev) => {
                                    const updated = [...prev];
                                    const opts = updated[qIndex].options.map((o) => ({ ...o }));

                                    if (updated[qIndex].question_type === "single") {
                                      opts.forEach((o) => (o.is_correct = false));
                                      opts[oIndex].is_correct = true;
                                    } else {
                                      opts[oIndex].is_correct = !opts[oIndex].is_correct;
                                    }

                                    updated[qIndex] = { ...updated[qIndex], options: opts };
                                    return updated;
                                  });
                                }}
                              />

                              <input
                                className="flex-1 p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder={`Opțiune #${oIndex + 1}`}
                                value={opt.text}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) => {
                                    const updated = [...prev];
                                    const opts = updated[qIndex].options.map((o) => ({ ...o }));
                                    opts[oIndex].text = val;
                                    updated[qIndex] = { ...updated[qIndex], options: opts };
                                    return updated;
                                  });
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => deleteOption(qIndex, oIndex)}
                                className="text-red-500 hover:text-red-700"
                                title="Șterge opțiunea"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-800"
                        >
                          <PlusCircleIcon className="w-5 h-5" />
                          Adaugă opțiune
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 lg:hidden">
              <button
                type="button"
                onClick={submitQuiz}
                disabled={saving}
                className={`w-full py-3 rounded-2xl font-extrabold text-lg transition ${
                  saving ? "bg-gray-200 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {saving ? "Se salvează..." : "Salvează Quiz-ul"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}