"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useRainfall } from "@/hooks/useRainfall";
import { useStations } from "@/hooks/useStations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

export function StationDetailPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const stationId = searchParams.get("station");
  const { data: stations } = useStations();
  const { data: rainfallData, isLoading } = useRainfall(stationId);

  if (!stationId) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("station");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const station = stations?.features.find((f) => {
    const id = `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`;
    return id === stationId;
  });

  // Prepare data for recharts
  const chartData = rainfallData
    ? rainfallData.x.map((dateStr, index) => ({
        date: dateStr,
        formattedDate: format(parseISO(dateStr), "yyyy"),
        value: rainfallData.y[index],
      }))
    : [];

  const handleExportCSV = () => {
    if (!chartData.length) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Precipitacao (mm)\n"
      + chartData.map(e => `${e.formattedDate},${e.value}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estacao_${station?.properties.name || "dados"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="absolute right-0 top-0 h-full w-[400px] max-w-full bg-background border-l shadow-xl z-[500] flex flex-col transition-transform duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-card">
        <h2 className="font-bold text-lg truncate pr-4">
          {station?.properties.name || "Detalhes da Estação"}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Metadados da estação */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Rede:</span>{" "}
              {station?.properties.network || "N/A"}
            </div>
            <div>
              <span className="font-medium">País:</span>{" "}
              {station?.properties.country || "N/A"}
            </div>
            {station?.properties.responsible && (
              <div className="col-span-2">
                <span className="font-medium">Responsável:</span>{" "}
                {station.properties.responsible}
              </div>
            )}
            <div className="col-span-2 text-xs text-muted-foreground mt-2">
              Lat: {station?.geometry.coordinates[1].toFixed(4)} | Lon:{" "}
              {station?.geometry.coordinates[0].toFixed(4)}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico */}
        <Card className="flex-1 min-h-[300px] flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Precipitação Anual</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!chartData.length}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 pb-4 pr-4">
            {isLoading ? (
              <div className="w-full h-full p-4">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="formattedDate" 
                    fontSize={12} 
                    tickMargin={10} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    fontSize={12} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: any) => [`${value} mm`, "Precipitação"]}
                    labelFormatter={(label) => `Ano: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "hsl(var(--primary))" }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
