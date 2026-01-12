import { Link, useNavigate } from "react-router-dom";

export default function ProfessorNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        <Link
          to="/professor/dashboard"
          className="flex items-center gap-2"
        >
          <img src="/vite.svg" className="w-7 h-7" />
          <span className="font-bold text-lg hidden sm:block">
            GradeFlow
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={logout}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}