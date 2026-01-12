import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import EditQuizNavbar from "../../components/EditQuizNavbar";

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

  useEffect(() => {
    (async () => {
      const res = await api.get(`/professor/quiz/${id}`);
      setTitle(res.data.title);
      setDescription(res.data.description);
      setTimeLimit(res.data.time_limit);
      setQuestions(
        res.data.questions.map((q: Question, i: number) => ({
          ...q,
          position: i,
        }))
      );
      setLoading(false);
    })();
  }, []);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    const updated = [...questions];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    updated.forEach((q, i) => (q.position = i));
    setQuestions(updated);
    setDragIndex(null);
  };

  const addQuestion = () =>
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

  const deleteQuestion = (i: number) =>
    setQuestions(questions.filter((_, idx) => idx !== i));

  const addOption = (qi: number) => {
    const updated = [...questions];
    updated[qi].options.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  const deleteOption = (qi: number, oi: number) => {
    const updated = [...questions];
    updated[qi].options.splice(oi, 1);
    setQuestions(updated);
  };

  const saveQuiz = async () => {
    await api.put(`/professor/quiz/${id}`, {
      title,
      description,
      time_limit: timeLimit,
    });
    await api.put(`/professor/quiz/${id}/questions`, { questions });
    alert("Quiz actualizat!");
    navigate(`/professor/quiz/${id}`);
  };

  if (loading) return <div className="p-10 text-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <EditQuizNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Editează Quiz</h1>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              className="p-3 border rounded-lg"
              placeholder="Titlu quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              min={1}
              max={60}
              className="p-3 border rounded-lg"
              value={timeLimit}
              onChange={(e) => setTimeLimit(+e.target.value)}
            />
          </div>

          <textarea
            className="w-full mt-4 p-3 border rounded-lg"
            placeholder="Descriere"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-between items-center mt-8">
            <h2 className="text-xl font-semibold">Întrebări</h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              + Întrebare
            </button>
          </div>

          <div className="space-y-6 mt-6">
            {questions.map((q, qi) => (
              <div
                key={qi}
                draggable
                onDragStart={() => handleDragStart(qi)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(qi)}
                className="relative bg-gray-50 border rounded-xl p-5"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="cursor-grab text-gray-400">☰</span>
                  <button
                    onClick={() => deleteQuestion(qi)}
                    className="text-red-600 text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    className="flex-1 p-3 border rounded-lg"
                    placeholder="Titlu întrebare"
                    value={q.title}
                    onChange={(e) => {
                      const u = [...questions];
                      u[qi].title = e.target.value;
                      setQuestions(u);
                    }}
                  />

                  <select
                    className="p-3 border rounded-lg"
                    value={q.question_type}
                    onChange={(e) => {
                      const u = [...questions];
                      u[qi].question_type = e.target.value as any;
                      setQuestions(u);
                    }}
                  >
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>

                <div className="mt-4 space-y-3">
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-3">
                      <input
                        type={q.question_type === "single" ? "radio" : "checkbox"}
                        checked={o.is_correct}
                        onChange={() => {
                          const u = [...questions];
                          if (q.question_type === "single") {
                            u[qi].options.forEach(x => x.is_correct = false);
                          }
                          u[qi].options[oi].is_correct = !o.is_correct;
                          setQuestions(u);
                        }}
                      />
                      <input
                        className="flex-1 p-3 border rounded-lg"
                        value={o.text}
                        placeholder="Text opțiune"
                        onChange={(e) => {
                          const u = [...questions];
                          u[qi].options[oi].text = e.target.value;
                          setQuestions(u);
                        }}
                      />
                      <button
                        onClick={() => deleteOption(qi, oi)}
                        className="text-red-500"
                      >
                        🗑
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addOption(qi)}
                    className="mt-2 px-3 py-2 bg-gray-200 rounded-lg"
                  >
                    + Opțiune
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveQuiz}
            className="w-full mt-8 py-3 bg-green-600 text-white rounded-xl text-lg"
          >
            Salvează modificările
          </button>
        </div>
      </div>
    </div>
  );
}