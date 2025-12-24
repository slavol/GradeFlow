import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";
import ProfessorNavbar from "../../components/ProfessorNavbar";

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
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/professor/session/${sessionId}/results`);
      const student = res.data.students.find(
        (s: any) => s.id === Number(studentId)
      );
      setEmail(student?.email || "");

      const answers = res.data.answers[studentId!];
      if (answers) {
        setQuestions(
          Object.values(answers).sort(
            (a: any, b: any) => a.position - b.position
          ) as QuestionDetail[]
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-10">Se încarcă…</div>;

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Rezultate student</h1>
        <p className="text-gray-700 font-semibold mb-6">{email}</p>

        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.question_id}
              className="bg-white p-6 rounded-xl shadow border"
            >
              <h2 className="font-semibold text-lg mb-2">
                {q.position + 1}. {q.question_title}
              </h2>

              <p className="mb-4">
                Rezultat:{" "}
                <span
                  className={
                    q.is_correct
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {q.is_correct ? "CORECT ✔" : "GREȘIT ✘"}
                </span>
              </p>

              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = q.selected_option_ids.includes(
                    opt.option_id
                  );
                  return (
                    <div
                      key={opt.option_id}
                      className={`p-3 rounded-lg border ${
                        selected
                          ? q.is_correct
                            ? "bg-green-100 border-green-300"
                            : "bg-red-100 border-red-300"
                          : "bg-white"
                      }`}
                    >
                      {opt.option_text}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Link
          to={`/professor/session/${sessionId}/results`}
          className="inline-block mt-8 px-5 py-3 bg-gray-300 rounded-xl"
        >
          ⬅ Înapoi la rezultate
        </Link>
      </div>
    </div>
  );
}