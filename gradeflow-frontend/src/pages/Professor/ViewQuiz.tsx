import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  title: string;
  question_type: string;
  options: Option[];
}

export default function ViewQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuiz = async () => {
    try {
      const res = await api.get(`/professor/quiz/${id}`);

      // 🔥 FIX: backend trimite direct quiz-ul, nu {quiz: ...}
      setQuiz(res.data);
      setQuestions(res.data.questions);
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

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Se încarcă...
      </div>
    );

  if (!quiz)
    return (
      <div className="p-10 text-center text-red-500 text-xl">
        ❌ Quiz inexistent.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f6fc] p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        
        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description || "Fără descriere"}</p>
          </div>

          <div className="text-right">
            <p className="text-gray-500">Cod de alăturare:</p>
            <p className="font-mono text-xl font-semibold text-blue-600">
              {quiz.join_code}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-6 text-gray-700">
          <div className="p-3 bg-gray-100 rounded-xl">
            ⏳ Timp: <strong>{quiz.time_limit} min</strong>
          </div>

          <div className="p-3 bg-gray-100 rounded-xl">
            ❓ Întrebări: <strong>{questions.length}</strong>
          </div>

          <div className="p-3 bg-gray-100 rounded-xl">
            🧠 Tip: <strong>{quiz.creation_type}</strong>
          </div>
        </div>

        <hr className="my-6" />

        {/* QUESTIONS */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Întrebări
        </h2>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="p-6 bg-gray-50 rounded-xl border">

              <h3 className="text-xl font-medium text-gray-800 mb-2">
                {index + 1}. {q.title}
              </h3>

              <p className="text-gray-500 mb-3">
                Tip:{" "}
                <strong>
                  {q.question_type === "single"
                    ? "Un singur răspuns"
                    : "Răspunsuri multiple"}
                </strong>
              </p>

              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-lg border ${
                      opt.is_correct
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-white"
                    }`}
                  >
                    {opt.text}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <a
            href={`/professor/edit-quiz/${quiz.id}`}
            className="px-5 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition"
          >
            ✏️ Editează Quiz
          </a>

          <a
            href="/professor/dashboard"
            className="px-5 py-3 bg-gray-300 text-gray-900 rounded-xl hover:bg-gray-400 transition"
          >
            ⬅ Înapoi la Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}