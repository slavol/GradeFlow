import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/70 backdrop-blur border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
          GradeFlow
        </h1>

        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Înregistrează-te
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 mt-24">
        <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
          Evaluare modernă.  
          <br />
          <span className="text-blue-600">Rezultate instant.</span>
        </h2>

        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl">
          GradeFlow îți oferă o platformă rapidă și intuitivă pentru crearea,
          administrarea și evaluarea quiz-urilor în mediul academic.
        </p>

        <Link
          to="/register"
          className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-xl text-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform"
        >
          Începe gratuit
        </Link>

        {/* Background circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 opacity-30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-200 opacity-30 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* FEATURES SECTION */}
      <section className="mt-32 px-6 max-w-6xl mx-auto grid gap-12 md:grid-cols-3">
        <FeatureCard
          title="Creează quiz-uri ușor"
          description="Generezi întrebări cu variante multiple, într-o interfață modernă și rapidă."
          icon="📘"
        />
        <FeatureCard
          title="Răspunsuri în timp real"
          description="Studenții trimit răspunsurile instant, direct din browser."
          icon="⚡"
        />
        <FeatureCard
          title="Rezultate și statistici"
          description="Vezi scorurile imediat și analizează performanța fiecărui student."
          icon="📊"
        />
      </section>

      {/* WHY SECTION */}
      <section className="mt-32 px-6 max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-gray-900">
          De ce să alegi <span className="text-blue-600">GradeFlow</span>?
        </h3>

        <p className="text-lg text-gray-600 mt-6 leading-relaxed">
          Platforma este concepută pentru universități, profesori și studenți.  
          Simplifică evaluarea, reduce timpul de corectare și oferă o experiență academică modernă.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="mt-32 py-8 bg-gray-900 text-gray-400 text-center text-sm">
        © {new Date().getFullYear()} GradeFlow — Creat pentru educația modernă.
      </footer>
    </div>
  );
}

interface FeatureProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition cursor-default">
      <div className="text-5xl mb-4">{icon}</div>
      <h4 className="text-2xl font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-600 mt-3">{description}</p>
    </div>
  );
}
