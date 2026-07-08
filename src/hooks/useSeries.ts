import { useQuery } from "@tanstack/react-query";
import { RainfallData } from "@/types";

export type SeriesType = "chuva" | "cota" | "vazao" | "qa" | "telemetrica";

async function fetchSeries(type: SeriesType, stationId: string): Promise<RainfallData> {
  const response = await fetch(`/api/series/${type}/${encodeURIComponent(stationId)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch series data for ${type}`);
  }
  return response.json();
}

export function useSeries(type: SeriesType, stationId: string | null) {
  return useQuery({
    queryKey: ["series", type, stationId],
    queryFn: () => fetchSeries(type, stationId!),
    enabled: !!stationId, // Fetch only if station is selected
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}
