import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const DHaka_CENTER = { lat: 23.8103, lng: 90.4125 };
const DEFAULT_ZOOM = 13;

function parseAddressComponents(components = []) {
  const parsed = {
    address: "",
    area: "",
    city: "",
    postCode: "",
  };

  let streetNumber = "";
  let route = "";

  components.forEach((component) => {
    const types = component.types || [];
    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      route = component.long_name;
    }
    if (
      types.includes("sublocality") ||
      types.includes("sublocality_level_1") ||
      types.includes("neighborhood") ||
      types.includes("political")
    ) {
      parsed.area = parsed.area || component.long_name;
    }
    if (
      types.includes("locality") ||
      types.includes("postal_town") ||
      types.includes("administrative_area_level_2")
    ) {
      parsed.city = parsed.city || component.long_name;
    }
    if (types.includes("postal_code")) {
      parsed.postCode = component.long_name;
    }
  });

  parsed.address = [streetNumber, route].filter(Boolean).join(" ");

  return parsed;
}

function loadGoogleMaps(apiKey) {
  const loader = new Loader({
    apiKey,
    version: "weekly",
    libraries: ["places"],
  });
  return loader.load();
}

export default function MapPicker({ initialLocation, onLocationSelect }) {
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [status, setStatus] = useState(
    "Click on the map or search for an address.",
  );
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!apiKey) {
      setStatus(
        "Missing Google Maps API key. Set VITE_GOOGLE_MAPS_API_KEY in your environment.",
      );
      setLoading(false);
      return;
    }

    let map;
    let marker;
    let searchBox;

    const initialize = async () => {
      try {
        const google = await loadGoogleMaps(apiKey);
        map = new google.maps.Map(mapRef.current, {
          center: initialLocation || DHaka_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();

        marker = new google.maps.Marker({
          position: initialLocation || DHaka_CENTER,
          map,
          draggable: true,
        });
        markerRef.current = marker;

        const updateLocation = async (latLng) => {
          const location = {
            lat: latLng.lat(),
            lng: latLng.lng(),
          };

          marker.setPosition(location);
          map.panTo(location);

          const response = await geocoderRef.current.geocode({ location });
          if (!response.results?.length) {
            setStatus("Unable to reverse geocode that location.");
            return;
          }

          const result = response.results[0];
          const parsed = parseAddressComponents(result.address_components);
          const payload = {
            address: parsed.address || result.formatted_address,
            area: parsed.area,
            city: parsed.city,
            postCode: parsed.postCode,
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            coordinates: location,
          };

          onLocationSelectRef.current?.(payload);
          setStatus(`Location selected: ${payload.formattedAddress}`);
        };

        map.addListener("click", (event) => {
          updateLocation(event.latLng);
        });

        marker.addListener("dragend", (event) => {
          updateLocation(event.latLng);
        });

        searchBox = new google.maps.places.SearchBox(searchRef.current);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(
          searchRef.current,
        );
        map.addListener("bounds_changed", () => {
          searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces();
          if (!places || !places.length) {
            return;
          }

          const place = places[0];
          if (!place.geometry?.location) {
            setStatus("No location geometry found for that selection.");
            return;
          }

          const latLng = place.geometry.location;
          marker.setPosition(latLng);
          map.panTo(latLng);
          map.setZoom(15);

          const parsed = parseAddressComponents(place.address_components || []);
          const payload = {
            address: parsed.address || place.formatted_address,
            area: parsed.area,
            city: parsed.city,
            postCode: parsed.postCode,
            formattedAddress: place.formatted_address,
            placeId: place.place_id,
            coordinates: {
              lat: latLng.lat(),
              lng: latLng.lng(),
            },
          };

          onLocationSelectRef.current?.(payload);
          setStatus(`Search selected: ${payload.formattedAddress}`);
        });

        if (initialLocation) {
          const googleLatLng = new google.maps.LatLng(
            initialLocation.lat,
            initialLocation.lng,
          );
          marker.setPosition(googleLatLng);
          map.panTo(googleLatLng);
        }
      } catch (error) {
        console.error(error);
        setStatus(
          "Failed to load Google Maps. Verify your API key and network.",
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
      }
      if (searchBox) {
        google.maps.event.clearInstanceListeners(searchBox);
      }
    };
  }, [apiKey, initialLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !initialLocation) {
      return;
    }

    const google = window.google;
    if (!google?.maps) {
      return;
    }

    const latLng = new google.maps.LatLng(
      initialLocation.lat,
      initialLocation.lng,
    );
    markerRef.current.setPosition(latLng);
    mapInstanceRef.current.panTo(latLng);
    mapInstanceRef.current.setZoom(15);
  }, [initialLocation]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search address or area..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          {loading ? "Loading Google Maps..." : status}
        </p>
      </div>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          minHeight: 360,
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      />
    </div>
  );
}
