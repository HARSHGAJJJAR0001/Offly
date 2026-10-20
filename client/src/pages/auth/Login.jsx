import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [typed, setTyped] = useState("");

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "manager") navigate("/manager", { replace: true });
      else navigate("/employee", { replace: true });
    }
  }, [isAuthenticated, user]);

  // Typewriter
  const words = ["HR Management", "Leave Tracking", "Team Collaboration", "People Operations"];
  const wordIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const tick = () => {
      const word = words[wordIdx.current];
      if (!deleting.current) {
        setTyped(word.slice(0, ++charIdx.current));
        if (charIdx.current === word.length) { deleting.current = true; setTimeout(tick, 1600); return; }
      } else {
        setTyped(word.slice(0, --charIdx.current));
        if (charIdx.current === 0) { deleting.current = false; wordIdx.current = (wordIdx.current + 1) % words.length; }
      }
      setTimeout(tick, deleting.current ? 55 : 85);
    };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  // ── CURSOR DOT GRID ANIMATION ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    // Grid settings
    const GAP = 38;   // gap between dots
    const RADIUS = 1.5;  // base dot radius
    const REVEAL = 130;  // how far from cursor dots light up
    const FADE_MAX = 35;   // max dots lit at full brightness

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw grid dots
      const cols = Math.ceil(W / GAP) + 1;
      const rows = Math.ceil(H / GAP) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * GAP;
          const y = r * GAP;
          const dx = x - mx;
          const dy = y - my;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < REVEAL) {
            // Inside reveal radius — light up with falloff
            const alpha = Math.pow(1 - d / REVEAL, 1.8);
            // Color shift: close = teal/cyan, far edge = purple
            const t = 1 - d / REVEAL;
            const R = Math.round(20 + (99 - 20) * (1 - t));  // teal→purple R
            const G = Math.round(184 + (102 - 184) * (1 - t));  // teal→purple G
            const B = Math.round(166 + (241 - 166) * (1 - t));  // teal→purple B

            // Outer glow ring
            if (d < REVEAL * 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, RADIUS * 2.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${R},${G},${B},${alpha * 0.15})`;
              ctx.fill();
            }

            // Main dot
            ctx.beginPath();
            ctx.arc(x, y, RADIUS + alpha * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${R},${G},${B},${alpha * 0.9})`;
            ctx.fill();

          } else {
            // Outside reveal radius — subtle base dots
            ctx.beginPath();
            ctx.arc(x, y, RADIUS * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.04)";
            ctx.fill();
          }
        }
      }

      // Draw cursor crosshair rings
      if (mx > 0 && my > 0) {
        // Ring 1
        ctx.beginPath();
        ctx.arc(mx, my, 20, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(20,184,166,0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ring 2
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(20,184,166,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(20,184,166,0.8)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { key: "admin", label: "Admin", icon: "👑", color: "#14b8a6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.25)" },
    { key: "manager", label: "Manager", icon: "💼", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)" },
    { key: "employee", label: "Employee", icon: "👤", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  ];
  const activeRole = ROLES.find(r => r.key === selectedRole);

  const inp = (isFocused) => ({
    width: "100%", padding: "13px 14px 13px 42px",
    background: isFocused ? "rgba(20,184,166,0.06)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${isFocused ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "12px", color: "#e2e8f0", fontSize: "14px",
    fontFamily: "'DM Sans',sans-serif", outline: "none",
    boxShadow: isFocused ? "0 0 0 3px rgba(20,184,166,0.1)" : "none",
    transition: "all 0.25s ease",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#060d1a",
      fontFamily: "'DM Sans',sans-serif", padding: "20px",
      overflow: "hidden", position: "relative", cursor: "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes shimmer { 0%{opacity:0.4} 50%{opacity:1} 100%{opacity:0.4} }
        .login-card  { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.1s; }
        .left-panel  { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.25s; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px)!important; }
        .role-chip:hover { transform:translateY(-2px)!important; }
        .feature-row { animation: shimmer 3s ease-in-out infinite; }
        .feature-row:nth-child(2) { animation-delay: 0.4s; }
        .feature-row:nth-child(3) { animation-delay: 0.8s; }
        .feature-row:nth-child(4) { animation-delay: 1.2s; }
      `}</style>

      {/* Canvas — full screen dot grid */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* Subtle vignette overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, #060d1a 100%)",
      }} />

      {/* Left panel — visible on large screens */}
      <div className="left-panel login-left-panel" style={{
        flex: 1, maxWidth: "460px", paddingRight: "56px", zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "52px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#14b8a6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="3" rx="1.5" fill="white" />
              <rect x="3" y="10.5" width="13" height="3" rx="1.5" fill="white" opacity="0.7" />
              <rect x="3" y="17" width="8" height="3" rx="1.5" fill="white" opacity="0.4" />
            </svg>
          </div>
          <span style={{ fontSize: "22px", fontWeight: "800", color: "#f0fdf4", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px" }}>Offly</span>
        </div>

        {/* Heading with typewriter */}
        <h1 style={{ fontSize: "44px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: "#f0fdf4", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "16px" }}>
          Smarter<br />
          <span style={{ color: "#14b8a6" }}>
            {typed}
            <span style={{ animation: "blink 1s step-end infinite" }}>|</span>
          </span>
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(148,163,184,0.65)", lineHeight: 1.75, marginBottom: "44px", maxWidth: "340px" }}>
          The all-in-one HR platform built for modern teams. Manage people, leaves and workflows in one place.
        </p>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { label: "Role-based access control", dot: "#14b8a6" },
            { label: "Smart leave management", dot: "#8b5cf6" },
            { label: "Real-time team dashboards", dot: "#06b6d4" },
            { label: "Automated email notifications", dot: "#f59e0b" },
          ].map((f, i) => (
            <div key={i} className="feature-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: f.dot, boxShadow: `0 0 8px ${f.dot}80`, flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "rgba(148,163,184,0.6)", fontWeight: "500" }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "32px", marginTop: "52px" }}>
          {[
            { num: "3", label: "User Roles" },
            { num: "100%", label: "Secure JWT" },
            { num: "24/7", label: "Always Online" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#f0fdf4", fontFamily: "'DM Serif Display',serif", letterSpacing: "-1px", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: "12px", color: "rgba(100,116,139,0.55)", fontWeight: "500", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card" style={{ zIndex: 10, width: "100%", maxWidth: "400px" }}>
        <div style={{
          background: "rgba(8,14,28,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "24px", padding: "38px 34px",
          backdropFilter: "blur(40px)",
          boxShadow: "0 0 0 1px rgba(20,184,166,0.06), 0 32px 80px rgba(0,0,0,0.7)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top shimmer line */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(20,184,166,0.6),transparent)" }} />

          {/* Inner corner accent */}
          <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", background: "radial-gradient(circle at top right, rgba(20,184,166,0.07), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100px", height: "100px", background: "radial-gradient(circle at bottom left, rgba(99,102,241,0.06), transparent 70%)", pointerEvents: "none" }} />

          {/* Header */}
          <div style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(52,211,153,0.85)", letterSpacing: "1.2px", textTransform: "uppercase" }}>All Systems Operational</span>
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: "#f0fdf4", letterSpacing: "-0.5px", marginBottom: "5px" }}>Welcome back</h2>
            <p style={{ fontSize: "13px", color: "rgba(100,116,139,0.6)", lineHeight: 1.5 }}>Select your role and sign in to continue</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>Your Role</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {ROLES.map(role => (
                <button
                  key={role.key}
                  type="button"
                  className="role-chip"
                  onClick={() => setSelectedRole(role.key)}
                  style={{
                    flex: 1, padding: "11px 4px", borderRadius: "12px", cursor: "pointer",
                    background: selectedRole === role.key ? role.bg : "rgba(255,255,255,0.025)",
                    border: `1px solid ${selectedRole === role.key ? role.border : "rgba(255,255,255,0.06)"}`,
                    color: selectedRole === role.key ? role.color : "rgba(100,116,139,0.5)",
                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                    boxShadow: selectedRole === role.key ? `0 0 20px ${role.color}18` : "none",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{role.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.3px" }}>{role.label}</span>
                  {selectedRole === role.key && <div style={{ width: "18px", height: "2px", borderRadius: "99px", background: role.color }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#fca5a5", fontWeight: "500" }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color={focused === "email" ? "#14b8a6" : "rgba(100,116,139,0.35)"} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "color 0.25s" }} />
                <input type="email" placeholder="Enter your email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  disabled={loading} style={inp(focused === "email")} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} color={focused === "password" ? "#14b8a6" : "rgba(100,116,139,0.35)"} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "color 0.25s" }} />
                <input type={showPwd ? "text" : "password"} placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  disabled={loading} style={{ ...inp(focused === "password"), paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(100,116,139,0.4)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#67e8f9"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(100,116,139,0.4)"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginTop: "-4px" }}>
              <button type="button" onClick={() => navigate("/forgot-password")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(165,180,252,0.7)", fontSize: "12.5px", fontWeight: "600", fontFamily: "'DM Sans',sans-serif", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(165,180,252,0.7)"}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !selectedRole} className="submit-btn"
              style={{
                width: "100%", padding: "14px", marginTop: "4px",
                background: loading || !selectedRole
                  ? "rgba(255,255,255,0.04)"
                  : activeRole
                    ? `linear-gradient(135deg, ${activeRole.color}dd, ${activeRole.color}aa)`
                    : "linear-gradient(135deg,#14b8a6,#06b6d4)",
                border: `1px solid ${!selectedRole ? "rgba(255,255,255,0.06)" : activeRole ? activeRole.color + "40" : "transparent"}`,
                borderRadius: "12px",
                color: loading || !selectedRole ? "rgba(255,255,255,0.2)" : "#fff",
                fontSize: "14.5px", fontWeight: "700",
                cursor: loading || !selectedRole ? "default" : "pointer",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: !selectedRole || loading ? "none" : `0 8px 32px ${activeRole?.color}35`,
                transition: "all 0.3s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
            >
              {loading ? (
                <><div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />Signing in…</>
              ) : !selectedRole ? (
                "Select a role to continue"
              ) : (
                <>Sign in as {activeRole?.label} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "22px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34d399", animation: "pulse 2.5s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(100,116,139,0.35)", letterSpacing: "0.3px" }}>Secured with JWT · End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}