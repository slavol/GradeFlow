import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b10] text-white">

      <motion.div
        className="absolute w-[700px] h-[700px] bg-purple-700 rounded-full blur-[180px] opacity-40"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ top: "-20%", left: "-20%" }}
      />

      <motion.div
        className="absolute w-[600px] h-[600px] bg-purple-600 rounded-full blur-[180px] opacity-30"
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -60, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ bottom: "-20%", right: "-20%" }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] bg-purple-500 rounded-full blur-[160px] opacity-25"
        animate={{
          x: [0, 60, -60, 0],
          y: [0, -40, 40, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ top: "30%", left: "40%" }}
      />

      <header className="relative z-10 max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/vite.svg" className="w-10 h-10" />
          <span className="text-2xl font-bold">GradeFlow</span>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 border border-white/30 rounded-xl hover:bg-white/10 transition"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-32">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl sm:text-7xl font-extrabold"
        >
          Evaluări inteligente.
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Fără stres.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 max-w-2xl text-gray-300 text-lg"
        >
          Quiz-uri live, clasamente instant și analiză completă pentru profesori și studenți.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex gap-4"
        >
          <Link
            to="/login"
            className="px-8 py-4 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition shadow-xl"
          >
            🚀 Începe acum
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 border border-white/30 rounded-xl hover:bg-white/10 transition"
          >
            Creează cont
          </Link>
        </motion.div>
      </main>
    </div>
  );
}