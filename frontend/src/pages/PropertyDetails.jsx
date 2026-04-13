import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPropertyById, sendBuyRequest } from "../services/propertyService";
import { createRequest } from "../services/requestService";
import PropertyLocationMap from "../components/PropertyLocationMap";

export default function PropertyDetails() {
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
    const load = async () => {
      try {
        const res = await getPropertyById(id);
        // Handle both develop response (res.data) and my mock response (res.data.property)
        const propData = res.data?.property || res.data;
        if (propData) setProperty(propData);
      } catch (err) {
        console.error("Failed to fetch property:", err);
      } finally { setLoading(false); }
    };
    load();
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
      // Support both the new request service and the mock dashboard pipeline
      if (id.startsWith('p')) {
        // FALLBACK FOR MOCK PIPELINE
        await sendBuyRequest({
          propertyId: property._id,
          buyerName: requestForm.requesterName,
          buyerEmail: requestForm.requesterEmail,
          buyerPhone: "123456789",
          message: requestForm.message
        });
      } else {
        // PRODUCTION API
        await createRequest({
          propertyId: id,
          requesterName: requestForm.requesterName,
          requesterEmail: requestForm.requesterEmail,
          offerAmount: Number(requestForm.offerAmount),
          message: requestForm.message,
        });
      }

      setFeedback("Request submitted successfully to the seller dashboard!");
      setRequestForm({ requesterName: "", requesterEmail: "", offerAmount: "", message: "" });
    } catch (error) {
      setFeedback(error.response?.data?.message || "Failed to submit request.");
    }
  };

  if (loading) return (
    <main style={{ padding: "100px 40px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 18, color: "#64748b" }}>Loading property details...</p>
    </main>
  );

  if (!property) return (
    <main style={{ padding: "100px 40px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 18, color: "#ef4444" }}>Property not found.</p>
      <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 700 }}>Return to Home</Link>
    </main>
  );

  const isAvailable = !property.status || property.status.toLowerCase() === 'available';
  const displayImage = property.image || (property.images && property.images[0]) || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop";
  // Prepare clean map props so the map component can handle both new and old data shapes.
  const hasCoordinates = Number.isFinite(Number(property.location?.coordinates?.lat)) && Number.isFinite(Number(property.location?.coordinates?.lng));
  const mapCoordinates = hasCoordinates
    ? {
        lat: Number(property.location?.coordinates?.lat),
        lng: Number(property.location?.coordinates?.lng),
      }
    : null;
  const mapAddress = property.location?.formattedAddress || property.location?.address || (typeof property.location === "string" ? property.location : "");

  return (
    <main style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", padding: "100px 40px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#3b82f6", fontWeight: 700, display: "inline-block", marginBottom: 24 }}>← Back to Listings</Link>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 30 }}>
          <section>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: "#0f172a", margin: "0 0 10px 0" }}>{property.title}</h1>
            <p style={{ fontSize: 18, color: "#64748b", marginBottom: 24 }}>
              📍 {property.location?.formattedAddress || property.location?.address || property.location}
            </p>

            <div style={{ width: "100%", borderRadius: 24, overflow: "hidden", marginBottom: 30, boxShadow: "0 20px 40px rgba(15,23,42,0.06)" }}>
              <img src={displayImage} alt={property.title} style={{ width: "100%", height: 500, objectFit: "cover" }} />
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 16px 0" }}>Property Location</h2>
              <PropertyLocationMap
                coordinates={mapCoordinates}
                address={mapAddress}
                title={property.title}
              />
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Property Specifications</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 4px 0" }}>Price</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>$ {property.price.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 4px 0" }}>Type</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{property.type || property.propertyType}</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 4px 0" }}>Bedrooms</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{property.bedrooms || 0} Beds</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 4px 0" }}>Bathrooms</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{property.bathrooms || 0} Baths</p>
                </div>
              </div>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
                <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 8 }}>Description</p>
                <p style={{ color: "#475569", lineHeight: 1.6, margin: 0 }}>{property.description || "No description provided for this luxury property."}</p>
              </div>
            </div>
          </section>

          <aside>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: 32, position: "sticky", top: 120, boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Interest Inquiry</h2>

              {!isAvailable ? (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: 20, borderRadius: 12, textAlign: "center", fontWeight: 700 }}>
                  This property is already {property.status.toUpperCase()}
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Full Name</label>
                  <input type="text" name="requesterName" value={requestForm.requesterName} onChange={handleChange} required style={{ width: "100%", marginBottom: 16, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }} placeholder="Your Name" />

                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                  <input type="email" name="requesterEmail" value={requestForm.requesterEmail} onChange={handleChange} required style={{ width: "100%", marginBottom: 16, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }} placeholder="your@email.com" />

                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Offer Amount ($)</label>
                  <input type="number" name="offerAmount" value={requestForm.offerAmount} onChange={handleChange} required style={{ width: "100%", marginBottom: 16, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }} placeholder={property.price} />

                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Message</label>
                  <textarea name="message" value={requestForm.message} onChange={handleChange} rows="4" style={{ width: "100%", marginBottom: 20, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", resize: "none" }} placeholder="I am interested in..." />

                  <button type="submit" style={{ width: "100%", height: 50, background: "#0f172a", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Submit Request</button>
                </form>
              )}
              {feedback && <p style={{ marginTop: 16, color: feedback.includes("successfully") ? "#166534" : "#991b1b", fontWeight: 600, fontSize: 14, textAlign: "center" }}>{feedback}</p>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
