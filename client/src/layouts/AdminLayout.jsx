import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  const { isDark } = useTheme();
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: isDark ? "linear-gradient(135deg,#0a0f1e 0%,#0d1528 40%,#0a1a2e 70%,#060d1a 100%)" : "#f0f4f8",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.08),transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 10 }}>
        <Navbar />
        <main className="main-content" style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}