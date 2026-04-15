import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { apiClient } from "@/lib/api";

function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#06080C" }}>
      <div className="animate-spin rounded-full h-7 w-7" style={{ borderWidth: "1.5px", borderStyle: "solid", borderColor: "rgba(26,198,71,0.15)", borderTopColor: "#1AC647" }} />
    </div>
  );
}

/** Rotas protegidas: redireciona para /login se não autenticado */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    apiClient
      .getCurrentUser()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") return <AuthSpinner />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Rotas de convidado: redireciona para /employees se já autenticado */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    apiClient
      .getCurrentUser()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") return <AuthSpinner />;
  if (status === "authenticated") return <Navigate to="/employees" replace />;
  return <>{children}</>;
}
