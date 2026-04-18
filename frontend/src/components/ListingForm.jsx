import { useState, useEffect } from "react";
import MapPicker from "./MapPicker";

const propertyTypeOptions = [
  { value: "Sale", label: "Sale" },
  { value: "Rent", label: "Rent" },
  

];

const fieldStyle = {
  display: "flex",

  flexDirection: "column",
  
  gap: 8,
  marginBottom: 18,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#fff",
  fontSize: 14,
};

const selectStyle = {
  ...inputStyle,
  minHeight: 44,
  paddingRight: 42,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  cursor: "pointer",
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #475569 50%), linear-gradient(135deg, #475569 50%, transparent 50%)",
  backgroundPosition:
    "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)",
  backgroundSize: "6px 6px, 6px 6px",
  backgroundRepeat: "no-repeat",
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#0f172a",
};

export default function ListingForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save Listing",
  submitting = false,
}) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    images: "",
    price: "",
    propertyType: "",
    bedrooms: "1",
    bathrooms: "1",
    size: "0",
    locationAddress: "",
    locationArea: "",
    locationCity: "",
    locationPostCode: "",
    locationLat: "",
    locationLng: "",
    locationPlaceId: "",
    locationFormattedAddress: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) {
      return;
    }

    const savedLocation = initialData.location || {};
    const savedCoordinates = savedLocation.coordinates || {};

    setFormState((prev) => ({
      ...prev,
      title: initialData.title || "",
      description: initialData.description || "",
      images: Array.isArray(initialData.images)
        ? initialData.images.join(", ")
        : initialData.images || "",
      price: initialData.price ?? "",
      propertyType: initialData.propertyType || "Sale",
      bedrooms: initialData.bedrooms ?? "1",
      bathrooms: initialData.bathrooms ?? "1",
      size: initialData.size ?? "0",
      locationAddress: savedLocation.address || "",
      locationArea: savedLocation.area || "",
      locationCity: savedLocation.city || "",
      locationPostCode: savedLocation.postCode || "",
      locationLat: savedCoordinates.lat ?? "",
      locationLng: savedCoordinates.lng ?? "",
      locationPlaceId: savedLocation.placeId || "",
      locationFormattedAddress: savedLocation.formattedAddress || "",
      ownerName: initialData.owner?.name || "",
      ownerEmail: initialData.owner?.email || "",
      ownerPhone: initialData.owner?.phone || "",
    }));
  }, [initialData]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleLocationSelect = (locationPayload) => {
    setFormState((prev) => ({
      ...prev,
      locationAddress: locationPayload.address || prev.locationAddress,
      locationArea: locationPayload.area || prev.locationArea,
      locationCity: locationPayload.city || prev.locationCity,
      locationPostCode: locationPayload.postCode || prev.locationPostCode,
      locationLat: locationPayload.coordinates?.lat ?? prev.locationLat,
      locationLng: locationPayload.coordinates?.lng ?? prev.locationLng,
      locationPlaceId: locationPayload.placeId || prev.locationPlaceId,
      locationFormattedAddress:
        locationPayload.formattedAddress || prev.locationFormattedAddress,
    }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read selected image."));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
      setUploadedImages((prev) => [...prev, ...dataUrls]);
    } catch (uploadError) {
      setError(uploadError.message || "Failed to process image upload.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formState.title ||
      !formState.price ||
      !formState.locationAddress ||
      !formState.locationArea ||
      !formState.locationCity ||
      !formState.locationPostCode ||
      !formState.locationFormattedAddress ||
      !formState.locationLat ||
      !formState.locationLng
    ) {
      setError(
        "Title, price, and complete location details are required. Please provide the address, area, city, post code, formatted address, and coordinates.",
      );
      return;
    }

    const urlImages = formState.images
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: formState.title,
      description: formState.description,
      images: [...urlImages, ...uploadedImages],
      price: Number(formState.price),
      propertyType: formState.propertyType,
      bedrooms: Number(formState.bedrooms),
      bathrooms: Number(formState.bathrooms),
      size: Number(formState.size),
      location: {
        address: formState.locationAddress,
        area: formState.locationArea,
        city: formState.locationCity,
        postCode: formState.locationPostCode,
        coordinates: {
          lat: Number(formState.locationLat),
          lng: Number(formState.locationLng),
        },
        placeId: formState.locationPlaceId,
        formattedAddress: formState.locationFormattedAddress,
      },
      status: "Available",
      owner: {
        name: formState.ownerName,
        email: formState.ownerEmail,
        phone: formState.ownerPhone,
      },
    };

    await onSubmit(payload);
  };

  const initialLocation =
    formState.locationLat && formState.locationLng
      ? {
          lat: Number(formState.locationLat),
          lng: Number(formState.locationLng),
        }
      : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        borderRadius: 20,
        background: "#ffffff",
        boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>
          Property Listing
        </h2>
        <p style={{ margin: "8px 0 0", color: "#475569" }}>
          Enter listing details and publish the property to your dashboard.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={formState.title}
              onChange={handleChange("title")}
              style={inputStyle}
              placeholder="Luxurious apartment in city center"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="propertyType">
              Property Type
            </label>
            <select
              id="propertyType"
              value={formState.propertyType}
              onChange={handleChange("propertyType")}
              style={selectStyle}
            >
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>
                Pick location on map
              </h3>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                Search for a place and drag the marker to fill address fields
                automatically.
              </p>
            </div>
          </div>

          <MapPicker
            initialLocation={initialLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="locationFormattedAddress">
              Formatted Address
            </label>
            <input
              id="locationFormattedAddress"
              type="text"
              value={formState.locationFormattedAddress}
              onChange={handleChange("locationFormattedAddress")}
              style={inputStyle}
              placeholder="House 12, Road 5, Gulshan 2, Dhaka 1212, Bangladesh"
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="locationAddress">
              Address
            </label>
            <input
              id="locationAddress"
              type="text"
              value={formState.locationAddress}
              onChange={handleChange("locationAddress")}
              style={inputStyle}
              placeholder="House 12, Road 5, Gulshan 2"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="locationArea">
              Area
            </label>
            <input
              id="locationArea"
              type="text"
              value={formState.locationArea}
              onChange={handleChange("locationArea")}
              style={inputStyle}
              placeholder="Gulshan"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="locationCity">
              City
            </label>
            <input
              id="locationCity"
              type="text"
              value={formState.locationCity}
              onChange={handleChange("locationCity")}
              style={inputStyle}
              placeholder="Dhaka"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="locationPostCode">
              Post Code
            </label>
            <input
              id="locationPostCode"
              type="text"
              value={formState.locationPostCode}
              onChange={handleChange("locationPostCode")}
              style={inputStyle}
              placeholder="1212"
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formState.description}
            onChange={handleChange("description")}
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            placeholder="A brief summary of the property and its standout features."
          />
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="price">
              Price
            </label>
            <input
              id="price"
              type="number"
              value={formState.price}
              onChange={handleChange("price")}
              style={inputStyle}
              placeholder="25000"
              min="0"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="bedrooms">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              value={formState.bedrooms}
              onChange={handleChange("bedrooms")}
              style={inputStyle}
              min="0"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="bathrooms">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              type="number"
              value={formState.bathrooms}
              onChange={handleChange("bathrooms")}
              style={inputStyle}
              min="0"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="size">
              Size (sqft)
            </label>
            <input
              id="size"
              type="number"
              value={formState.size}
              onChange={handleChange("size")}
              style={inputStyle}
              min="0"
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ownerName">
              Owner Name
            </label>
            <input
              id="ownerName"
              type="text"
              value={formState.ownerName}
              onChange={handleChange("ownerName")}
              style={inputStyle}
              placeholder="Md. Rahman"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ownerEmail">
              Owner Email
            </label>
            <input
              id="ownerEmail"
              type="email"
              value={formState.ownerEmail}
              onChange={handleChange("ownerEmail")}
              style={inputStyle}
              placeholder="owner@example.com"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ownerPhone">
              Owner Phone
            </label>
            <input
              id="ownerPhone"
              type="tel"
              value={formState.ownerPhone}
              onChange={handleChange("ownerPhone")}
              style={inputStyle}
              placeholder="017XXXXXXXX"
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="images">
            Image URLs (optional)
          </label>
          <input
            id="images"
            type="text"
            value={formState.images}
            onChange={handleChange("images")}
            style={inputStyle}
            placeholder="Enter image URLs separated by commas"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="imageFiles">
            Upload Images
          </label>
          <input
            id="imageFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={inputStyle}
          />
          {uploadedImages.length > 0 && (
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
              {uploadedImages.length} image(s) selected.
            </p>
          )}
        </div>

        {error && (
          <p style={{ color: "#b91c1c", margin: 0, fontWeight: 600 }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "12px 18px",
                background: "#f8fafc",
                color: "#334155",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              background: "#0f172a",
              color: "#fff",
              fontWeight: 700,
              cursor: submitting ? "default" : "pointer",
            }}
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
