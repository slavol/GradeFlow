import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function ProfessorLiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    try {
      const res = await api.get(`/professor/session/${id}`);
      setSession(res.data.session);
      setStudents(res.data.students);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea sesiunii");
    }
  };

  useEffect(() => {
    loadSession();

    const interval = setInterval(loadSession, 2000);
    return () => clearInterval(interval);
  }, []);

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

  if (loading) return <div className="p-10 text-center">Se încarcă sesiunea...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow border">

        <h1 className="text-3xl font-bold mb-4">Sesiune live</h1>

        <div className="bg-gray-100 p-4 rounded-xl mb-6">
          <p>Cod sesiune: <strong>{session.session_code}</strong></p>
          <p>Status: <strong>{session.status}</strong></p>
          <p>Studenți conectați: <strong>{students.length}</strong></p>
        </div>

        <h2 className="text-2xl font-semibold mb-2">Studenți conectați</h2>

        <div className="bg-white p-4 border rounded-xl mb-6">
          {students.length === 0 && (
            <p className="text-gray-500">Niciun student conectat încă.</p>
          )}

          {students.map((s) => (
            <p key={s.id} className="py-1 border-b last:border-b-0">
              {s.email}
            </p>
          ))}
        </div>

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