import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import ProfessorNavbar from "../../components/ProfessorNavbar";

interface Session {
  id: number;
  quiz_id: number;
  professor_id: number;
  session_code: string;
  status: "active" | "closed";
  created_at: string;
}

interface Student {
  student_session_id: number;
  student_id: number;
  email: string;
  score: number;
  completed: boolean;
}

export default function ProfessorLiveSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    try {
      const res = await api.get(`/professor/session/${id}`);

      setSession(res.data.session);
      setStudents(res.data.students);
      setLoading(false);

      if (res.data.session.status === "closed") {
        navigate(`/professor/session/${id}/results`);
      }
    } catch (err: any) {
      console.error("LOAD SESSION ERROR:", err);

      if (err?.response?.status === 404) {
        alert("Sesiunea nu există.");
        navigate("/professor/dashboard");
      }
    }
  };

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const closeSession = async () => {
    if (!confirm("Sigur vrei să închizi sesiunea?")) return;

    try {
      await api.post(`/professor/session/${id}/close`);
      navigate(`/professor/session/${id}/results`);
    } catch (err) {
      console.error(err);
      alert("Eroare la închiderea sesiunii");
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <ProfessorNavbar />
        <div className="p-10 text-center text-gray-600">
          Se încarcă sesiunea…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <ProfessorNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Sesiune live
          </h1>
          <p className="text-gray-600">
            Monitorizează studenții conectați în timp real
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <InfoCard label="Cod sesiune" value={session.session_code} mono />
          <InfoCard
            label="Status"
            value={session.status === "active" ? "Activă" : "Închisă"}
            status={session.status}
          />
          <InfoCard
            label="Studenți conectați"
            value={students.length}
          />
        </div>

        <div className="bg-white rounded-2xl shadow border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Studenți conectați
          </h2>

          {students.length === 0 ? (
            <p className="text-gray-500">
              Niciun student conectat încă.
            </p>
          ) : (
            <ul className="divide-y">
              {students.map((s) => (
                <li
                  key={s.student_session_id}
                  className="py-3 flex items-center justify-between"
                >
                  <span className="text-gray-800">{s.email}</span>

                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      s.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.completed ? "Finalizat" : "În desfășurare"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={closeSession}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            ⛔ Închide sesiunea
          </button>

          <button
            onClick={() => navigate("/professor/dashboard")}
            className="flex-1 px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            ⬅ Înapoi la dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  status,
  mono,
}: {
  label: string;
  value: any;
  status?: "active" | "closed";
  mono?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border p-5">
      <p className="text-gray-600 text-sm">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          status === "active"
            ? "text-green-600"
            : status === "closed"
            ? "text-red-600"
            : "text-blue-600"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}