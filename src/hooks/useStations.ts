import { useQuery } from "@tanstack/react-query";
import { StationCollection } from "@/types";

async function fetchStations(): Promise<StationCollection> {
  const response = await fetch("/api/stations");
  if (!response.ok) {
    throw new Error("Failed to fetch stations");
  }
  return response.json();
}

export function useStations() {
  return useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
