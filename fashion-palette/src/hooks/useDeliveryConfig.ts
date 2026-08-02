import { useQuery } from "@tanstack/react-query";
import { FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_CHARGES } from "@/lib/constants";

// Feedback 24: read owner-configured delivery values so cart/checkout show the
// same charge the server applies. Falls back to constants before load.
export function useDeliveryConfig() {
  const { data } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const res = await fetch("/api/settings/public");
      if (!res.ok) throw new Error("failed");
      return res.json() as Promise<{ deliveryCharge: number; freeThreshold: number }>;
    },
    staleTime: 5 * 60 * 1000,
  });
  return {
    deliveryCharge: data?.deliveryCharge ?? DEFAULT_DELIVERY_CHARGES,
    freeThreshold: data?.freeThreshold ?? FREE_DELIVERY_THRESHOLD,
  };
}
