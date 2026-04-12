import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSellerRequests, acceptRequest, rejectRequest } from "../services/propertyService";

export default function Dashboard() {
    const userEmail = localStorage.getItem("userEmail");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadRequests = async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            const res = await getSellerRequests(userEmail);
            if (res.data?.success) {
                setRequests(res.data.requests);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [userEmail]);

    const handleAction = async (id, actionType) => {
        try {
            if (actionType === "accept") await acceptRequest(id);
            else if (actionType === "reject") await rejectRequest(id);

            // Reload requests to see updated status
            loadRequests();
            alert(`Request successfully ${actionType}ed!`);
        } catch (err) {
            alert(`Failed: ${err.response?.data?.message || err.message}`);
        }
    };

    if (!userEmail) {
        return (
            <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", padding: 40, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 20 }}>
                <p style={{ fontSize: 18, color: "#64748b" }}>Please log in to view your seller dashboard.</p>
                <Link to="/login" style={{ padding: "10px 24px", background: "#0f172a", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Go to Login</Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", padding: 40 }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Seller Dashboard ({userEmail})</h1>
                    <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>← Back to Home</Link>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                    {loading && <p style={{ color: "#94a3b8" }}>Loading requests...</p>}
                    {requests.length === 0 && !loading && (
                        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No requests found for your properties.</p>
                    )}
                    {requests.map(req => (
                        <div key={req._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                                    {req.property?.title || "Unknown Property"} <span style={{ fontSize: 13, color: "#64748b", fontWeight: 400 }}>({req.property?.location})</span>
                                </p>
                                <p style={{ fontSize: 14, color: "#374151", marginBottom: 6 }}>
                                    Buyer: <strong>{req.buyer.name}</strong> ({req.buyer.email}) - Phone: {req.buyer.phone}
                                </p>
                                <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>"{req.message}"</p>
                                <div style={{
                                    marginTop: 10, display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                    background: req.status === 'accepted' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                    color: req.status === 'accepted' ? '#166534' : req.status === 'rejected' ? '#991b1b' : '#854d0e'
                                }}>
                                    STATUS: {req.status.toUpperCase()}
                                </div>
                            </div>

                            {req.status === 'pending' && (
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => handleAction(req._id, 'accept')} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                                    <button onClick={() => handleAction(req._id, 'reject')} style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
