import { MapContainer } from "@/components/map/MapContainer";
import { SidebarFilters } from "@/components/panels/SidebarFilters";
import { StationDetailPanel } from "@/components/panels/StationDetailPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar de filtros (Desktop) */}
      <div className="hidden md:flex flex-col w-[320px] border-r bg-card shadow-sm z-10">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="font-bold text-lg tracking-tight">Mapa Dashboard</h1>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarFilters />
        </div>
      </div>

      {/* Área do Mapa */}
      <div className="flex-1 relative">
        <MapContainer />
        
        {/* Mobile Header / Overlays can go here */}
        <div className="md:hidden absolute top-4 right-4 z-[400] bg-background/80 backdrop-blur-md p-1 rounded-md shadow-md border">
          <ThemeToggle />
        </div>
      </div>

      {/* Painel de Detalhes da Estação (Deslizante / Fixo na direita) */}
      <StationDetailPanel />
    </main>
  );
}
