<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../services/propertyService";
import { createRequest } from "../services/requestService";

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = useState({
    requesterName: "",
    requesterEmail: "",
    offerAmount: "",
    message: "",
  });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await getPropertyById(id);
        setProperty(res.data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    setRequestForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setFeedback("");

    try {
      await createRequest({
        propertyId: id,
        requesterName: requestForm.requesterName,
        requesterEmail: requestForm.requesterEmail,
        offerAmount: Number(requestForm.offerAmount),
        message: requestForm.message,
      });

      setFeedback("Request submitted successfully.");
      setRequestForm({
        requesterName: "",
        requesterEmail: "",
        offerAmount: "",
        message: "",
      });
    } catch (error) {
      setFeedback(error.response?.data?.message || "Failed to submit request.");
    }
  };

  if (loading)
    return (
      <main style={{ padding: "100px 40px" }}>
        <p>Loading property...</p>
      </main>
    );
  if (!property)
    return (
      <main style={{ padding: "100px 40px" }}>
        <p>Property not found.</p>
      </main>
    );

  return (
    <main style={{ padding: "100px 40px 40px" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 30 }}
      >
        <section>
          <h1 style={{ marginTop: 0 }}>{property.title}</h1>
          <p style={{ color: "#64748b", marginBottom: 16 }}>
            {property.location?.formattedAddress ||
              property.location?.address ||
              property.location}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {(property.images?.length
              ? property.images
              : [
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
                ]
            ).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title}-${index}`}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 14,
                  display: "block",
                }}
              />
            ))}
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Property Specifications</h2>
            <p>
              <strong>Price:</strong> ৳ {property.price}
            </p>
            <p>
              <strong>Type:</strong> {property.propertyType}
            </p>
            <p>
              <strong>Bedrooms:</strong> {property.bedrooms}
            </p>
            <p>
              <strong>Bathrooms:</strong> {property.bathrooms}
            </p>
            <p>
              <strong>Size:</strong> {property.size} sqft
            </p>
            <p>
              <strong>Status:</strong> {property.status}
            </p>
            <p>
              <strong>Description:</strong> {property.description}
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Owner Details</h2>
            <p>
              <strong>Name:</strong> {property.owner?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {property.owner?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {property.owner?.phone || "N/A"}
            </p>
          </div>
        </section>

        <aside>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 20,
              position: "sticky",
              top: 90,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Send Buy/Rent Request</h2>

            <form onSubmit={handleSubmitRequest}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Your Name
              </label>
              <input
                type="text"
                name="requesterName"
                value={requestForm.requesterName}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <label style={{ display: "block", marginBottom: 6 }}>
                Your Email
              </label>
              <input
                type="email"
                name="requesterEmail"
                value={requestForm.requesterEmail}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <label style={{ display: "block", marginBottom: 6 }}>
                Offer Amount
              </label>
              <input
                type="number"
                name="offerAmount"
                value={requestForm.offerAmount}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <label style={{ display: "block", marginBottom: 6 }}>
                Message
              </label>
              <textarea
                name="message"
                value={requestForm.message}
                onChange={handleChange}
                rows="4"
                style={{
                  width: "100%",
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <button
                type="submit"
                style={{
                  width: "100%",
                  height: 44,
                  border: "none",
                  borderRadius: 999,
                  background: "#0f172a",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Submit Request
              </button>
            </form>

            {feedback && (
              <p
                style={{
                  marginTop: 12,
                  color: feedback.includes("successfully")
                    ? "green"
                    : "crimson",
                }}
              >
                {feedback}
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default PropertyDetails;
>>>>>>> origin/develop
