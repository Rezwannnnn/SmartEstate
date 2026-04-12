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
