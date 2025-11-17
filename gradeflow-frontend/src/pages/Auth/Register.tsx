import { useState } from "react";
import api from "../../api/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [done, setDone] = useState(false);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/auth/register", { email, password, role });
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f11] text-white px-4 relative">

      {/* gradients */}
      <div className="absolute inset-0 blur-[100px] opacity-40">
        <div className="absolute top-[20%] left-[15%] w-[25rem] h-[25rem] bg-fuchsia-600 rounded-full"></div>
        <div className="absolute bottom-[20%] right-[15%] w-[25rem] h-[25rem] bg-blue-600 rounded-full"></div>
      </div>

      <form
        onSubmit={register}
        className="relative z-10 w-full max-w-sm p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
      >
        <h2 className="text-3xl font-semibold text-center">Creează cont</h2>

        {done && (
          <p className="text-green-300 text-center mt-3">Cont creat! Acum te poți loga.</p>
        )}

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

        <select
          className="w-full mt-4 p-3 bg-white/10 border border-white/20 rounded-xl text-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option className="text-black" value="student">Student</option>
          <option className="text-black" value="professor">Profesor</option>
        </select>

        <button
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition font-medium"
        >
          Creează cont
        </button>
      </form>
    </div>
  );
}