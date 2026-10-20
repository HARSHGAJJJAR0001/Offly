import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0a0f1e",
        flexDirection: "column", gap: "16px",
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          border: "3px solid rgba(20,184,166,0.15)",
          borderTopColor: "#14b8a6",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: "rgba(100,116,139,0.5)", fontSize: "13px", fontFamily: "DM Sans, sans-serif" }}>
          Loading…
        </p>
      </div>
    );
  }

  // Not logged in → go to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role check — if user's role is not in allowedRoles → redirect to THEIR home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to correct dashboard based on actual role
    const correctHome =
      user?.role === "admin" ? "/admin" :
        user?.role === "manager" ? "/manager" : "/employee";

    return <Navigate to={correctHome} replace />;
  }

  return children;
}