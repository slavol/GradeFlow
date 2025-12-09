import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

import {
  PlusCircleIcon,
  TrashIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
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
  const [creationType, setCreationType] = useState("manual");

  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();

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

  // ➕ Add Question
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

  // ➕ Add Option
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  // ❌ Delete Option
  const deleteOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  // ❌ Delete Question
  const deleteQuestion = (qIndex: number) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  // SUBMIT QUIZ
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
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-200">

        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
          Creează un Quiz
        </h1>

        <div className="mt-8 space-y-6">

          {/* TITLU */}
          <div>
            <label className="block text-gray-700 font-medium">
              Titlu Quiz
            </label>
            <input
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* DESCRIERE */}
          <div>
            <label className="block text-gray-700 font-medium">
              Descriere
            </label>
            <textarea
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* TIME LIMIT */}
          <div>
            <label className="block text-gray-700 font-medium flex items-center gap-1">
              <ClockIcon className="w-5 h-5" />
              Limită de timp
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
                value={timeLimit}
                min={1}
                max={60}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-20 p-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Întrebări</h2>

            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Adaugă întrebare
            </button>
          </div>

          {/* QUESTION LIST */}
          <div className="space-y-10 mt-4">
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="p-6 bg-gray-50 rounded-xl border relative"
              >
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>

                {/* Q Title */}
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

                {/* OPTIONS */}
                <div className="mt-4 space-y-3 ml-2">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">

                      <input
                        type={q.question_type === "single" ? "radio" : "checkbox"}
                        name={`q-${qIndex}`}
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
                        className="w-full p-3 border rounded-lg bg-white"
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
                    className="mt-3 flex items-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
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
            className="w-full py-3 mt-6 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700"
          >
            Salvează Quiz-ul
          </button>
        </div>
      </div>
    </div>
  );
}