import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";

interface QuestionDetail {
  question_id: number;
  question_title: string;
  position: number;
  is_correct: boolean;
  selected_option_ids: number[];
  options: {
    option_id: number;
    option_text: string;
  }[];
}

export default function ProfessorStudentDetails() {
  const { sessionId, studentId } = useParams();
  const [studentEmail, setStudentEmail] = useState("");
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.get(`/professor/session/${sessionId}/results`);

      const { students, answers } = res.data;

      // 🎯 găsim studentul
      const student = students.find((s: any) => s.id === Number(studentId));
      if (student) {
        setStudentEmail(student.email);
      }

      // 🎯 extragem răspunsurile studentului
      const studentAnswers = answers[studentId!];

      if (studentAnswers) {
        const formatted = Object.values(studentAnswers).sort(
          (a: any, b: any) => a.position - b.position
        );
        setQuestions(formatted as QuestionDetail[]);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea detaliilor studentului.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Se încarcă detaliile...</div>;

  return (
    <div className="min-h-screen bg-[#f4f6fc] p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rezultate pentru student
        </h1>

        <p className="text-gray-700 text-xl font-semibold mb-6">
          {studentEmail}
        </p>

        <hr className="my-6" />

        {/* QUESTIONS */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Răspunsuri</h2>

        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.question_id}
              className="p-6 bg-gray-50 rounded-xl border shadow-sm"
            >
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                {q.position + 1}. {q.question_title}
              </h3>

              <p className="mb-2">
                <span className="font-semibold">Răspuns corect:</span>{" "}
                {q.is_correct ? (
                  <span className="text-green-600 font-semibold">DA ✔</span>
                ) : (
                  <span className="text-red-600 font-semibold">NU ✘</span>
                )}
              </p>

              <div className="space-y-2 mt-4">
                {q.options.map((opt) => {
                  const selected = q.selected_option_ids.includes(opt.option_id);
                  const correct = selected && q.is_correct;

                  return (
                    <div
                      key={opt.option_id}
                      className={`p-3 rounded-lg border ${
                        selected
                          ? correct
                            ? "bg-green-100 border-green-300"
                            : "bg-red-100 border-red-300"
                          : "bg-white"
                      }`}
                    >
                      {opt.option_text}
                      {selected && (
                        <span className="ml-2 font-bold">
                          {correct ? "✔" : "✘"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BACK BUTTON */}
        <Link
          to={`/professor/session/${sessionId}/results`}
          className="mt-10 inline-block px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
        >
          ⬅ Înapoi la rezultate
        </Link>
      </div>
    </div>
  );
}