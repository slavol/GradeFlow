import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  title: string;
  question_type: "single" | "multiple";
  options: Option[];
  position?: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  join_code: string;
  time_limit: number;
  creation_type: string;
  questions: Question[];
}

export default function ViewQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const loadQuiz = async () => {
    try {
      const res = await api.get(`/professor/quiz/${id}`);
      console.log("QUIZ RESPONSE:", res.data);

      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea quiz-ului");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  const toggleExpand = (index: number) =>
    setExpanded(expanded === index ? null : index);

  const copyJoinCode = () => {
    if (!quiz) return;
    navigator.clipboard.writeText(quiz.join_code);
    alert("Cod copiat în clipboard!");
  };

  const startSession = async () => {
    try {
      const res = await api.post(`/professor/quiz/${id}/start`);
      const session = res.data.session;

      navigate(`/professor/session/${session.id}`);
    } catch (err) {
      console.error(err);
      alert("Eroare la pornirea sesiunii");
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  if (loading) return <div className="p-10 text-center">Se încarcă...</div>;
  if (!quiz) return <div className="p-10 text-center">Quiz inexistent.</div>;

  return (
    <div className="min-h-screen bg-[#f4f6fc] p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg border">

        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">
              {quiz.description || "Fără descriere"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500">Cod de alăturare:</p>

            <div className="flex items-center gap-2 justify-end">
              <p className="font-mono text-xl font-semibold">
                {quiz.join_code}
              </p>

              <button
                onClick={copyJoinCode}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                📋 Copiază
              </button>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="flex gap-4 mb-6 text-gray-700">
          <div className="p-3 bg-gray-100 rounded-xl">
            ⏳ Timp: <strong>{quiz.time_limit} min</strong>
          </div>

          <div className="p-3 bg-gray-100 rounded-xl">
            ❓ Întrebări: <strong>{quiz.questions.length}</strong>
          </div>

          <div className="p-3 bg-gray-100 rounded-xl">
            🧠 Tip: <strong>{quiz.creation_type}</strong>
          </div>
        </div>

        <hr className="my-6" />

        {/* LISTA ÎNTREBĂRI */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Întrebări
        </h2>

        <div className="space-y-6">
          {quiz.questions.map((q, index) => {
            const isOpen = expanded === index;

            return (
              <div
                key={q.id}
                className="p-6 bg-gray-50 rounded-xl border shadow-sm"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <h3 className="text-xl font-medium text-gray-800">
                    {index + 1}. {q.title}
                  </h3>

                  <span className="text-gray-600 text-xl">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>

                <p className="text-gray-500 mt-1">
                  Tip:{" "}
                  <strong>
                    {q.question_type === "single"
                      ? "Un singur răspuns"
                      : "Răspunsuri multiple"}
                  </strong>
                </p>

                {/* OPTIONS LIST */}
                {isOpen && (
                  <div className="mt-4 space-y-2">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-lg border ${
                          opt.is_correct
                            ? "bg-green-100 border-green-300"
                            : "bg-white"
                        }`}
                      >
                        {opt.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={() => navigate(`/professor/edit-quiz/${quiz.id}`)}
            className="px-5 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
          >
            ✏️ Editează Quiz
          </button>

          <button
            onClick={() => navigate("/professor/dashboard")}
            className="px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
          >
            ⬅ Înapoi la Dashboard
          </button>

          <button
            onClick={startSession}
            className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            ▶ Pornește sesiunea live
          </button>
        </div>
      </div>
    </div>
  );
}