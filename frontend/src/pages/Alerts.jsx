import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllRequests } from "../services/requestService";
import { getSellerRequests, getUserNotifications } from "../services/propertyService";

const STATUS_META = {
  pending: {
    label: "Under Review",
    tone: "#854d0e",
    bg: "#fef9c3",
    message: "Your request has been sent and is waiting for seller response.",
  },
  requested: {
    label: "Under Review",
    tone: "#854d0e",
    bg: "#fef9c3",
    message: "Your request has been sent and is waiting for seller response.",
  },
  accepted: {
    label: "Accepted",
    tone: "#166534",
    bg: "#dcfce7",
    message: "Good news. The seller accepted your request.",
  },
  rejected: {
    label: "Rejected",
    tone: "#991b1b",
    bg: "#fee2e2",
    message: "The seller rejected your request.",
  },
  completed: {
    label: "Completed",
    tone: "#1e3a8a",
    bg: "#dbeafe",
    message: "This deal has been completed.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "#475569",
    bg: "#e2e8f0",
    message: "This request was cancelled.",
  },
  sold_alert: {
    label: "Sold/Rented",
    tone: "#b91c1c",
    bg: "#fee2e2",
    message: "A property you were following was sold/rented.",
  },
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();
  return STATUS_META[value] ? value : "pending";
};

const formatDate = (value) => {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleString();
};

const getRequestProperty = (request) => request.propertyId || request.property || {};

const getRequestPropertyId = (request) => {
  const property = getRequestProperty(request);
  if (typeof property === "string") return property;
  return property?._id || "";
};

const getRequestPropertyTitle = (request) => {
  const property = getRequestProperty(request);
  if (typeof property === "string") return "Property";
  return property?.title || "Property";
};

