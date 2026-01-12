import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const navigate = useNavigate();

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", { email, password, role });
      setDone(true);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "A apărut o eroare. Încearcă din nou."
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b10] text-white flex items-center justify-center px-4">

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

      <motion.form
        onSubmit={register}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl
                   border border-white/20 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Creează cont
        </h2>

        <p className="text-gray-300 text-center mb-6">
          Alătură-te platformei GradeFlow
        </p>

        {done && (
          <p className="mb-4 text-green-400 text-center font-medium">
            Cont creat ✔ Redirecționare către login…
          </p>
        )}

        {error && (
          <p className="mb-4 text-red-400 text-center font-medium">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full mb-4 p-3 rounded-xl bg-white/10 border border-white/20
                     text-white placeholder-gray-400 outline-none
                     focus:border-purple-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parolă"
          required
          className="w-full mb-4 p-3 rounded-xl bg-white/10 border border-white/20
                     text-white placeholder-gray-400 outline-none
                     focus:border-purple-500 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl bg-white/10 border border-white/20
                     text-white outline-none focus:border-purple-500"
        >
          <option className="text-black" value="student">
            Student
          </option>
          <option className="text-black" value="professor">
            Profesor
          </option>
        </select>

        <button
          type="submit"
          disabled={done}
          className={`w-full py-3 rounded-xl font-semibold shadow-xl transition
            ${
              done
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
        >
          Creează cont
        </button>
      </motion.form>
    </div>
  );
}