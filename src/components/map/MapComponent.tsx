"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { useStations } from "@/hooks/useStations";
import { StationMarker } from "./StationMarker";

// Fix missing marker icons in leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: stations, isLoading } = useStations();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  
  // Tiles change based on theme
  const tileUrl =
    currentTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution =
    currentTheme === "dark"
      ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[-15.793889, -47.882778]} // Brazil center
        zoom={4}
        className="w-full h-full"
        zoomControl={false} // Will add custom control if needed
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        
        {stations?.features.map((feature, index) => (
          <StationMarker key={`station-${index}`} feature={feature} />
        ))}
      </MapContainer>
    </div>
  );
}
