import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import EditQuizNavbar from "../../components/EditQuizNavbar";

import {
  PlusCircleIcon,
  TrashIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
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

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [creationType] = useState("manual");
  const [questions, setQuestions] = useState<Question[]>([]);

  const navigate = useNavigate();

  // ==========================
  // VALIDARE
  // ==========================
  const validateQuiz = () => {
    if (!title.trim()) return "Titlul quiz-ului este obligatoriu";
    if (questions.length === 0)
      return "Trebuie să adaugi cel puțin o întrebare";

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

  // ==========================
  // ACTIONS
  // ==========================
  const addQuestion = () => {
    setQuestions([
      ...questions,
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
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const deleteQuestion = (qIndex: number) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  const submitQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) return alert(validationError);

    try {
      const quizRes = await api.post("/professor/create", {
        title,
        description,
        time_limit: timeLimit,
        creation_type: creationType,
      });

      const quizId = quizRes.data.quiz.id;
      await api.post(`/professor/quiz/${quizId}/questions`, { questions });

      alert("Quiz creat cu succes!");
      navigate("/professor/dashboard");
    } catch (err) {
      console.error(err);
      alert("Eroare la creare quiz");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <EditQuizNavbar />

      {/* ================= CONTENT ================= */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8 border">

          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
            <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
            Creează un Quiz
          </h1>

          <div className="mt-8 space-y-6">

            {/* TITLU */}
            <div>
              <label className="font-medium">Titlu Quiz</label>
              <input
                className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* DESCRIERE */}
            <div>
              <label className="font-medium">Descriere</label>
              <textarea
                className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* TIME */}
            <div>
              <label className="font-medium flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Limită de timp (minute)
              </label>

              <div className="flex gap-4 items-center">
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
                  className="w-20 p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* QUESTIONS HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <h2 className="text-2xl font-semibold">Întrebări</h2>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Adaugă întrebare
              </button>
            </div>

            {/* QUESTIONS */}
            <div className="space-y-10">
              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="relative bg-gray-50 p-6 rounded-xl border"
                >
                  {/* DELETE QUESTION – FIXAT CORECT */}
                  <button
                    onClick={() => deleteQuestion(qIndex)}
                    className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      className="flex-1 p-3 border rounded-lg"
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

                  {/* OPTIONS */}
                  <div className="mt-4 space-y-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex gap-3 items-center">
                        <input
                          type={q.question_type === "single" ? "radio" : "checkbox"}
                          checked={opt.is_correct}
                          onChange={() => {
                            const updated = [...questions];
                            if (q.question_type === "single") {
                              updated[qIndex].options.forEach(
                                (o) => (o.is_correct = false)
                              );
                            }
                            updated[qIndex].options[oIndex].is_correct =
                              !updated[qIndex].options[oIndex].is_correct;
                            setQuestions(updated);
                          }}
                        />

                        <input
                          className="flex-1 p-3 border rounded-lg bg-white"
                          placeholder="Text opțiune"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].options[oIndex].text =
                              e.target.value;
                            setQuestions(updated);
                          }}
                        />

                        <button
                          onClick={() => deleteOption(qIndex, oIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addOption(qIndex)}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                    >
                      <PlusCircleIcon className="w-5 h-5" />
                      Adaugă opțiune
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMIT */}
            <button
              onClick={submitQuiz}
              className="w-full py-3 mt-8 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700"
            >
              Salvează Quiz-ul
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}