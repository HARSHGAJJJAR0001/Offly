import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Restore session on mount ──────────────────────────────────────────────
  // Uses sessionStorage → clears when browser closes → shows login on fresh open
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      // Clear if token expired
      if (isTokenExpired(storedToken)) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setLoading(false);
        return;
      }
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // ── Auto-logout when JWT expires ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const ms = payload.exp * 1000 - Date.now();
      if (ms <= 0) { logout(); return; }
      const timer = setTimeout(logout, ms);
      return () => clearTimeout(timer);
    } catch { }
  }, [token]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = res.data;

      // Save to sessionStorage (clears on browser close)
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      // Force password change on first login
      if (userData.mustChangePassword) {
        navigate("/change-password");
        return;
      }

      // Redirect based on role
      if (userData.role === "admin") navigate("/admin");
      else if (userData.role === "manager") navigate("/manager");
      else navigate("/employee");

    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  // ── Update user ───────────────────────────────────────────────────────────
  const updateUser = (updated) => {
    setUser(updated);
    sessionStorage.setItem("user", JSON.stringify(updated));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isEmployee: user?.role === "employee",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};