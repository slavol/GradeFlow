import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

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

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Încarcă quiz-ul
  const loadQuiz = async () => {
    try {
      const res = await api.get(`/professor/quiz/${id}`);
      const q = res.data;

      setTitle(q.title);
      setDescription(q.description);
      setTimeLimit(q.time_limit);
      setQuestions(q.questions);

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea quiz-ului");
    }
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  // 2️⃣ Adaugă întrebare
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: "",
        question_type: "single",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false }
        ]
      }
    ]);
  };

  // 3️⃣ Adaugă opțiune
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  // 4️⃣ Șterge opțiune
  const deleteOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  // 5️⃣ Șterge întrebare
  const deleteQuestion = (qIndex: number) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  // 6️⃣ Salvează modificările
  const saveQuiz = async () => {
    try {
      // update quiz meta
      await api.put(`/professor/quiz/${id}`, {
        title,
        description,
        time_limit: timeLimit
      });

      // update questions
      await api.put(`/professor/quiz/${id}/questions`, {
        questions
      });

      alert("Quiz actualizat cu succes!");
      navigate("/professor/dashboard");

    } catch (err) {
      console.error(err);
      alert("Eroare la salvare");
    }
  };


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Se încarcă quiz-ul...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        
        <h1 className="text-3xl font-bold text-gray-800">Editează Quiz</h1>

        <div className="mt-8 space-y-6">

          {/* TITLU */}
          <div>
            <label className="block text-gray-700 font-medium">Titlu quiz</label>
            <input
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* DESCRIERE */}
          <div>
            <label className="block text-gray-700 font-medium">Descriere</label>
            <textarea
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* LIMITA DE TIMP */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Limită de timp (minute)
            </label>

            <div className="flex items-center gap-5">
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
                className="w-20 p-2 border rounded-lg bg-gray-50"
                value={timeLimit}
                min={1}
                max={60}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <hr className="my-6" />

          {/* LISTA ÎNTREBĂRI */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Întrebări</h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Adaugă întrebare
            </button>
          </div>

          <div className="space-y-10 mt-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 bg-gray-50 rounded-xl border relative">
                
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                <div className="flex gap-4">
                  <input
                    className="w-full p-3 border rounded-lg"
                    placeholder="Titlu întrebare"
                    value={q.title}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIndex].title = e.target.value;
                      setQuestions(updated);
                    }}
                  />

                  <select
                    className="p-3 border rounded-lg"
                    value={q.question_type}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIndex].question_type =
                        e.target.value as "single" | "multiple";
                      setQuestions(updated);
                    }}
                  >
                    <option value="single">Un singur răspuns</option>
                    <option value="multiple">Răspunsuri multiple</option>
                  </select>
                </div>

                <div className="mt-4 ml-2 space-y-3">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3 relative">

                      <input
                        type={q.question_type === "single" ? "radio" : "checkbox"}
                        name={`q-${qIndex}`}
                        checked={opt.is_correct}
                        onChange={(e) => {
                          const updated = [...questions];

                          if (q.question_type === "single") {
                            updated[qIndex].options.forEach((o) => (o.is_correct = false));
                          }

                          updated[qIndex].options[oIndex].is_correct = e.target.checked;
                          setQuestions(updated);
                        }}
                      />

                      <input
                        className="w-full p-3 border rounded-lg bg-white"
                        placeholder="Text opțiune"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].options[oIndex].text = e.target.value;
                          setQuestions(updated);
                        }}
                      />

                      <button
                        onClick={() => deleteOption(qIndex, oIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addOption(qIndex)}
                    className="mt-3 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                  >
                    + Adaugă opțiune
                  </button>
                </div>

              </div>
            ))}
          </div>

          <button
            onClick={saveQuiz}
            className="w-full py-3 mt-6 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700"
          >
            Salvează modificările
          </button>
        </div>
      </div>
    </div>
  );
}