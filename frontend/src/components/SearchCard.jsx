import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveFilters } from "../services/propertyService";

const IconChevron = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
);

const IconPin = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="#6b7280"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z"
    />
    <circle cx="12" cy="8" r="2" />
  </svg>
);

export default function SearchCard() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!location.trim()) {
      return;
    }

    const params = new URLSearchParams();
    params.set("location", location.trim());

    if (propertyType !== "all") {
      params.set("listing", propertyType);
    }
    if (minPrice.trim()) {
      params.set("minPrice", minPrice.trim());
    }
    if (maxPrice.trim()) {
      params.set("maxPrice", maxPrice.trim());
    }

    navigate(`/properties?${params.toString()}`);
  };

  const handleSaveFilters = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to save your filters and receive email notifications.");
      return;
    }

    const payload = {
      User: userId,
      location: location || undefined,
      type: propertyType !== "all" && propertyType ? propertyType : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    };

    try {
      await saveFilters(payload);
      alert("Filters saved successfully! You will be notified when new properties match.");
    } catch (err) {
      alert("Failed to save filters: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
        borderRadius: 20,
        padding: "30px 26px 26px",
        width: 360,
        flexShrink: 0,
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow: "0 24px 70px rgba(15,23,42,0.24)",
      }}
    >
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 4,
          lineHeight: 1.4,
        }}
      >
        Find homes near you
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: "#64748b",
          marginBottom: 24,
        }}
      >
        Enter a location and filter by type or price range.
      </p>

      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: "#9ca3af",
            marginBottom: 6,
            letterSpacing: "0.04em",
          }}
        >
          Location
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 44,
            padding: "0 14px",
            border: "1px solid #e2e8f0",
            borderRadius: 30,
            background: "#ffffff",
          }}
        >
          <IconPin />
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search city, neighborhood, address"
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#334155",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
        <div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: "#9ca3af",
              marginBottom: 6,
              letterSpacing: "0.04em",
            }}
          >
            Property Type
          </p>
          <select
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 30,
              border: "1px solid #e2e8f0",
              padding: "0 14px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#334155",
              background: "#fff",
              outline: "none",
            }}
          >
            <option value="all">All types</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: "#9ca3af",
                marginBottom: 6,
                letterSpacing: "0.04em",
              }}
            >
              Min Price
            </p>
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="৳ 0"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 30,
                border: "1px solid #e2e8f0",
                padding: "0 14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#334155",
                background: "#fff",
                outline: "none",
              }}
            />
          </div>
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: "#9ca3af",
                marginBottom: 6,
                letterSpacing: "0.04em",
              }}
            >
              Max Price
            </p>
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="৳ 1Cr"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 30,
                border: "1px solid #e2e8f0",
                padding: "0 14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#334155",
                background: "#fff",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          type="button"
          onClick={handleSearch}
          style={{
            flex: 1,
            height: 46,
            background: "#0f172a",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            borderRadius: 30,
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(15,23,42,0.28)",
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleSaveFilters}
          style={{
            flex: 1,
            height: 46,
            background: "#3b82f6",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            borderRadius: 30,
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(59,130,246,0.25)",
          }}
        >
          Save Filters
        </button>
      </div>
    </div>
  );
}
