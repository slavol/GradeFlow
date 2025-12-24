import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentJoin() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const join = async () => {
    setError("");

    if (!code.trim()) {
      setError("Introdu codul sesiunii.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/student/session/join", {
        session_code: code.trim().toUpperCase(),
      });

      navigate(`/student/session/${res.data.session_id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Cod invalid sau sesiune închisă."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <StudentNavbar />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md border">

          <h1 className="text-3xl font-bold text-center mb-4">
            Join Quiz
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Introdu codul sesiunii live pentru a începe quiz-ul.
          </p>

          {error && (
            <div className="mb-4 text-center text-red-600 font-medium">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="COD SESIUNE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && join()}
            className="w-full p-4 border rounded-xl mb-6 tracking-widest text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={join}
            disabled={loading}
            className={`w-full p-4 rounded-xl text-white text-lg font-semibold transition
              ${
                loading
                  ? "bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loading ? "Se conectează..." : "Intră în sesiune"}
          </button>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            ⬅ Înapoi la dashboard
          </button>
        </div>
      </div>
    </div>
  );
}