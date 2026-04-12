import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (email && password && name) {
        navigate("/login");
      }
    } catch (err) {
      setMessage("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <section style={{ position: "relative", minHeight: "100vh" }}>
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1920&auto=format&fit=crop"
          alt="Contemporary interior"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(15,23,42,0.55), rgba(15,23,42,0.2))" }} />
      </section>

      <section style={{ display: "grid", placeItems: "center", padding: 20, background: "#f8fafc" }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420, border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, background: "#fff" }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>Create account</h1>
          <p style={{ marginTop: 8, color: "#64748b" }}>Start your property journey with SmartEstate.</p>

          <label style={{ display: "block", marginTop: 14, fontSize: 13 }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", marginTop: 6, height: 42, borderRadius: 10, border: "1px solid #cbd5e1", padding: "0 12px" }}
          />

          <label style={{ display: "block", marginTop: 14, fontSize: 13 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginTop: 6, height: 42, borderRadius: 10, border: "1px solid #cbd5e1", padding: "0 12px" }}
          />

          <label style={{ display: "block", marginTop: 14, fontSize: 13 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", marginTop: 6, height: 42, borderRadius: 10, border: "1px solid #cbd5e1", padding: "0 12px" }}
          />

          {message && <p style={{ marginTop: 10, color: "#dc2626", fontSize: 13 }}>{message}</p>}

          <button
            disabled={loading}
            style={{ marginTop: 16, width: "100%", height: 44, border: "none", borderRadius: 999, background: "#0f172a", color: "white", fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Creating..." : "Sign up"}
          </button>

          <p style={{ marginTop: 14, fontSize: 14, color: "#64748b" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
