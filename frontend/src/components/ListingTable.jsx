import { Link } from "react-router-dom";

const headerStyle = {
  padding: "18px 16px",
  textAlign: "left",
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  color: "#334155",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const cellStyle = {
  padding: "18px 16px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#334155",
};

const getLocationLabel = (location) => {
  if (!location) return "Unknown location";
  if (typeof location === "string") return location;
  return (
    location.formattedAddress ||
    location.address ||
    [location.area, location.city].filter(Boolean).join(", ") ||
    "Unknown location"
  );
};

const toStatusOptionValue = (status) => {
  if (status === "Sold" || status === "Rented") {
    return "Sold/Rented";
  }
  if (status === "Under Offer") {
    return "Under Offer";
  }
  return "Available";
};

export default function ListingTable({
  properties = [],
  onAddNew,
  canUpdateStatus = false,
  statusUpdatingId = "",
  onStatusChange,
  canDelete = false,
  deletingId = "",
  onDelete,
}) {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 28, color: "#0f172a" }}>
            My Listings
          </h2>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Manage your active properties in one place.
          </p>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          background: "#fff",
          boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={headerStyle}>Title</th>
              <th style={headerStyle}>Type</th>
              <th style={headerStyle}>Location</th>
              <th style={headerStyle}>Price</th>
              <th style={headerStyle}>Status</th>
              <th style={headerStyle}>Beds</th>
              <th style={headerStyle}>Baths</th>
              <th style={headerStyle}>Size</th>
              <th style={headerStyle}>Owner</th>
              <th style={headerStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property._id}>
                <td style={cellStyle}>{property.title}</td>
                <td style={cellStyle}>{property.propertyType}</td>
                <td style={cellStyle}>
                  {getLocationLabel(property.location)}
                </td>
                <td style={cellStyle}>৳ {property.price?.toLocaleString()}</td>
                <td style={cellStyle}>
                  {canUpdateStatus && typeof onStatusChange === "function" ? (
                    <select
                      value={toStatusOptionValue(property.status)}
                      onChange={(e) => onStatusChange(property, e.target.value)}
                      disabled={statusUpdatingId === property._id}
                      style={{
                        width: 150,
                        height: 34,
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#1e293b",
                        padding: "0 10px",
                        cursor:
                          statusUpdatingId === property._id ? "not-allowed" : "pointer",
                        opacity: statusUpdatingId === property._id ? 0.75 : 1,
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="Under Offer">Under Offer</option>
                      <option value="Sold/Rented">Sold/Rented</option>
                    </select>
                  ) : (
                    property.status
                  )}
                </td>
                <td style={cellStyle}>{property.bedrooms}</td>
                <td style={cellStyle}>{property.bathrooms}</td>
                <td style={cellStyle}>{property.size} sqft</td>
                <td style={cellStyle}>{property.owner?.name || "—"}</td>
                <td style={cellStyle}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Link
                      to={`/properties/${property._id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 72,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#0f172a",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      View
                    </Link>

                    {canDelete && typeof onDelete === "function" ? (
                      <button
                        type="button"
                        onClick={() => onDelete(property._id)}
                        disabled={deletingId === property._id}
                        style={{
                          minWidth: 72,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "none",
                          background: "#dc2626",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: deletingId === property._id ? "default" : "pointer",
                          opacity: deletingId === property._id ? 0.7 : 1,
                        }}
                      >
                        {deletingId === property._id ? "Deleting" : "Delete"}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
