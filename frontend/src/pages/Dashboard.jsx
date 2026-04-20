import { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import ListingForm from "../components/ListingForm";
import ListingTable from "../components/ListingTable";
import {
  getSellerRequests,
  acceptRequest,
  rejectRequest,
  createProperty,
  deleteProperty,
  getAllProperties,
  updateProperty,
  downloadRequestAgreement,
} from "../services/propertyService";

const getLocationLabel = (location) => {
  if (!location) return "Unknown location";
  if (typeof location === "string") return location;
  return (
    location.formattedAddress ||
    location.address ||
    [location.area, location.city].filter(Boolean).join(", ") ||
    "Unknown location"
  );
};

const palette = {
  pageBg: "#f3f7fb",
  pageGlow: "#e5e7eb",
  surface: "#ffffff",
  surfaceSoft: "#f7fbff",
  border: "#d8e3ee",
  text: "#10243f",
  muted: "#5f728a",
  primary: "#0f172a",
  primaryHover: "#020617",
  primarySoft: "#f1f5f9",
  success: "#0f172a",
  danger: "#0f172a",
  warning: "#0f172a",
};

const SummaryCard = ({ title, value, subtitle, loading, accent }) => (
  <article
    style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 16,
      padding: 18,
      boxShadow: "0 16px 34px rgba(16,36,63,0.06)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <span
      style={{
        position: "absolute",
        inset: "0 auto auto 0",
        width: 80,
        height: 4,
        background: accent,
      }}
    />
    <p
      style={{
        margin: 0,
        color: palette.muted,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {title}
    </p>
    <p
      style={{
        margin: "8px 0 6px",
        color: palette.text,
        fontSize: 34,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {loading ? "..." : value}
    </p>
    <p style={{ margin: 0, color: palette.muted, fontSize: 13 }}>{subtitle}</p>
  </article>
);

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const userEmail = localStorage.getItem("userEmail");
  const userRole = (localStorage.getItem("userRole") || "buyer").toLowerCase();
  const userName =
    localStorage.getItem("userName") ||
    (userEmail ? userEmail.split("@")[0] : "User");

  const canManageListings = userRole === "seller" || userRole === "admin";
  const canReviewRequests = userRole === "seller" || userRole === "admin";
  const canDeleteListing = userRole === "admin";
  const requestedTab = searchParams.get("tab");

  const getInitialTab = () => {
    if (requestedTab === "requests") return "requests";
    if (requestedTab === "listings" && canManageListings) return "listings";
    return canManageListings ? "listings" : "requests";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [propError, setPropError] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [downloadingAgreementId, setDownloadingAgreementId] = useState("");

  const totalListingsCount = properties.length;
  const activeRequestsCount = requests.filter((req) => {
    const status = String(req.status || "pending").toLowerCase();
    return status === "pending" || status === "requested";
  }).length;
  const newAlertsCount = requests.filter(
    (req) => String(req.status || "pending").toLowerCase() === "pending",
  ).length;

  const loadProperties = async () => {
    setLoadingProps(true);
    setPropError("");
    try {
      const res = await getAllProperties();
      setProperties(res.data || []);
    } catch (err) {
      setPropError("Unable to load properties.");
      console.error(err);
    } finally {
      setLoadingProps(false);
    }
  };

  const loadRequests = async () => {
    if (!userEmail || !canReviewRequests) {
      setRequests([]);
      return;
    }

    setLoadingReqs(true);
    try {
      const res = await getSellerRequests(userEmail);
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setRequests([]);
    } finally {
      setLoadingReqs(false);
    }
  };

  useEffect(() => {
    loadProperties();
    loadRequests();
  }, [userEmail, userRole]);

  useEffect(() => {
    if (!canManageListings && activeTab === "listings") {
      setActiveTab("requests");
    }
  }, [activeTab, canManageListings]);

  useEffect(() => {
    if (requestedTab === "requests") {
      setActiveTab("requests");
    } else if (requestedTab === "listings" && canManageListings) {
      setActiveTab("listings");
    }
  }, [requestedTab, canManageListings]);

  const handleCreateProperty = async (payload) => {
    setSubmitting(true);
    setPropError("");
    try {
      await createProperty(payload);
      await loadProperties();
      setShowForm(false);
    } catch (err) {
      setPropError(err?.response?.data?.message || "Failed to save property.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePropertyStatus = async (property, selectedStatus) => {
    if (!canManageListings || !property?._id) {
      return;
    }

    const normalizedStatus =
      selectedStatus === "Sold/Rented"
        ? property.propertyType === "Rent"
          ? "Rented"
          : "Sold"
        : selectedStatus;

    setStatusUpdatingId(property._id);
    setPropError("");

    try {
      await updateProperty(property._id, { status: normalizedStatus });
      await Promise.all([loadProperties(), loadRequests()]);
    } catch (err) {
      setPropError(
        err?.response?.data?.message || "Failed to update property status.",
      );
    } finally {
      setStatusUpdatingId("");
    }
  };

  const handleRequestAction = async (id, actionType) => {
    try {
      if (actionType === "accept") {
        await acceptRequest(id);
      } else if (actionType === "reject") {
        await rejectRequest(id);
      }

      await loadRequests();
      alert(`Request successfully ${actionType}ed!`);
    } catch (err) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!canDeleteListing) {
      return;
    }

    const confirmed = window.confirm("Delete this listing permanently?");
    if (!confirmed) {
      return;
    }

    setDeletingId(propertyId);
    setPropError("");

    try {
      await deleteProperty(propertyId);
      await loadProperties();
    } catch (err) {
      setPropError(err?.response?.data?.message || "Failed to delete property.");
    } finally {
      setDeletingId("");
    }
  };

  const handleDownloadAgreement = async (requestId) => {
    setDownloadingAgreementId(requestId);

    try {
      const response = await downloadRequestAgreement(requestId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agreement-${requestId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Agreement can be downloaded only after deal completion.",
      );
    } finally {
      setDownloadingAgreementId("");
    }
  };

  if (!userEmail) {
    return (
      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          background: palette.pageBg,
          padding: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <p style={{ fontSize: 18, color: palette.muted }}>
          Please log in to view your dashboard.
        </p>
        <Link
          to="/login"
          style={{
            padding: "10px 24px",
            background: palette.primary,
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (userRole === "buyer") {
    return <Navigate to="/alerts" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: `radial-gradient(circle at top right, ${palette.pageGlow} 0%, ${palette.pageBg} 40%, ${palette.pageBg} 100%)`,
        padding: "100px 24px 40px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
            padding: "24px 24px",
            borderRadius: 18,
            border: `1px solid ${palette.border}`,
            background:
              "linear-gradient(130deg, rgba(255,255,255,0.97) 0%, rgba(247,251,255,0.95) 100%)",
            boxShadow: "0 18px 42px rgba(16,36,63,0.07)",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: palette.primary,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Personal Workspace
            </p>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: palette.text,
                margin: 0,
              }}
            >
              Welcome back, {userName}
            </h1>
            <p style={{ color: palette.muted, marginTop: 6 }}>
              Logged in as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}.
              Monitor listings, incoming requests, and alerts from one place.
            </p>
          </div>
          <Link
            to="/"
            style={{
              color: palette.text,
              textDecoration: "none",
              fontWeight: 700,
              border: `1px solid ${palette.border}`,
              borderRadius: 999,
              padding: "10px 16px",
              background: palette.surface,
            }}
          >
            Back to Home
          </Link>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <SummaryCard
            title="Total Listings"
            value={totalListingsCount}
            loading={loadingProps}
            subtitle="Properties managed by you"
            accent={palette.primary}
          />
          <SummaryCard
            title="Active Requests"
            value={activeRequestsCount}
            loading={loadingReqs}
            subtitle="Open buyer conversations"
            accent={palette.success}
          />
          <SummaryCard
            title="New Alerts"
            value={newAlertsCount}
            loading={loadingReqs}
            subtitle="Pending attention items"
            accent={palette.warning}
          />
        </section>

        {propError && (
          <p
            style={{
              margin: "0 0 18px",
              borderRadius: 12,
              border: "1px solid #fda4af",
              background: "#fff1f2",
              color: palette.danger,
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {propError}
          </p>
        )}

        <div
          style={{
            display: "inline-flex",
            gap: 8,
            marginBottom: 24,
            padding: 6,
            borderRadius: 999,
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            boxShadow: "0 8px 20px rgba(16,36,63,0.05)",
          }}
        >
          {canManageListings && (
            <button
              onClick={() => setActiveTab("listings")}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: 999,
                background:
                  activeTab === "listings" ? palette.primary : "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                color: activeTab === "listings" ? "#fff" : palette.muted,
              }}
            >
              My Listings
            </button>
          )}
          <button
            onClick={() => setActiveTab("requests")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 999,
              background:
                activeTab === "requests" ? palette.primary : "transparent",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              color: activeTab === "requests" ? "#fff" : palette.muted,
            }}
          >
            {canReviewRequests ? "Buy Requests" : "My Role Access"}
          </button>
        </div>

        {activeTab === "listings" ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 20, margin: 0, color: palette.text }}>
                Property Management
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: "10px 20px",
                    background: palette.primary,
                    color: "#fff",
                    borderRadius: 10,
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add New Listing
                </button>
              )}
            </div>

            {showForm ? (
              <ListingForm
                onSubmit={handleCreateProperty}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
              />
            ) : (
              <ListingTable
                properties={properties}
                onAddNew={() => setShowForm(true)}
                loading={loadingProps}
                canUpdateStatus={canManageListings}
                statusUpdatingId={statusUpdatingId}
                onStatusChange={handleUpdatePropertyStatus}
                canDelete={canDeleteListing}
                deletingId={deletingId}
                onDelete={handleDeleteProperty}
              />
            )}
          </div>
        ) : (
          <div
            style={{
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 12px 28px rgba(16,36,63,0.05)",
            }}
          >
            <h2 style={{ fontSize: 20, margin: "0 0 18px", color: palette.text }}>
              {canReviewRequests ? "Incoming Requests" : "Buyer Dashboard"}
            </h2>

            {!canReviewRequests && (
              <div
                style={{
                  background: palette.primarySoft,
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  color: palette.primaryHover,
                }}
              >
                Buyer account does not manage listings or seller requests. Browse
                properties and send your buy/rent requests from property details.
              </div>
            )}

            <div style={{ display: "grid", gap: 16 }}>
              {loadingReqs && <p style={{ color: palette.muted }}>Loading requests...</p>}
              {requests.length === 0 && !loadingReqs && (
                <p style={{ color: palette.muted, textAlign: "center", padding: 40 }}>
                  No requests found.
                </p>
              )}

              {requests.map((req) => {
                const statusText = String(req.status || "pending");
                const statusLower = statusText.toLowerCase();

                return (
                  <div
                    key={req._id}
                    style={{
                      background: `linear-gradient(180deg, ${palette.surface} 0%, ${palette.surfaceSoft} 100%)`,
                      border: `1px solid ${palette.border}`,
                      borderRadius: 12,
                      padding: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 8px 22px rgba(16,36,63,0.04)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: palette.text,
                          marginBottom: 4,
                        }}
                      >
                        {req.property?.title || "Unknown Property"}{" "}
                        <span
                          style={{
                            fontSize: 13,
                            color: palette.muted,
                            fontWeight: 400,
                          }}
                        >
                          ({getLocationLabel(req.property?.location)})
                        </span>
                      </p>
                      <p style={{ fontSize: 14, color: "#394b63", marginBottom: 6 }}>
                        Buyer: <strong>{req.buyer?.name || req.requesterName}</strong> (
                        {req.buyer?.email || req.requesterEmail})
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: palette.muted,
                          fontStyle: "italic",
                        }}
                      >
                        "{req.message}"
                      </p>
                      <div
                        style={{
                          marginTop: 10,
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            statusLower === "accepted"
                              ? "#e2e8f0"
                              : statusLower === "rejected"
                                ? "#e2e8f0"
                                : "#e2e8f0",
                          color:
                            statusLower === "accepted"
                              ? "#0f172a"
                              : statusLower === "rejected"
                                ? "#0f172a"
                                : "#0f172a",
                        }}
                      >
                        STATUS: {statusText.toUpperCase()}
                      </div>
                    </div>

                    {statusLower === "pending" && (
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => handleRequestAction(req._id, "accept")}
                          style={{
                            padding: "9px 16px",
                            background: palette.success,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(req._id, "reject")}
                          style={{
                            padding: "9px 16px",
                            background: palette.danger,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {statusLower === "completed" && (
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => handleDownloadAgreement(req._id)}
                          disabled={downloadingAgreementId === req._id}
                          style={{
                            padding: "9px 16px",
                            background: palette.primary,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor:
                              downloadingAgreementId === req._id
                                ? "not-allowed"
                                : "pointer",
                            opacity: downloadingAgreementId === req._id ? 0.75 : 1,
                          }}
                        >
                          {downloadingAgreementId === req._id
                            ? "Preparing PDF..."
                            : "Download Agreement"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
