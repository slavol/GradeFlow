import { useState } from "react";
import api from "../api/api";
import type { LoginRequest, LoginResponse } from "../types/User";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post<LoginResponse>("auth/login", form);
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch {
      setError("Email sau parola greșită");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">

      {/* BACKGROUND GRADIENT MESH */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-20 w-72 h-72 bg-blue-300 opacity-25 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300 opacity-25 blur-3xl rounded-full"></div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl shadow-xl rounded-2xl p-10 border border-white/50">

        <h2 className="text-4xl font-bold text-gray-900 text-center mb-2">
          Intră în cont
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Bine ai revenit în <span className="text-blue-600 font-semibold">GradeFlow</span>
        </p>

        {error && (
          <p className="text-red-500 text-center font-medium mb-4">
            {error}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="ex: student@uvt.ro"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 
              focus:ring-4 focus:ring-blue-200 focus:border-blue-500 
              bg-white/80 transition"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Parola
            </label>
            <input
              type="password"
              placeholder="•••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 
              focus:ring-4 focus:ring-blue-200 focus:border-blue-500 
              bg-white/80 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl 
            shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] 
            active:scale-95 transition-all"
          >
            Intră în cont
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Nu ai cont?
          <Link to="/register" className="text-blue-600 font-medium ml-1 hover:underline">
            Creează cont
          </Link>
        </p>

      </div>
    </div>
  );
}
