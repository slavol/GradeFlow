import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import ProfessorDashboard from "./pages/Professor/Dashboard";
import CreateQuiz from "./pages/Professor/CreateQuiz";
import ViewQuiz from "./pages/Professor/ViewQuiz"; 
import EditQuiz from "./pages/Professor/EditQuiz";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Professor */}
        <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        <Route path="/professor/create-quiz" element={<CreateQuiz />} />
        <Route path="/professor/quiz/:id" element={<ViewQuiz />} />
        <Route path="/professor/edit-quiz/:id" element={<EditQuiz />} /> 
      </Routes>
    </BrowserRouter>
  );
}