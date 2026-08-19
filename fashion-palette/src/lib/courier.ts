// Final feedback B8: the admin enters only a tracking number and picks a courier;
// the system builds and stores the full tracking URL. Keep this list in sync with
// the couriers Fashion Palette actually uses.

export type CourierKey = "leopards" | "tcs" | "daewoo";

export const COURIERS: Record<CourierKey, { label: string; urlTemplate: string }> = {
  leopards: {
    label: "Leopards Courier",
    urlTemplate: "https://pk.leopardscourier.com/shipment_tracking_view?cn_number={trackingNumber}",
  },
  tcs: {
    label: "TCS Express",
    urlTemplate: "https://www.tcsexpress.com/track/{trackingNumber}",
  },
  daewoo: {
    label: "Daewoo FastEx",
    urlTemplate: "https://fastex.pk/trackingDetail?trackingNo={trackingNumber}",
  },
};

export function isCourierKey(v: unknown): v is CourierKey {
  return typeof v === "string" && v in COURIERS;
}

export function courierLabel(key: string | null | undefined): string {
  return key && isCourierKey(key) ? COURIERS[key].label : (key || "");
}

// Tracking numbers are alphanumeric with optional dashes; trim and validate.
const TRACKING_RE = /^[A-Za-z0-9-]{4,40}$/;

export function normalizeTrackingNumber(raw: string | null | undefined): string {
  return (raw ?? "").trim();
}

export function isValidTrackingNumber(raw: string | null | undefined): boolean {
  return TRACKING_RE.test(normalizeTrackingNumber(raw));
}

// Build the full tracking URL for a courier + tracking number. Returns null if
// the courier is unknown or the tracking number is invalid. The tracking value
// is URL-encoded before insertion.
export function buildTrackingUrl(courier: string | null | undefined, trackingNumber: string | null | undefined): string | null {
  if (!isCourierKey(courier)) return null;
  const tn = normalizeTrackingNumber(trackingNumber);
  if (!isValidTrackingNumber(tn)) return null;
  return COURIERS[courier].urlTemplate.replace("{trackingNumber}", encodeURIComponent(tn));
}
