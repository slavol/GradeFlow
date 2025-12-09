import { useState } from "react";
import api from "../../api/api";

export default function StudentJoin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const join = async () => {
    setError("");

    if (!code.trim()) {
      setError("Introdu codul sesiunii!");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/student/session/join", {
        session_code: code.trim().toUpperCase(),
      });

      const sessionId = res.data.session_id;
      window.location.href = `/student/session/${sessionId}`;

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Cod invalid sau sesiune închisă.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">
          Join Quiz
        </h1>

        {error && (
          <p className="mb-4 text-red-600 font-medium text-center">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Cod sesiune"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && join()}
          className="w-full p-3 border rounded-xl mb-4 tracking-widest text-center text-xl"
        />

        <button
          onClick={join}
          disabled={loading}
          className={`w-full p-3 rounded-xl text-white 
            ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loading ? "Se conectează..." : "Intră în sesiune"}
        </button>

      </div>
    </div>
  );
}