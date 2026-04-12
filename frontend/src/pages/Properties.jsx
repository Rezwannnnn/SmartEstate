import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllProperties } from "../services/propertyService";

function Properties() {
  const [searchParams] = useSearchParams();
  const listing = searchParams.get("listing");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const params = {};
        if (listing === "rent") params.listing = "rent";
        if (listing === "sale") params.listing = "sale";

        const res = await getAllProperties(params);
        setProperties(res.data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [listing]);

  return (
    <main style={{ padding: "100px 40px 40px" }}>
      <h1 style={{ marginBottom: 24 }}>
        {listing === "rent" ? "Rental Properties" : "Available Properties"}
      </h1>

      {loading ? (
        <p>Loading properties...</p>
      ) : properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {properties.map((property) => (
            <div
              key={property._id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
              }}
            >
              <img
                src={
                  property.images?.[0] ||
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"
                }
                alt={property.title}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div style={{ padding: 18 }}>
                <h3 style={{ margin: "0 0 8px" }}>{property.title}</h3>
                <p style={{ margin: "0 0 8px", color: "#475569" }}>{property.location}</p>
                <p style={{ margin: "0 0 8px", fontWeight: 700 }}>৳ {property.price}</p>
                <p style={{ margin: "0 0 14px", color: "#64748b" }}>
                  {property.bedrooms} bed • {property.bathrooms} bath • {property.size} sqft
                </p>

                <Link
                  to={`/properties/${property._id}`}
                  style={{
                    display: "inline-block",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "#0f172a",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Properties;