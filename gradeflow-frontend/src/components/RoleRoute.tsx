import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "student" | "professor";
}) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (userRole !== role) {
    return userRole === "professor" ? (
      <Navigate to="/professor/dashboard" replace />
    ) : (
      <Navigate to="/student/dashboard" replace />
    );
  }

  return <>{children}</>;
}