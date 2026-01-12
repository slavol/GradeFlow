import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import ProfessorDashboard from "./pages/Professor/Dashboard";
import CreateQuiz from "./pages/Professor/CreateQuiz";
import ViewQuiz from "./pages/Professor/ViewQuiz";
import EditQuiz from "./pages/Professor/EditQuiz";
import ProfessorLiveSession from "./pages/Professor/ProfessorLiveSession";
import SessionResults from "./pages/Professor/SessionResults";
import ProfessorSessionsHistory from "./pages/Professor/ProfessorSessionsHistory";
import ProfessorStudentDetails from "./pages/Professor/ProfessorStudentDetails";
import ProfessorLiveSessionsList from "./pages/Professor/ProfessorSessions"

import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentJoin from "./pages/Student/StudentJoin";
import StudentLiveSession from "./pages/Student/StudentLiveSession";
import StudentResults from "./pages/Student/StudentsResults";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route
          path="/professor/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <ProfessorDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/create-quiz"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <CreateQuiz />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/quiz/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <ViewQuiz />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/edit-quiz/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <EditQuiz />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/session/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <ProfessorLiveSession />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/session/:id/results"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <SessionResults />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/session/:sessionId/student/:studentId"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <ProfessorStudentDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/sessions/live"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <ProfessorLiveSessionsList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/sessions/history"
          element={
            <ProtectedRoute>
              <RoleRoute role="professor">
                <ProfessorSessionsHistory />
              </RoleRoute>
            </ProtectedRoute>
          }
        />


        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <StudentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/join"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <StudentJoin />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/session/:sessionId"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <StudentLiveSession />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/session/:sessionId/results"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <StudentResults />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}