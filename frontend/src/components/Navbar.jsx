import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const [scrollState, setScrollState] = useState(false);
  const [showEmiDropdown, setShowEmiDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [userRole, setUserRole] = useState(
    (localStorage.getItem("userRole") || "buyer").toLowerCase(),
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem("token")));
    setUserRole((localStorage.getItem("userRole") || "buyer").toLowerCase());
  }, [location]);

  useEffect(() => {
    const handler = () => setScrollState(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserRole("buyer");
    navigate("/login");
  };

  const canUseDashboard = userRole === "seller" || userRole === "admin";

  const links = [
    { key: "home", label: "Home", to: "/" },
    { key: "buy", label: "Buy", to: "/properties" },
    { key: "rent", label: "Rent", to: "/properties?listing=rent" },
    { key: "alerts", label: "Alerts", to: "/alerts" },
    { key: "emi", label: "EMI Calculator", to: "#" },
    ...(canUseDashboard
      ? [{ key: "dashboard", label: "Dashboard", to: "/dashboard" }]
      : []),
  ];

  const params = new URLSearchParams(location.search);
  const listing = params.get("listing");

  const isActiveLink = (key) => {
    if (key === "home") return location.pathname === "/";
    if (key === "buy")
      return location.pathname.startsWith("/properties") && listing !== "rent";
    if (key === "rent")
      return location.pathname.startsWith("/properties") && listing === "rent";
    if (key === "alerts") return location.pathname === "/alerts";
    if (key === "emi")
      return (
        location.pathname === "/emi-calculator" ||
        location.pathname === "/emi-calculator-currency"
      );
    if (key === "dashboard") return location.pathname === "/dashboard";
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
        padding: "0 30px",
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
          margin: 0,
          padding: 0,
        }}
      >
        {links.map((link) => {
          const isActive = isActiveLink(link.key);

          if (link.key === "emi") {
            return (
              <li
                key={link.key}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={() => setShowEmiDropdown(true)}
                onMouseLeave={() => setShowEmiDropdown(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowEmiDropdown((prev) => !prev)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#0f172a" : "#64748b",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    paddingBottom: 6,
                    lineHeight: "1",
                    height: "auto",
                    borderBottom: isActive
                      ? "2px solid #0f172a"
                      : "2px solid transparent",
                    transition: "all 0.22s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {link.label}
                  <IconChevron />
                </button>

                {showEmiDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      minWidth: 260,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    <Link
                      to="/emi-calculator"
                      onClick={() => setShowEmiDropdown(false)}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#0f172a",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      EMI Calculator
                    </Link>

                    <Link
                      to="/emi-calculator-currency"
                      onClick={() => setShowEmiDropdown(false)}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#0f172a",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                      }}
                    >
                      EMI Calculator with Currency Conversion
                    </Link>
                  </div>
                )}
              </li>
            );
          }

          return (
            <li
              key={link.key}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Link
                to={link.to}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#0f172a" : "#64748b",
                  textDecoration: "none",
                  paddingBottom: 6,
                  lineHeight: "1",
                  borderBottom: isActive
                    ? "2px solid #0f172a"
                    : "2px solid transparent",
                  transition: "all 0.22s ease",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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