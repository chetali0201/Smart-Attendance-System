/**
 * Builds a Google Maps URL that opens directly at the given coordinates.
 * No API key needed — this is just the public maps.google.com search URL.
 */
export function googleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function hasCoordinates(latitude, longitude) {
  return typeof latitude === "number" && typeof longitude === "number";
}

export function openInGoogleMaps(latitude, longitude) {
  if (!hasCoordinates(latitude, longitude)) return;
  window.open(googleMapsUrl(latitude, longitude), "_blank", "noopener,noreferrer");
}
