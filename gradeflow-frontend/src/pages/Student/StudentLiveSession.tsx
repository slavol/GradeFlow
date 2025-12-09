import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

interface Question {
  id: number;
  text: string;
  question_type: "single" | "multiple";
}

interface Option {
  id: number;
  text: string;
}

export default function StudentLiveSession() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [session, setSession] = useState<any>(null);
  const [studentSession, setStudentSession] = useState<any>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // memorăm ultima întrebare pentru a evita resetări inutile
  const prevQuestionId = useRef<number | null>(null);

  // referință pentru timer (pentru clearInterval)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // LOAD SESSION DATA
  // ============================================================
  const loadSession = async () => {
    try {
      const res = await api.get(`/student/session/${sessionId}`);

      if (res.data.finished) {
        window.location.href = `/student/session/${sessionId}/results`;
        return;
      }

      setSession(res.data.session);
      setStudentSession(res.data.studentSession);

      const newQuestion = res.data.question || null;

      // resetăm selecția doar dacă întrebarea s-a schimbat
      if (newQuestion?.id !== prevQuestionId.current) {
        prevQuestionId.current = newQuestion?.id ?? null;
        setSelected([]);
      }

      setQuestion(newQuestion);
      setOptions(res.data.options || []);

      // sincronizare timp rămas din backend
      if (typeof res.data.time_left === "number") {
        setTimeLeft(res.data.time_left);
      }

      setError(null);
    } catch (err: any) {
      console.error("SESSION LOAD ERROR:", err);
      setError(err.response?.data?.error || "Eroare la încărcarea sesiunii.");
    } finally {
      setLoading(false);
    }
  };

  // LOAD INITIAL + POLLING
  useEffect(() => {
    loadSession();
    const poll = setInterval(loadSession, 3000);
    return () => clearInterval(poll);
  }, []);

  // ============================================================
  // CLIENT TIMER (countdown local + sync backend)
  // ============================================================
  useEffect(() => {
    if (timeLeft === null) return;

    // Oprim orice alt timer
    if (timerRef.current) clearInterval(timerRef.current);

    // pornim timerul local
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return null;

        if (t <= 1) {
          loadSession(); // FORȚĂM resync
          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  // ============================================================
  // OPTION SELECT
  // ============================================================
  const toggleOption = (id: number) => {
    if (!question) return;

    // SINGLE CHOICE → răspundem imediat
    if (question.question_type === "single") {
      setSelected([id]);
      submitAnswer([id]);
      return;
    }

    // MULTI SELECT
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ============================================================
  // SUBMIT ANSWER
  // ============================================================
  const submitAnswer = async (answerIds = selected) => {
    if (!question || answerIds.length === 0) return;

    try {
      await api.post(`/student/session/${sessionId}/answer`, {
        question_id: question.id,
        selected_option_ids: answerIds,
      });

      // ascundem întrebarea până vine următoarea
      setQuestion(null);
      setOptions([]);
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Eroare la trimiterea răspunsului.");
    }
  };

  // ============================================================
  // UI RENDER
  // ============================================================
  if (loading) {
    return <div className="p-10 text-center">Se încarcă...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  if (!session) {
    return <div className="p-6 text-center text-gray-700">Sesiunea nu există.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">

        {/* TIMER DISPLAY */}
        {timeLeft !== null && (
          <div className="text-right text-red-600 font-bold text-xl mb-4">
            Timp rămas:{" "}
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}

        {/* NO QUESTION YET */}
        {!question ? (
          <div>
            <h1 className="text-2xl font-bold">Așteaptă întrebarea…</h1>
            <p className="text-gray-600 mt-3">
              Profesorul nu a trimis următoarea întrebare încă.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">❓ Întrebare</h1>
            <p className="text-xl font-semibold mb-6">{question.text}</p>

            <div className="space-y-4">
              {options.map((opt) => {
                const active = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`w-full p-4 text-left border rounded-xl transition ${
                      active
                        ? "bg-blue-200 border-blue-500"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* MULTIPLE CHOICE SUBMIT */}
            {question.question_type === "multiple" && selected.length > 0 && (
              <button
                onClick={() => submitAnswer()}
                className="w-full mt-6 p-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Trimite răspunsul
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}