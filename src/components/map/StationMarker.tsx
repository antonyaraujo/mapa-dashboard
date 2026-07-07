"use client";

import { Marker, Popup } from "react-leaflet";
import { StationFeature } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import { useMemo } from "react";

interface StationMarkerProps {
  feature: StationFeature;
}

export function StationMarker({ feature }: StationMarkerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // O ID que estamos usando temporariamente pelas coordenadas
  const stationId = `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`;
  const isSelected = searchParams.get("station") === stationId;

  const handleSelectStation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("station", stationId);
    
    // We update the URL without losing other query parameters
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const [lng, lat] = feature.geometry.coordinates;

  // Criar um ícone de "gota" dinâmico
  const customIcon = useMemo(() => {
    // Usar cores hexadecimais seguras pois variáveis CSS podem falhar dentro do Leaflet DOM
    const color = isSelected ? "#2563eb" : "#64748b"; // blue-600 ou slate-500
    const fill = isSelected ? "#3b82f6" : "none"; // blue-500 ou none
    const size = isSelected ? 32 : 24;
    
    // Importante passar width e height em style para sobrescrever qualquer CSS do leaflet
    const svgIcon = `<div style="display: flex; justify-content: center; align-items: center; width: ${size}px; height: ${size}px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    </div>`;

    return L.divIcon({
      html: svgIcon,
      className: "", // Deixamos vazio para não herdar estilos padrão indesejados
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  }, [isSelected]);

  return (
    <Marker position={[lat, lng]} icon={customIcon}>
      <Popup>
        <div className="flex flex-col gap-2 p-1 max-w-[200px]">
          <h3 className="font-bold text-sm leading-tight">
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
            disabled={isSelected}
          >
            {isSelected ? "Selecionada" : "Ver Detalhes"}
          </Button>
        </div>
      </Popup>
    </Marker>
  );
}
