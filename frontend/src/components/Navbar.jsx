import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const IconUser = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" />
  </svg>
);

const IconChevron = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const [scrollState, setScrollState] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem("token")));
  }, [location]);

  useEffect(() => {
    const handler = () => setScrollState(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const links = [
    { key: "home", label: "Home", to: "/" },
    { key: "buy", label: "Buy", to: "/properties?listing=sale" },
    { key: "rent", label: "Rent", to: "/properties?listing=rent" },
    { key: "alerts", label: "Alerts", to: "/dashboard?tab=alerts" },
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
  ];

  const params = new URLSearchParams(location.search);
  const listing = params.get("listing");
  const tab = params.get("tab");

  const isActiveLink = (key) => {
    if (key === "home") return location.pathname === "/";
    if (key === "buy")
      return location.pathname.startsWith("/properties") && listing !== "rent";
    if (key === "rent")
      return location.pathname.startsWith("/properties") && listing === "rent";
    if (key === "alerts")
      return location.pathname === "/dashboard" && tab === "alerts";
    if (key === "dashboard") return location.pathname === "/dashboard" && !tab;
    return false;
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        background: scrollState
          ? "rgba(248,250,252,0.76)"
          : "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(148,163,184,0.22)",
        boxShadow: scrollState
          ? "0 10px 30px rgba(15,23,42,0.08)"
          : "0 2px 10px rgba(15,23,42,0.04)",
        transition: "all 0.35s ease",
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#0f172a",
          letterSpacing: "-0.3px",
          textDecoration: "none",
        }}
      >
        SmartEstate
      </Link>
      <ul
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          listStyle: "none",
        }}
      >
        {links.map((link) => {
          const isActive = isActiveLink(link.key);

          return (
            <li key={link.key}>
              <Link
                to={link.to}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#0f172a" : "#64748b",
                  textDecoration: "none",
                  paddingBottom: 6,
                  borderBottom: isActive
                    ? "2px solid #0f172a"
                    : "2px solid transparent",
                  transition: "all 0.22s ease",
                }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <IconUser />
        </button>
        {!isAuthenticated ? (
          <Link
            to="/login"
            style={{
              background: "#0f172a",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 8px 20px rgba(15,23,42,0.22)",
            }}
          >
            Log in
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              background: "#0f172a",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(15,23,42,0.22)",
            }}
          >
            Log out
          </button>
        )}
      </div>
    </nav>
  );
}
