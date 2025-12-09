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
  position?: number;
}

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // -------------------------------------------------------
  //  VALIDARE COMPLETĂ – identică cu CreateQuiz
  // -------------------------------------------------------
  const validateQuiz = () => {
    if (!title.trim()) return "Titlul quiz-ului este obligatoriu";
    if (questions.length === 0) return "Quiz-ul trebuie să aibă minim o întrebare";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.title.trim()) return `Întrebarea #${i + 1} nu are titlu`;

      if (q.options.length < 2)
        return `Întrebarea #${i + 1} are mai puțin de 2 opțiuni`;

      if (q.options.some(o => !o.text.trim()))
        return `Întrebarea #${i + 1} conține opțiuni goale`;

      const correctCount = q.options.filter(o => o.is_correct).length;

      if (correctCount === 0)
        return `Întrebarea #${i + 1} trebuie să aibă cel puțin o opțiune corectă`;

      if (q.question_type === "single" && correctCount > 1)
        return `Întrebarea #${i + 1} permite un singur răspuns corect`;
    }

    return null;
  };

  // -------------------------------------------------------
  // 1️⃣ Load Quiz
  // -------------------------------------------------------
  const loadQuiz = async () => {
    try {
      const res = await api.get(`/professor/quiz/${id}`);

      setTitle(res.data.title);
      setDescription(res.data.description);
      setTimeLimit(res.data.time_limit);

      const ordered = res.data.questions.map((q: Question, index: number) => ({
        ...q,
        position: q.position ?? index
      }));

      setQuestions(ordered);
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea quiz-ului");
    }
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  // -------------------------------------------------------
  // Drag & Drop
  // -------------------------------------------------------
  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (index: number) => {
    if (dragIndex === null) return;

    const updated = [...questions];
    const moved = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, moved);

    updated.forEach((q, i) => (q.position = i));
    setQuestions(updated);
    setDragIndex(null);
  };

  // -------------------------------------------------------
  // Add / Delete Question / Options
  // -------------------------------------------------------
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: "",
        question_type: "single",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false }
        ],
        position: questions.length
      }
    ]);
  };

  const deleteQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    updated.forEach((q, i) => (q.position = i));
    setQuestions(updated);
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

  // -------------------------------------------------------
  //  SAVE
  // -------------------------------------------------------
  const saveQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) return alert(validationError);

    try {
      await api.put(`/professor/quiz/${id}`, {
        title,
        description,
        time_limit: timeLimit
      });

      await api.put(`/professor/quiz/${id}/questions`, {
        questions
      });

      alert("Quiz actualizat cu succes!");
      navigate(`/professor/quiz/${id}`);

    } catch (err) {
      console.error(err);
      alert("Eroare la salvare");
    }
  };

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Se încarcă...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border">

        <h1 className="text-3xl font-bold text-gray-800">Editează Quiz</h1>

        <div className="mt-8 space-y-6">

          {/* Meta */}
          <div>
            <label className="font-medium">Titlu quiz</label>
            <input
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Descriere</label>
            <textarea
              className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Time limit */}
          <div>
            <label className="font-medium">Limită de timp</label>

            <div className="flex items-center gap-5">
              <input
                type="range"
                min={1}
                max={60}
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
                className="w-full"
              />

              <input
                type="number"
                className="w-20 p-2 border rounded-lg bg-gray-50"
                value={timeLimit}
                min={1}
                max={60}
                onChange={e => setTimeLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <hr className="my-6" />

          {/* Questions */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Întrebări</h2>

            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Adaugă întrebare
            </button>
          </div>

          <div className="space-y-8 mt-4">
            {questions.map((q, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl border relative"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
              >
                <div className="absolute left-3 top-3 text-gray-400 cursor-grab">☰</div>

                <button
                  onClick={() => deleteQuestion(index)}
                  className="absolute right-3 top-3 text-red-500"
                >
                  ✕
                </button>

                <div className="flex gap-4 ml-6">
                  <input
                    className="w-full p-3 border rounded-lg"
                    placeholder="Titlu întrebare"
                    value={q.title}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[index].title = e.target.value;
                      setQuestions(updated);
                    }}
                  />

                  <select
                    className="p-3 border rounded-lg"
                    value={q.question_type}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[index].question_type =
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
                    <div key={oIndex} className="flex items-center gap-3">

                      <input
                        type={q.question_type === "single" ? "radio" : "checkbox"}
                        name={`q-${index}`}
                        checked={opt.is_correct}
                        onChange={(e) => {
                          const updated = [...questions];

                          if (q.question_type === "single") {
                            updated[index].options.forEach(o => (o.is_correct = false));
                          }

                          updated[index].options[oIndex].is_correct =
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
                          updated[index].options[oIndex].text = e.target.value;
                          setQuestions(updated);
                        }}
                      />

                      <button
                        onClick={() => deleteOption(index, oIndex)}
                        className="text-red-500"
                      >
                        🗑
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addOption(index)}
                    className="mt-3 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
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