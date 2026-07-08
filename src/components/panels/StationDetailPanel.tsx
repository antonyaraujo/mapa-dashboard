"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useStations } from "@/hooks/useStations";
import { useSeries, SeriesType } from "@/hooks/useSeries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download, Droplets, Waves, Activity, BarChart2 } from "lucide-react";
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
  
  // Tab local state
  const [activeTab, setActiveTab] = useState<SeriesType>("chuva");
  
  // Só busca do hook a série que estiver ativa na aba (otimização)
  const { data: seriesData, isLoading } = useSeries(activeTab, stationId);

  if (!stationId) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("station");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const station = stations?.features.find((f) => {
    // Agora temos um código da estação fornecido pelo backend
    const id = f.properties.code || `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`;
    return id === stationId;
  });

  // Prepare data for recharts
  const chartData = seriesData?.x
    ? seriesData.x.map((dateStr, index) => ({
        date: dateStr,
        // Algumas séries retornam em dias, outras em horas. Se parse falhar, mantemos a string bruta
        formattedDate: dateStr.includes("T") || dateStr.includes("-") 
          ? (() => { try { return format(parseISO(dateStr), "dd/MM/yy"); } catch { return dateStr; } })()
          : dateStr,
        value: seriesData.y[index],
      }))
    : [];

  const getMetricMetadata = (type: SeriesType) => {
    switch(type) {
      case "chuva": return { name: "Precipitação", unit: "mm", color: "hsl(var(--primary))", icon: <Droplets className="w-4 h-4 mr-2" /> };
      case "cota": return { name: "Cotas (Nível)", unit: "cm", color: "#10b981", icon: <Waves className="w-4 h-4 mr-2" /> };
      case "vazao": return { name: "Vazão", unit: "m³/s", color: "#3b82f6", icon: <Activity className="w-4 h-4 mr-2" /> };
      case "qa": return { name: "Qualidade de Água", unit: "índice", color: "#8b5cf6", icon: <BarChart2 className="w-4 h-4 mr-2" /> };
      case "telemetrica": return { name: "Dados Recentes", unit: "", color: "#ef4444", icon: <Activity className="w-4 h-4 mr-2" /> };
      default: return { name: "Valor", unit: "", color: "hsl(var(--primary))", icon: <Activity className="w-4 h-4 mr-2" /> };
    }
  };

  const currentMetric = getMetricMetadata(activeTab);

  const handleExportCSV = () => {
    if (!chartData.length) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Data,${currentMetric.name} (${currentMetric.unit})\n`
      + chartData.map(e => `${e.formattedDate},${e.value}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estacao_${station?.properties.code}_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="absolute right-0 top-0 h-full w-[450px] max-w-full bg-background border-l shadow-xl z-[500] flex flex-col transition-transform duration-300">
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
          <CardContent className="p-4 text-sm grid grid-cols-2 gap-y-2 gap-x-4">
            <div><span className="font-medium text-muted-foreground">Código:</span> {station?.properties.code || "N/A"}</div>
            <div><span className="font-medium text-muted-foreground">Rede:</span> {station?.properties.network || "N/A"}</div>
            <div className="col-span-2"><span className="font-medium text-muted-foreground">Rio:</span> {station?.properties.river || "N/A"}</div>
            <div className="col-span-2"><span className="font-medium text-muted-foreground">Bacia:</span> {station?.properties.basin || "N/A"}</div>
            <div className="col-span-2 text-xs text-muted-foreground mt-2 border-t pt-2">
              Lat: {station?.geometry.coordinates[1].toFixed(4)} | Lon: {station?.geometry.coordinates[0].toFixed(4)}
            </div>
          </CardContent>
        </Card>

        {/* Abas de Gráficos */}
        <Tabs defaultValue="chuva" value={activeTab} onValueChange={(val) => setActiveTab(val as SeriesType)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="chuva" title="Precipitação"><Droplets className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="cota" title="Nível"><Waves className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="vazao" title="Vazão"><Activity className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="qa" title="Qual. Água"><BarChart2 className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          <Card className="flex-1 min-h-[350px] flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center">
                {currentMetric.icon}
                {currentMetric.name}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!chartData.length}>
                <Download className="h-4 w-4 mr-2" /> CSV
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 pb-4 pr-4">
              {isLoading ? (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                  <Skeleton className="w-full h-48 mb-2" />
                  <span className="text-xs text-muted-foreground">Carregando dados da ANA...</span>
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <p>Nenhum dado de {currentMetric.name.toLowerCase()} encontrado para esta estação.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="formattedDate" 
                      fontSize={11} 
                      tickMargin={10} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      fontSize={11} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: any) => [`${value} ${currentMetric.unit}`, currentMetric.name]}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={currentMetric.color} 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
