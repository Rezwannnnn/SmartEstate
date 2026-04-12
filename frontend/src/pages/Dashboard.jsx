import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingForm from "../components/ListingForm";
import ListingTable from "../components/ListingTable";
import { createProperty, getAllProperties } from "../services/propertyService";

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getAllProperties();
      setProperties(res.data || []);
      setShowForm((prev) => (res.data?.length === 0 ? true : prev));
    } catch (fetchError) {
      setError("Unable to load your properties. Please try again.");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleCreateProperty = async (payload) => {
    setSubmitting(true);
    setError("");

    try {
      await createProperty(payload);
      await loadProperties();
      setShowForm(false);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          "Failed to save the property. Please check the fields and try again.",
      );
      console.error(submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (properties.length === 0) return;
    setShowForm(false);
  };

  return (
    <main style={{ padding: "100px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Dashboard
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: 36, color: "#0f172a" }}>
              Property Management
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
              }}
            >
              <button
                type="button"
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: 14,
                  padding: "14px 22px",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back to Home
              </button>
            </Link>
            {!showForm && properties.length > 0 && (
              <button
                type="button"
                onClick={handleAddClick}
                style={{
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 22px",
                  background: "#0f172a",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add New Listing
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <p style={{ color: "#475569" }}>Loading your dashboard...</p>
        ) : showForm ? (
          <>
            {error && (
              <p
                style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 20 }}
              >
                {error}
              </p>
            )}
            <ListingForm
              onSubmit={handleCreateProperty}
              onCancel={handleCancel}
              submitLabel={
                properties.length === 0 ? "Publish Listing" : "Save Listing"
              }
              submitting={submitting}
            />
          </>
        ) : (
          <>
            {error && (
              <p
                style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 20 }}
              >
                {error}
              </p>
            )}
            <ListingTable properties={properties} onAddNew={handleAddClick} />
          </>
        )}
      </div>
    </main>
  );
}
