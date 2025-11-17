import { useState } from "react";
import api from "../../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      if (res.data.role === "professor") {
        window.location.href = "/professor/dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch {
      setError("Email sau parolă incorectă");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f11] text-white px-4 relative">

      {/* glowing background */}
      <div className="absolute inset-0 blur-[90px] opacity-40">
        <div className="absolute left-[20%] top-[10%] w-[25rem] h-[25rem] bg-blue-700 rounded-full"></div>
        <div className="absolute right-[20%] bottom-[10%] w-[25rem] h-[25rem] bg-purple-700 rounded-full"></div>
      </div>

      <form
        onSubmit={login}
        className="relative z-10 w-full max-w-sm p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
      >
        <h2 className="text-3xl font-semibold text-center">Login</h2>

        {error && <p className="text-red-400 mt-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mt-6 p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parolă"
          className="w-full mt-4 p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition font-medium"
        >
          Intră
        </button>
      </form>
    </div>
  );
}