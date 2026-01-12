import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateQuizNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        <div
          onClick={() => navigate("/professor/dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/vite.svg" alt="GradeFlow" className="w-7 h-7" />
          <span className="font-bold text-lg text-gray-900 hidden sm:block">
            GradeFlow
          </span>
        </div>

        <button
          onClick={() => navigate("/professor/dashboard")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="hidden sm:block">Dashboard</span>
        </button>
      </div>
    </nav>
  );
}