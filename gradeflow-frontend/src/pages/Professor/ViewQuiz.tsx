import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import ProfessorNavbar from "../../components/ProfessorNavbar";

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

  // =========================
  // LOAD QUIZ
  // =========================
  const loadQuiz = async () => {
    try {
      const res = await api.get(`/professor/quiz/${id}`);
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
    alert("Cod copiat!");
  };

  const startSession = async () => {
    try {
      const res = await api.post(`/professor/quiz/${id}/start`);
      navigate(`/professor/session/${res.data.session.id}`);
    } catch {
      alert("Eroare la pornirea sesiunii");
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (loading)
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />
        <div className="p-10 text-center">Se încarcă...</div>
      </div>
    );

  if (!quiz)
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />
        <div className="p-10 text-center">Quiz inexistent.</div>
      </div>
    );

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {quiz.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {quiz.description || "Fără descriere"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-500 text-sm">Cod de alăturare</p>
              <div className="flex items-center gap-2 justify-end">
                <span className="font-mono text-xl font-bold">
                  {quiz.join_code}
                </span>
                <button
                  onClick={copyJoinCode}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <InfoCard label="⏳ Timp" value={`${quiz.time_limit} min`} />
            <InfoCard
              label="❓ Întrebări"
              value={quiz.questions.length}
            />
            <InfoCard label="🧠 Tip" value={quiz.creation_type} />
          </div>
        </div>

        {/* QUESTIONS */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <h2 className="text-2xl font-semibold mb-6">Întrebări</h2>

          <div className="space-y-4">
            {quiz.questions.map((q, index) => {
              const open = expanded === index;

              return (
                <div
                  key={q.id}
                  className="border rounded-xl p-5 bg-gray-50"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(index)}
                  >
                    <h3 className="font-medium text-lg">
                      {index + 1}. {q.title}
                    </h3>
                    <span className="text-xl">
                      {open ? "▲" : "▼"}
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

                  {open && (
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
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={startSession}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            ▶ Pornește sesiunea live
          </button>

          <button
            onClick={() => navigate(`/professor/edit-quiz/${quiz.id}`)}
            className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
          >
            ✏️ Editează quiz
          </button>

          <button
            onClick={() => navigate("/professor/dashboard")}
            className="flex-1 px-6 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
          >
            ⬅ Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================
// INFO CARD
// =========================
function InfoCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold text-blue-600 mt-1">{value}</p>
    </div>
  );
}