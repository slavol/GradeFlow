import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-xl border border-gray-200">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-gray-900 text-center">
          Student Dashboard
        </h1>

        <p className="text-gray-600 text-center mt-2">
          Bine ai venit! Poți intra într-o sesiune de quiz folosind codul oferit de profesor.
        </p>

        {/* JOIN BUTTON */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/student/join"
            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl shadow hover:bg-blue-700 transition"
          >
            🚀 Join Quiz
          </Link>
        </div>

        {/* LOGOUT */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          În curând: istoricul rezultatelor & recomandări AI 😎
        </div>

      </div>
    </div>
  );
}