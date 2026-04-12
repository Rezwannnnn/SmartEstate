import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllProperties } from "../services/propertyService";

const EARTH_RADIUS_KM = 6371;

function toNumber(value) {
  const number = Number(value?.toString().replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : undefined;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

async function geocodeLocation(location) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!location || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        location,
      )}&key=${apiKey}`,
    );
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return null;
    }

    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

function Properties() {
  const [searchParams] = useSearchParams();
  const rawListing = searchParams.get("listing");
  const listing = rawListing === "buy" ? "sale" : rawListing;
  const locationQuery = searchParams.get("location") || "";
  const minPrice = toNumber(searchParams.get("minPrice"));
  const maxPrice = toNumber(searchParams.get("maxPrice"));
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSummary, setSearchSummary] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setSearchSummary("");

      try {
        const params = {};
        if (listing === "rent") params.listing = "rent";
        if (listing === "sale") params.listing = "sale";

        const res = await getAllProperties(params);
        let results = res.data || [];

        if (minPrice !== undefined) {
          results = results.filter(
            (property) => Number(property.price) >= minPrice,
          );
        }
        if (maxPrice !== undefined) {
          results = results.filter(
            (property) => Number(property.price) <= maxPrice,
          );
        }

        if (locationQuery) {
          const geo = await geocodeLocation(locationQuery);
          if (geo) {
            setSearchSummary(
              `Showing properties near "${geo.formattedAddress}" within 20 km`,
            );
            results = results.filter((property) => {
              const coords = property.location?.coordinates;
              if (!coords?.lat || !coords?.lng) {
                return false;
              }

              const distance = haversineDistance(
                geo.lat,
                geo.lng,
                Number(coords.lat),
                Number(coords.lng),
              );
              return distance <= 20;
            });
          } else {
            setSearchSummary(
              `Could not resolve location "${locationQuery}". Please try a different address.`,
            );
            results = [];
          }
        }

        setProperties(results);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [listing, locationQuery, minPrice, maxPrice]);

  return (
    <main style={{ padding: "100px 40px 40px" }}>
      <h1 style={{ marginBottom: 12 }}>
        {listing === "rent"
          ? "Rental Properties"
          : listing === "sale"
            ? "Properties for Sale"
            : "Available Properties"}
      </h1>
      {locationQuery && (
        <p style={{ marginTop: 0, color: "#475569" }}>
          Search location: "{locationQuery}"
        </p>
      )}
      {searchSummary && (
        <p style={{ marginTop: 8, color: "#6b7280" }}>{searchSummary}</p>
      )}

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
                <p style={{ margin: "0 0 8px", color: "#475569" }}>
                  {property.location?.formattedAddress ||
                    property.location?.address ||
                    property.location}
                </p>
                <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
                  ৳ {property.price}
                </p>
                <p style={{ margin: "0 0 14px", color: "#64748b" }}>
                  {property.bedrooms} bed • {property.bathrooms} bath •{" "}
                  {property.size} sqft
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
