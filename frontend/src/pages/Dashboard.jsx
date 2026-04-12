import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ListingForm from "../components/ListingForm";
import ListingTable from "../components/ListingTable";
import { getSellerRequests, acceptRequest, rejectRequest, createProperty, getAllProperties } from "../services/propertyService";

export default function Dashboard() {
  const userEmail = localStorage.getItem("userEmail");
  const [activeTab, setActiveTab] = useState("listings"); // "listings" or "requests"

  // Property Management States
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propError, setPropError] = useState("");

  // Request Management States
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);

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
    if (!userEmail) return;
    setLoadingReqs(true);
    try {
      const res = await getSellerRequests(userEmail);
      if (res.data?.success) {
        setRequests(res.data.requests);
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
  }, [userEmail]);

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

  const handleRequestAction = async (id, actionType) => {
    try {
      if (actionType === "accept") await acceptRequest(id);
      else if (actionType === "reject") await rejectRequest(id);
      loadRequests();
      alert(`Request successfully ${actionType}ed!`);
    } catch (err) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!userEmail) {
    return (
      <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", padding: 40, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: 18, color: "#64748b" }}>Please log in to view your dashboard.</p>
        <Link to="/login" style={{ padding: "10px 24px", background: "#0f172a", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", padding: "100px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", margin: 0 }}>Dashboard</h1>
            <p style={{ color: "#64748b", marginTop: 4 }}>Manage your listings and buyer requests</p>
          </div>
          <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>← Back to Home</Link>
        </header>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30, borderBottom: "1px solid #e2e8f0" }}>
          <button
            onClick={() => setActiveTab("listings")}
            style={{ padding: "12px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, color: activeTab === 'listings' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'listings' ? '3px solid #0f172a' : 'none' }}>
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            style={{ padding: "12px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, color: activeTab === 'requests' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'requests' ? '3px solid #0f172a' : 'none' }}>
            Buy Requests
          </button>
        </div>

        {activeTab === "listings" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, margin: 0 }}>Property Management</h2>
              {!showForm && (
                <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", background: "#0f172a", color: "#fff", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer" }}>+ Add New Listing</button>
              )}
            </div>
            {showForm ? (
              <ListingForm onSubmit={handleCreateProperty} onCancel={() => setShowForm(false)} submitting={submitting} />
            ) : (
              <ListingTable properties={properties} onAddNew={() => setShowForm(true)} loading={loadingProps} />
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Incoming Requests</h2>
            <div style={{ display: "grid", gap: 16 }}>
              {loadingReqs && <p>Loading requests...</p>}
              {requests.length === 0 && !loadingReqs && <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No requests found.</p>}
              {requests.map(req => (
                <div key={req._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                      {req.property?.title || "Unknown Property"} <span style={{ fontSize: 13, color: "#64748b", fontWeight: 400 }}>({req.property?.location})</span>
                    </p>
                    <p style={{ fontSize: 14, color: "#374151", marginBottom: 6 }}>
                      Buyer: <strong>{req.buyer?.name || req.requesterName}</strong> ({req.buyer?.email || req.requesterEmail})
                    </p>
                    <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>"{req.message}"</p>
                    <div style={{
                      marginTop: 10, display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: req.status.toLowerCase() === 'accepted' ? '#dcfce7' : req.status.toLowerCase() === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: req.status.toLowerCase() === 'accepted' ? '#166534' : req.status.toLowerCase() === 'rejected' ? '#991b1b' : '#854d0e'
                    }}>
                      STATUS: {req.status.toUpperCase()}
                    </div>
                  </div>
                  {req.status.toLowerCase() === 'pending' && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => handleRequestAction(req._id, 'accept')} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                      <button onClick={() => handleRequestAction(req._id, 'reject')} style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