export default function Alerts() {
  const token = localStorage.getItem("token");
  const userEmail = (localStorage.getItem("userEmail") || "").toLowerCase();
  const userRole = (localStorage.getItem("userRole") || "buyer").toLowerCase();
  const isSellerView = userRole === "seller" || userRole === "admin";
  const isBuyerView = userRole === "buyer";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      if (!token || !userEmail) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        let customAlerts = [];
        const userId = localStorage.getItem("userId");
        if (userId) {
            try {
                const notiRes = await getUserNotifications(userId);
                const notiData = Array.isArray(notiRes.data) ? notiRes.data : [];
                customAlerts = notiData.map(n => ({
                    _id: n._id,
                    isCustomAlert: true,
                    createdAt: n.createdAt,
                    updatedAt: n.createdAt,
                    message: n.message,
                    propertyId: n.propertyId,
                    status: 'sold_alert'
                }));
            } catch (e) {
                console.warn("Failed to get custom alerts", e);
            }
        }

        if (isSellerView) {
          const res = await getSellerRequests(userEmail);
          const sellerRequests = Array.isArray(res.data?.requests)
            ? res.data.requests
            : [];

          setRequests([...sellerRequests, ...customAlerts]);
        } else {
          const res = await getAllRequests();
          const allRequests = Array.isArray(res.data) ? res.data : [];

          const mine = allRequests.filter((request) => {
            const directEmail = String(
              request.requesterEmail || "",
            ).toLowerCase();
            const buyerEmail = String(request.buyer?.email || "").toLowerCase();
            return directEmail === userEmail || buyerEmail === userEmail;
          });

          setRequests([...mine, ...customAlerts]);
        }
      } catch (networkError) {
        const localRequests = JSON.parse(localStorage.getItem("mock_requests") || "[]");
        const mine = localRequests.filter((request) => {
          const directEmail = String(
            request.requesterEmail || request.buyer?.email || "",
          ).toLowerCase();

          if (isSellerView) {
            const sellerEmail = String(request.property?.sellerEmail || "").toLowerCase();
            return sellerEmail === userEmail;
          }

          return directEmail === userEmail;
        });

        setRequests(mine);
        setError("Live alerts are unavailable right now. Showing local updates.");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [token, userEmail, isSellerView]);

  const orderedAlerts = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [requests]);

  if (!token) {
    return (
      <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "110px 24px 40px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24 }}>
          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 30, color: "#0f172a" }}>Notification Center</h1>
          <p style={{ color: "#64748b", marginTop: 0 }}>Please log in to view your alerts.</p>
          <Link to="/login" style={{ display: "inline-block", marginTop: 10, padding: "10px 18px", borderRadius: 10, background: "#0f172a", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (!isBuyerView && !isSellerView) {
    return (
      <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "110px 24px 40px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24 }}>
          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 30, color: "#0f172a" }}>Notification Center</h1>
          <p style={{ color: "#64748b", marginTop: 0 }}>Your role does not have a dedicated notification feed here.</p>
          <Link to="/dashboard" style={{ display: "inline-block", marginTop: 10, padding: "10px 18px", borderRadius: 10, background: "#0f172a", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
            Open Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top right, #e0f2fe 0%, #f8fafc 48%, #f8fafc 100%)", padding: "110px 24px 40px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34, color: "#0f172a", letterSpacing: "-0.02em" }}>Notification Center</h1>
            <p style={{ margin: "8px 0 0", color: "#64748b" }}>
              {isSellerView
                ? "New buyer requests appear here. Click any alert to jump to your dashboard review panel."
                : "Track updates on your property requests in one place."}
            </p>
          </div>
          <div style={{ background: "#0f172a", color: "#fff", borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 700 }}>
            {orderedAlerts.length} alert{orderedAlerts.length === 1 ? "" : "s"}
          </div>
        </header>

        {error && (
          <p style={{ margin: "0 0 14px", padding: "10px 12px", borderRadius: 10, border: "1px solid #fed7aa", background: "#fff7ed", color: "#9a3412" }}>
            {error}
          </p>
        )}

        {loading ? (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24 }}>
            <p style={{ margin: 0, color: "#64748b" }}>Loading alerts...</p>
          </div>
        ) : orderedAlerts.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 22, color: "#0f172a" }}>No notifications yet</h2>
            <p style={{ marginTop: 0, marginBottom: 14, color: "#64748b" }}>
              {isSellerView
                ? "You will see new buyer requests here as soon as they arrive."
                : "When you send requests from property details, updates will appear here."}
            </p>
            <Link to={isSellerView ? "/dashboard" : "/properties"} style={{ display: "inline-block", padding: "10px 18px", borderRadius: 10, background: "#0f172a", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
              {isSellerView ? "Open Dashboard" : "Explore Properties"}
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {orderedAlerts.map((request) => {
              const normalized = normalizeStatus(request.status);
              const statusMeta = STATUS_META[normalized];
              const propertyTitle = getRequestPropertyTitle(request);
              const propertyId = getRequestPropertyId(request);
              const requesterName = request.requesterName || request.buyer?.name || "Buyer";

              const message = request.isCustomAlert ? request.message : (isSellerView
                ? (normalized === "pending" || normalized === "requested"
                    ? `New buyer request from ${requesterName}. Click to review and accept/reject in dashboard.`
                    : `Request status is ${String(request.status || "pending").toUpperCase()}. Open dashboard for full details.`)
                : statusMeta.message);

              const cardLink = request.isCustomAlert ? (propertyId ? `/properties/${propertyId}` : "/properties") : (isSellerView
                ? "/dashboard?tab=requests"
                : propertyId
                  ? `/properties/${propertyId}`
                  : "/properties");

              const actionLabel = isSellerView ? "Open in Dashboard" : "View Property";

              return (
                <Link
                  key={request._id}
                  to={cardLink}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <article
                    style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 18,
                    padding: 18,
                    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 16 }}>
                        {propertyTitle}
                      </p>
                      <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 14 }}>
                        {message}
                      </p>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        padding: "6px 11px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: statusMeta.tone,
                        background: statusMeta.bg,
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
                      By {requesterName} • {formatDate(request.updatedAt || request.createdAt)}
                    </p>
                    <span style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700 }}>
                      {actionLabel}
                    </span>
                  </div>
                </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}