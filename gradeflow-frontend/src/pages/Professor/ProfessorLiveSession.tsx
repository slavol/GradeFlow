import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

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
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // LOAD SESSION
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
  }, []);

  // CLOSE SESSION
  const closeSession = async () => {
    if (!confirm("Sigur vrei să închizi sesiunea?")) return;

    try {
      await api.post(`/professor/session/${id}/close`);
      alert("Sesiunea a fost închisă!");
      navigate(`/professor/session/${id}/results`);
    } catch (err) {
      console.error(err);
      alert("Eroare la închiderea sesiunii");
    }
  };

  if (loading || !session)
    return <div className="p-10 text-center">Se încarcă sesiunea...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow border">

        <h1 className="text-3xl font-bold mb-4">Sesiune live</h1>

        {/* SESSION INFO */}
        <div className="bg-gray-100 p-4 rounded-xl mb-6">
          <p>Cod sesiune: <strong>{session.session_code}</strong></p>
          <p>
            Status:{" "}
            <strong className={session.status === "active" ? "text-green-600" : "text-red-600"}>
              {session.status}
            </strong>
          </p>
          <p>Studenți conectați: <strong>{students.length}</strong></p>
        </div>

        {/* STUDENT LIST */}
        <h2 className="text-2xl font-semibold mb-2">Studenți conectați</h2>

        <div className="bg-white p-4 border rounded-xl mb-6">
          {students.length === 0 ? (
            <p className="text-gray-500">Niciun student conectat încă.</p>
          ) : (
            students.map((s) => (
              <p key={s.student_session_id} className="py-1 border-b last:border-b-0">
                {s.email}
              </p>
            ))
          )}
        </div>

        {/* CLOSE SESSION BUTTON */}
        <button
          onClick={closeSession}
          className="px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          ⛔ Închide sesiunea
        </button>

      </div>
    </div>
  );
}