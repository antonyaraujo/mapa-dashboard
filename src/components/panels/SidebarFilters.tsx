"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useStations } from "@/hooks/useStations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SidebarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: stations, isLoading } = useStations();

  const currentState = searchParams.get("state") || "all";
  const currentBasin = searchParams.get("basin") || "all";
  const currentRiver = searchParams.get("river") || "all";

  // Extrair valores únicos
  const states = Array.from(
    new Set(stations?.features.map((f) => f.properties.state).filter(Boolean) || [])
  ).sort();

  const basins = Array.from(
    new Set(stations?.features.map((f) => f.properties.basin).filter(Boolean) || [])
  ).sort();

  const rivers = Array.from(
    new Set(stations?.features.map((f) => f.properties.river).filter(Boolean) || [])
  ).sort();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string | null) => {
    if (!value) return;
    router.push(pathname + "?" + createQueryString(key, value));
  };

  const handleClearFilters = () => {
    // Preserve station selection if we want, but usually clear clears all
    router.push(pathname);
  };

  // Filtragem no Frontend para a contagem
  const filteredStationsCount = stations?.features.filter((feature) => {
    if (currentState !== "all" && feature.properties.state !== currentState) return false;
    if (currentBasin !== "all" && feature.properties.basin !== currentBasin) return false;
    if (currentRiver !== "all" && feature.properties.river !== currentRiver) return false;
    return true;
  }).length || 0;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros Avançados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label>Estado (UF)</Label>
            {isLoading ? <Skeleton className="h-10 w-full" /> : (
              <Select value={currentState} onValueChange={(val) => handleFilterChange("state", val)}>
                <SelectTrigger><SelectValue placeholder="Todos os Estados" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {states.map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bacia Hidrográfica</Label>
            {isLoading ? <Skeleton className="h-10 w-full" /> : (
              <Select value={currentBasin} onValueChange={(val) => handleFilterChange("basin", val)}>
                <SelectTrigger><SelectValue placeholder="Todas as Bacias" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Bacias</SelectItem>
                  {basins.map((basin) => (
                    <SelectItem key={basin} value={basin}>{basin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rio / Corpo Hídrico</Label>
            {isLoading ? <Skeleton className="h-10 w-full" /> : (
              <Select value={currentRiver} onValueChange={(val) => handleFilterChange("river", val)}>
                <SelectTrigger><SelectValue placeholder="Todos os Rios" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Rios</SelectItem>
                  {rivers.map((river) => (
                    <SelectItem key={river} value={river}>{river}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={handleClearFilters}
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informações da Rede</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex justify-between">
            <span>Estações filtradas:</span>
            <span className="font-bold text-foreground">
              {isLoading ? <Skeleton className="inline-block w-8 h-4" /> : filteredStationsCount}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
