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
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // ➕ întrebare
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

  // ➕ opțiune
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  // ❌ șterge opțiune
  const deleteOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  // ❌ șterge întrebare
  const deleteQuestion = (qIndex: number) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  // Trimite quiz-ul
  const submitQuiz = async () => {
    try {
      const quizRes = await api.post("/professor/create", {
        title,
        description,
        timeLimit,
        creation_type: "manual",
      });

      const quizId = quizRes.data.quiz.id;

      await api.post(`/professor/${quizId}/questions`, {
        questions,
      });

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

        <p className="text-gray-500 mt-1">
          Completează toate setările quiz-ului
        </p>

        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Titlu */}
          <div>
            <label className="block text-gray-700 font-medium">Titlu quiz</label>
            <input
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Descriere */}
          <div>
            <label className="block text-gray-700 font-medium">Descriere</label>
            <textarea
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Limită timp */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
              <ClockIcon className="w-5 h-5 text-gray-600" />
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

            <p className="text-sm text-gray-500 mt-1">
              Timp selectat:{" "}
              <span className="font-medium">{timeLimit} min</span>
            </p>
          </div>

          {/* Tip creare */}
          <div>
            <label className="block font-medium text-gray-700">Tip creare</label>
            <select
              className="w-60 mt-1 p-3 border rounded-lg bg-gray-50"
              value={creationType}
              onChange={(e) => setCreationType(e.target.value)}
            >
              <option value="manual">Manual</option>
              <option value="ai">Generat de AI</option>
            </select>
          </div>

          <hr className="my-6" />

          {/* Lista întrebări */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Întrebări</h2>

            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Adaugă întrebare
            </button>
          </div>

          <div className="space-y-10 mt-4">
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="p-6 bg-gray-50 rounded-xl border relative"
              >
                {/* Delete question */}
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="absolute top-0.5 right-0.5 text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>

                {/* Text Întrebare */}
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

                {/* Opțiuni */}
                <div className="mt-4 ml-2 space-y-3">
                  {q.options.map((opt, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex items-center gap-3 relative"
                    >
                      <input
                        type={
                          q.question_type === "single" ? "radio" : "checkbox"
                        }
                        name={`q-${qIndex}`}
                        checked={opt.is_correct}
                        onChange={(e) => {
                          const updated = [...questions];

                          if (q.question_type === "single") {
                            updated[qIndex].options.forEach(
                              (o) => (o.is_correct = false)
                            );
                          }

                          updated[qIndex].options[oIndex].is_correct =
                            e.target.checked;
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

                      {/* Delete option */}
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