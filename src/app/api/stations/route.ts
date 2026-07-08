import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { fetchAnaApi } from "@/lib/anaApi";

const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", 
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", 
  "SP", "SE", "TO"
];

// O Next.js fará cache estático dessa rota e revalidará a cada 24 horas (86400 segundos)
export const revalidate = 86400;

export async function GET() {
  try {
    // 1. Tentar buscar da API Real da ANA
    if (process.env.ANA_API_USER && process.env.ANA_API_PASSWORD) {
      console.log("Iniciando agregação das estações via API Hidro Webservice...");
      
      const features: any[] = [];
      
      // Promessas em lote (concorrência para evitar timeout)
      const chunkSize = 5;
      for (let i = 0; i < UFS.length; i += chunkSize) {
        const chunk = UFS.slice(i, i + chunkSize);
        
        const promises = chunk.map(async (uf) => {
          try {
            const res = await fetchAnaApi(`/EstacoesTelemetricas/HidroInventarioEstacoes/v1?Unidade%20Federativa=${uf}`);
            const data = await res.json();
            
            // Assume que os dados vêm num array, precisamos ver a estrutura exata, 
            // mas tipicamente APIs .NET retornam em data.items ou no root
            const stations = Array.isArray(data) ? data : (data.items || data.Items || []);
            
            return stations.map((s: any) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                // A ANA costuma retornar latitude e longitude no formato lat/lng ou Latitude/Longitude
                coordinates: [s.Longitude || s.lng || 0, s.Latitude || s.lat || 0],
              },
              properties: {
                name: s.Nome || s.nomeEstacao || s.name || "Estação",
                code: s.Codigo || s.codigoEstacao || s.id || "",
                network: "ANA", // Hardcoded temporário
                country: "Brasil",
                state: uf,
                basin: s.BaciaCodigo || s.bacia || s.Bacia || s.SubBacia || "",
                river: s.RioNome || s.rio || s.Rio || s.CorpoHidrico || "",
                responsible: s.Responsavel || s.responsavel || "ANA",
              },
            }));
          } catch (err) {
            console.error(`Erro ao buscar estações para a UF ${uf}:`, err);
            return [];
          }
        });
        
        const results = await Promise.all(promises);
        results.forEach(res => features.push(...res));
      }

      if (features.length > 0) {
        const geoJson = {
          type: "FeatureCollection",
          features,
        };
        
        return NextResponse.json(geoJson, {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        });
      }
      // Se features for 0, cai pro catch / fallback mock
    }

    // 2. Fallback para Mock local (se não tiver variáveis de ambiente)
    const jsonDirectory = path.join(process.cwd(), "public/data");
    const fileContents = await fs.readFile(
      path.join(jsonDirectory, "stations.json"),
      "utf8"
    );
    const mockData = JSON.parse(fileContents);

    // Filtrar apenas o Brasil no fallback e limpar propriedades para simular a API da ANA
    if (mockData.features) {
      mockData.features = mockData.features.filter((f: any) => {
        const country = f.properties.country || "";
        return country.toLowerCase().includes("brasil");
      });
      
      // Injetar dados simulados para permitir testes na UI de filtros
      mockData.features.forEach((f: any, index: number) => {
        f.properties.country = "Brasil";
        f.properties.state = index % 2 === 0 ? "SP" : "RJ";
        f.properties.basin = index % 3 === 0 ? "Bacia do Tietê" : "Bacia do Paraíba do Sul";
        f.properties.river = index % 2 === 0 ? "Rio Tietê" : "Rio Paraíba do Sul";
        f.properties.code = `MOCK-${index}`;
      });
    }

    return NextResponse.json(mockData, {
      headers: {
        "Cache-Control": "no-store, max-age=0", // Desabilitando cache para o dev visualizar rapidamente
      },
    });
  } catch (error) {
    console.error("Erro fatal em /api/stations:", error);
    return NextResponse.json(
      { error: "Failed to load stations data" },
      { status: 500 }
    );
  }
}
