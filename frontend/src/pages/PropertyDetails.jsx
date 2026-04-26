import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPropertyById,
  subscribeToPropertyAlerts,
  unsubscribeFromPropertyAlerts,
} from "../services/propertyService";
import { createRequest } from "../services/requestService";
import PropertyLocationMap from "../components/PropertyLocationMap";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [requestForm, setRequestForm] = useState({
    requesterName: "",
    requesterEmail: "",
    offerAmount: "",
    message: "",
  });
  const [feedback, setFeedback] = useState("");
  const [subscriptionFeedback, setSubscriptionFeedback] = useState("");
  const [alertActionLoading, setAlertActionLoading] = useState(false);
  const [showUnsubscribeButton, setShowUnsubscribeButton] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPropertyById(id);

        const propData = res.data?.property || res.data;
        if (propData) setProperty(propData);
      } catch (err) {
        console.error("Failed to fetch property:", err);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!property) return;

    const imagesFromArray = Array.isArray(property.images)
      ? property.images.filter(Boolean)
      : [];
    const fallbackImage = property.image ? [property.image] : [];
    const gallery = [...imagesFromArray, ...fallbackImage];

    if (gallery.length > 0) {
      setSelectedImage(gallery[0]);
    } else {
      setSelectedImage("https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop");
    }
  }, [property]);

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

      setFeedback("Request submitted successfully to the seller dashboard!");
      setRequestForm({ requesterName: "", requesterEmail: "", offerAmount: "", message: "" });
    } catch (error) {
      setFeedback(error.response?.data?.message || "Failed to submit request.");
    }
  };

  const handleSubscribeAlerts = async () => {
    setSubscriptionFeedback("");
    const email = (localStorage.getItem("userEmail") || "").trim();

    if (!email) {
      setSubscriptionFeedback("Please log in to subscribe for alerts.");
      return;
    }

    try {
      setAlertActionLoading(true);
      const res = await subscribeToPropertyAlerts(id, email);
      setSubscriptionFeedback(
        res.data?.message ||
          "Subscribed. You will receive email alerts for changes.",
      );
      setShowUnsubscribeButton(true);
    } catch (error) {
      setSubscriptionFeedback(
        error.response?.data?.message || "Failed to subscribe for alerts.",
      );
    } finally {
      setAlertActionLoading(false);
    }
  };

  const handleUnsubscribeAlerts = async () => {
    setSubscriptionFeedback("");
    const email = (localStorage.getItem("userEmail") || "").trim();

    if (!email) {
      setSubscriptionFeedback("Please log in to manage alert subscriptions.");
      return;
    }

    try {
      setAlertActionLoading(true);
      const res = await unsubscribeFromPropertyAlerts(id, email);
      setSubscriptionFeedback(
        res.data?.message ||
          "Unsubscribed. You will no longer receive alerts for this property.",
      );
      setShowUnsubscribeButton(false);
    } catch (error) {
      setSubscriptionFeedback(
        error.response?.data?.message || "Failed to unsubscribe from alerts.",
      );
    } finally {
      setAlertActionLoading(false);
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

  const normalizedStatus = String(property.status || '').toLowerCase();
  const canSubmitProposal = normalizedStatus !== 'sold';
  const displayImage = selectedImage || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop";
  const galleryImages = [
    ...(Array.isArray(property.images) ? property.images.filter(Boolean) : []),
    ...(property.image ? [property.image] : []),
  ];
  const ownerName = property.owner?.name || property.sellerName || "Not provided";
  const ownerEmail = property.owner?.email || property.sellerEmail || "Not provided";
  const ownerPhone = property.owner?.phone || "Not provided";
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

            {galleryImages.length > 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30 }}>
                {galleryImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    style={{
                      border: selectedImage === img ? "2px solid #0f172a" : "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: 0,
                      overflow: "hidden",
                      cursor: "pointer",
                      width: 88,
                      height: 70,
                      background: "#fff",
                    }}
                  >
                    <img src={img} alt={`Property view ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}

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

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
                <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 8 }}>Owner Details</p>
                <p style={{ color: "#475569", lineHeight: 1.8, margin: 0 }}>
                  Name: {ownerName}<br />
                  Email: {ownerEmail}<br />
                  Phone: {ownerPhone}
                </p>
              </div>
            </div>
          </section>

          <aside>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: 32, position: "sticky", top: 120, boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}>
              <div style={{ marginBottom: 26, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Price Alerts</h2>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
                  Subscribe to get email updates when this price changes or when this property becomes Sold/Rented.
                </p>
                {!showUnsubscribeButton && (
                  <button
                    type="button"
                    onClick={handleSubscribeAlerts}
                    disabled={alertActionLoading}
                    style={{ width: "100%", height: 44, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: alertActionLoading ? "not-allowed" : "pointer", opacity: alertActionLoading ? 0.75 : 1 }}
                  >
                    {alertActionLoading ? "Please wait..." : "Subscribe to Price Alerts"}
                  </button>
                )}
                {showUnsubscribeButton && (
                  <button
                    type="button"
                    onClick={handleUnsubscribeAlerts}
                    disabled={alertActionLoading}
                    style={{ width: "100%", height: 42, marginTop: 10, background: "#fff", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: alertActionLoading ? "not-allowed" : "pointer", opacity: alertActionLoading ? 0.75 : 1 }}
                  >
                    Unsubscribe Alerts
                  </button>
                )}
                {subscriptionFeedback && (
                  <p style={{ marginTop: 10, color: subscriptionFeedback.toLowerCase().includes("fail") ? "#991b1b" : "#166534", fontWeight: 600, fontSize: 13 }}>
                    {subscriptionFeedback}
                  </p>
                )}
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Interest Inquiry</h2>

              {!canSubmitProposal ? (
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
