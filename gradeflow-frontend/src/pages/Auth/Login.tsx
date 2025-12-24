import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

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
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b10] text-white flex items-center justify-center px-4">

      {/* ===== MOVING PURPLE BLOBS ===== */}
      <motion.div
        className="absolute w-[700px] h-[700px] bg-purple-700 rounded-full blur-[180px] opacity-40"
        animate={{ x: [0, 120, -80, 0], y: [0, -100, 80, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        style={{ top: "-20%", left: "-20%" }}
      />

      <motion.div
        className="absolute w-[600px] h-[600px] bg-purple-600 rounded-full blur-[180px] opacity-30"
        animate={{ x: [0, -140, 100, 0], y: [0, 120, -80, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ bottom: "-20%", right: "-20%" }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] bg-purple-500 rounded-full blur-[160px] opacity-25"
        animate={{ x: [0, 80, -80, 0], y: [0, -60, 60, 0] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        style={{ top: "30%", left: "40%" }}
      />

      {/* ===== LOGIN CARD ===== */}
      <motion.form
        onSubmit={login}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl
                   border border-white/20 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-2">Login</h2>
        <p className="text-gray-300 text-center mb-6">
          Intră în contul tău GradeFlow
        </p>

        {error && (
          <p className="mb-4 text-red-400 text-center font-medium">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-xl bg-white/10 border border-white/20
                     text-white placeholder-gray-400 outline-none focus:border-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parolă"
          className="w-full mb-6 p-3 rounded-xl bg-white/10 border border-white/20
                     text-white placeholder-gray-400 outline-none focus:border-purple-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700
                     transition font-semibold shadow-xl"
        >
          Intră
        </button>
      </motion.form>
    </div>
  );
}