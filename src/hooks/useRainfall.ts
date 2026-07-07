import { useQuery } from "@tanstack/react-query";
import { RainfallData } from "@/types";

async function fetchRainfall(stationId: string): Promise<RainfallData> {
  const response = await fetch(`/api/rainfall/${encodeURIComponent(stationId)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch rainfall data");
  }
  return response.json();
}

export function useRainfall(stationId: string | null) {
  return useQuery({
    queryKey: ["rainfall", stationId],
    queryFn: () => fetchRainfall(stationId!),
    enabled: !!stationId, // Only fetch if there is a selected station
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
