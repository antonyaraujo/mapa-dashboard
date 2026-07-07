"use client";

import { Marker, Popup } from "react-leaflet";
import { StationFeature } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface StationMarkerProps {
  feature: StationFeature;
}

export function StationMarker({ feature }: StationMarkerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectStation = () => {
    const params = new URLSearchParams(searchParams.toString());
    // Use coordinates as ID for now since there's no explicit ID in the feature
    // In a real app we'd use feature.properties.code or similar
    const stationId = `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`;
    params.set("station", stationId);
    
    // We update the URL without losing other query parameters (like year filters)
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const [lng, lat] = feature.geometry.coordinates;

  return (
    <Marker position={[lat, lng]}>
      <Popup>
        <div className="flex flex-col gap-2 p-1 max-w-[200px]">
          <h3 className="font-bold text-sm">
            {feature.properties.name || "Estação sem nome"}
          </h3>
          <div className="text-xs text-muted-foreground">
            <p><strong>Rede:</strong> {feature.properties.network}</p>
            <p><strong>País:</strong> {feature.properties.country}</p>
          </div>
          <Button 
            size="sm" 
            onClick={handleSelectStation}
            className="w-full mt-2"
          >
            Ver Detalhes
          </Button>
        </div>
      </Popup>
    </Marker>
  );
}
