import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };

const toSafeCoordinates = (coordinates) => {
  const lat = Number(coordinates?.lat);
  const lng = Number(coordinates?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

export default function PropertyLocationMap({ coordinates, address, title }) {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("Loading map...");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setStatus("Google Maps API key is missing.");
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: "weekly",
        });

        const google = await loader.load();
        if (cancelled || !mapRef.current) {
          return;
        }

        const safeCoordinates = toSafeCoordinates(coordinates);

        // If we already have lat/lng, use that directly for best accuracy.
        const map = new google.maps.Map(mapRef.current, {
          center: safeCoordinates || DHAKA_CENTER,
          zoom: safeCoordinates ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        if (safeCoordinates) {
          new google.maps.Marker({
            map,
            position: safeCoordinates,
            title: title || "Property location",
          });
          setStatus("");
          return;
        }

        // If lat/lng is missing, try converting address text to a map point.
        if (address) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address }, (results, geocodeStatus) => {
            if (cancelled) {
              return;
            }

            if (geocodeStatus === "OK" && results?.length) {
              const place = results[0];
              map.setCenter(place.geometry.location);
              map.setZoom(15);
              new google.maps.Marker({
                map,
                position: place.geometry.location,
                title: title || "Property location",
              });
              setStatus("");
              return;
            }

            setStatus("Location could not be shown on map.");
          });
          return;
        }

        setStatus("No location data available for this property.");
      } catch (error) {
        console.error("Map failed to load:", error);
        if (!cancelled) {
          setStatus("Failed to load map.");
        }
      }
    };

    initMap();

    return () => {
      
      // Prevent state updates if user leaves page while map is loading.
      cancelled = true;
    };
  }, [apiKey, coordinates, address, title]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {status ? (
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{status}</p>
      ) : null}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          minHeight: 320,
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          background: "#f8fafc",
        }}
      />
    </div>
  );
}
