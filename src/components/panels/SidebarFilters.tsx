"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
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

  const currentCountry = searchParams.get("country") || "all";

  // Extrair países únicos
  const countries = Array.from(
    new Set(
      stations?.features.map((f) => f.properties.country).filter(Boolean) || []
    )
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

  const handleCountryChange = (value: string | null) => {
    if (!value) return;
    router.push(pathname + "?" + createQueryString("country", value));
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  // Filtragem no Frontend para a contagem
  const filteredStationsCount = stations?.features.filter((feature) => {
    if (currentCountry === "all") return true;
    return feature.properties.country === currentCountry;
  }).length || 0;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>País / Região</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={currentCountry} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os países</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Here we could add YearRangeSlider */}
          
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
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Total de estações: {isLoading ? <Skeleton className="inline-block w-8 h-4" /> : filteredStationsCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
