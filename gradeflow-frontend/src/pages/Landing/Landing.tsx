export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f0f11] text-white flex flex-col items-center justify-center px-4">

      {/* background gradients */}
      <div className="absolute inset-0 blur-[120px] opacity-40">
        <div className="absolute top-0 left-[-10%] w-[40rem] h-[40rem] rounded-full bg-purple-700"></div>
        <div className="absolute bottom-0 right-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-600"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl">
        <h1 className="text-6xl font-bold tracking-tight">
          GradeFlow
        </h1>
        <p className="text-lg text-gray-300 mt-4">
          Platformă inteligentă pentru evaluări, generare automată de quiz-uri și analiză AI pentru profesori și studenți.
        </p>

        <div className="flex gap-4 justify-center mt-10">
          <a
            href="/login"
            className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="px-8 py-3 border border-white/40 backdrop-blur-xl rounded-xl hover:bg-white/10 transition"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}