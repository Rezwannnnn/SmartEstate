import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPropertyById, sendBuyRequest } from "../services/propertyService";

export default function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getPropertyById(id);
                if (res.data?.success) setProperty(res.data.property);
            } catch (err) {
                console.error(err);
            } finally { setLoading(false); }
        };
        load();
    }, [id]);

    const handleRequest = async () => {
        try {
            await sendBuyRequest({
                propertyId: property._id,
                buyerName: "Test Buyer",
                buyerEmail: "buyer@test.com",
                buyerPhone: "123456789",
                message: `I am highly interested in this property!`
            });
            alert("Request successfully submitted to the seller dashboard!");
        } catch (err) {
            alert("Failed to submit request.");
        }
    };

    if (loading) return <div style={{ padding: 100, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Loading Property...</div>;
    if (!property) return <div style={{ padding: 100, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Property not found.</div>;

    const isAvailable = !property.status || property.status === 'available';

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc" }}>
            <div style={{ padding: "24px 60px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link to="/" style={{ textDecoration: "none", color: "#3b82f6", fontWeight: 700 }}>← Back to SmartEstate Search</Link>
                <h2 style={{ fontSize: 22, color: "#0f172a", margin: 0, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>SmartEstate</h2>
            </div>

            <div style={{ maxWidth: 1000, margin: "40px auto", background: "#fff", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(15,23,42,0.06)" }}>
                <img src={property.image} alt={property.title} style={{ width: "100%", height: 500, objectFit: "cover" }} />

                <div style={{ padding: 40 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                            <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, display: "inline-block" }}>
                                {property.type}
                            </span>
                            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{property.title}</h1>
                            <p style={{ fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                                📍 {property.location}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 32, fontWeight: 700, color: "#3b82f6", margin: 0 }}>$ {property.price.toLocaleString()}</p>
                            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>+ Taxes & Fees</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 32, padding: "24px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", marginBottom: 32 }}>
                        <div>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Bedrooms</p>
                            <p style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{property.bedrooms || 3} Beds</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Bathrooms</p>
                            <p style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{property.bathrooms || 2} Baths</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Area Size</p>
                            <p style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{property.area || 1200} Sq Ft</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: 24, borderRadius: 16 }}>
                        <div>
                            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 4 }}>Listed directly by</p>
                            <p style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{property.sellerName || "SmartEstate Local Agent"}</p>
                        </div>

                        {!isAvailable ? (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: property.status === 'rented' ? "#f59e0b" : "#ef4444", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px 32px", borderRadius: 12, minWidth: 200 }}>
                                ALREADY {property.status.toUpperCase()}
                            </span>
                        ) : (
                            <button
                                onClick={handleRequest}
                                style={{ background: "#0f172a", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", minWidth: 200, transition: "background 0.2s" }}
                            >
                                Send {property.type === 'Rent' ? 'Rent' : 'Buy'} Request
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
