// Use current host so the app works when opened via LAN IP (e.g. 192.168.29.226:3000)
export const API_BASE =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:8080`
    : "http://localhost:8080";

// Same-origin placeholder to avoid cross-origin "Script error" from external image domains
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23eee' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export const PLACEHOLDER_IMAGE_SMALL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23eee' width='150' height='150'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
