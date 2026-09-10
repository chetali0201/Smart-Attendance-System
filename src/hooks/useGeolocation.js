/**
 * Wraps navigator.geolocation.getCurrentPosition in a Promise with
 * friendly error messages for the common failure cases.
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported on this browser/device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Please allow location access and try again."));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Unable to determine your location. Please check your device's GPS/network."));
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Location request timed out. Please try again."));
        } else {
          reject(new Error("Unable to get your location."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
