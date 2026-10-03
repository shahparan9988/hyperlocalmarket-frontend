import { useCallback, useEffect, useState } from "react";
import { DHAKA_FALLBACK_LOCATION } from "../constants/discoveryDefaults";

function mapGeolocationError(error) {
  switch (error?.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. You can continue using the Dhaka location.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location is unavailable.";
    case error.TIMEOUT:
      return "Finding your location took too long. Please try again.";
    default:
      return "We could not determine your location.";
  }
}

export function useUserLocation() {
  const [actualLocation, setActualLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("prompt");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!navigator.permissions?.query) return undefined;

    let permission;
    let isCancelled = false;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (isCancelled) return;
        permission = result;
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      })
      .catch(() => {
        // Some browsers do not expose geolocation permission through this API.
      });

    return () => {
      isCancelled = true;
      if (permission) permission.onchange = null;
    };
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("This browser does not support location services.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActualLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current location",
          source: "browser",
        });
        setPermissionStatus("granted");
        setIsLocating(false);
      },
      (error) => {
        setPermissionStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "prompt"
        );
        setLocationError(mapGeolocationError(error));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    location: actualLocation ?? DHAKA_FALLBACK_LOCATION,
    isUsingFallback: !actualLocation,
    permissionStatus,
    isLocating,
    locationError,
    requestLocation,
  };
}

