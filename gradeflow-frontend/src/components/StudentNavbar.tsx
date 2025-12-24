import { useNavigate } from "react-router-dom";

export default function StudentNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <div
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src="/vite.svg"
            alt="GradeFlow"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-gray-900">
            GradeFlow
          </span>
        </div>

        {/* ACTIONS */}
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}