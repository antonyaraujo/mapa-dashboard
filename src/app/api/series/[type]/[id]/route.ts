import { NextResponse } from "next/server";
import { fetchAnaApi } from "@/lib/anaApi";

// Cache local por 4h
export const revalidate = 14400;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    
    if (!process.env.ANA_API_USER || !process.env.ANA_API_PASSWORD) {
       // Se não tem credenciais, falhamos rápido.
       return NextResponse.json({ x: [], y: [], error: "No Auth" }, { status: 401 });
    }

    let endpoint = "";
    let dateFilter = "DATA_LEITURA";
    let range = "DIAS_30"; // Padrão 30 dias para evitar sobrecarga, poderia vir por query params

    switch (type) {
      case "chuva":
        endpoint = `/EstacoesTelemetricas/HidroSerieChuva/v1?Código%20da%20Estação=${id}&Tipo%20Filtro%20Data=${dateFilter}&Data%20Inicial%20(yyyy-MM-dd)=2023-01-01&Data%20Final%20(yyyy-MM-dd)=2023-12-31`; 
        break;
      case "cota":
        endpoint = `/EstacoesTelemetricas/HidroSerieCotas/v1?Código%20da%20Estação=${id}&Tipo%20Filtro%20Data=${dateFilter}&Data%20Inicial%20(yyyy-MM-dd)=2023-01-01&Data%20Final%20(yyyy-MM-dd)=2023-12-31`;
        break;
      case "vazao":
        endpoint = `/EstacoesTelemetricas/HidroSerieVazao/v1?Código%20da%20Estação=${id}&Tipo%20Filtro%20Data=${dateFilter}&Data%20Inicial%20(yyyy-MM-dd)=2023-01-01&Data%20Final%20(yyyy-MM-dd)=2023-12-31`;
        break;
      case "qa":
        endpoint = `/EstacoesTelemetricas/HidroSerieQA/v1?Código%20da%20Estação=${id}&Tipo%20Filtro%20Data=${dateFilter}&Data%20Inicial%20(yyyy-MM-dd)=2023-01-01&Data%20Final%20(yyyy-MM-dd)=2023-12-31`;
        break;
      case "telemetrica":
        // Tenta buscar dados recentes (últimos 30 dias) adotados
        endpoint = `/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v2?Codigos_Estacoes=${id}&Tipo%20Filtro%20Data=${dateFilter}&Range%20Intervalo%20de%20busca=${range}`;
        break;
      default:
        return NextResponse.json({ error: "Tipo de série desconhecido" }, { status: 400 });
    }

    try {
      console.log(`Buscando série [${type}] para a estação ${id} na API da ANA...`);
      const res = await fetchAnaApi(endpoint);
      const data = await res.json();
      
      const items = Array.isArray(data) ? data : (data.items || data.Items || []);
      
      const x: string[] = [];
      const y: number[] = [];
      
      items.forEach((item: any) => {
        // As chaves dependem do tipo. Normalmente DataHora, Data, Chuva, Nivel, Vazao, Valor...
        const dateStr = item.DataHora || item.Data || item.dataHora || item.data;
        const val = item.Chuva || item.Cota || item.Nivel || item.Vazao || item.Valor || item.chuva || item.cota || item.vazao || item.valor;
        
        if (dateStr && val !== undefined && val !== null) {
          x.push(dateStr);
          y.push(Number(val) || 0);
        }
      });

      return NextResponse.json({ x, y }, {
        headers: {
          "Cache-Control": "public, s-maxage=14400, stale-while-revalidate=7200",
        },
      });

    } catch (err: any) {
      console.error(`Falha ao buscar dados [${type}] para a estação ${id}:`, err.message);
      return NextResponse.json({ x: [], y: [] }, { status: 200 }); // Retorna vazio em vez de crashar
    }

  } catch (error) {
    console.error("Erro fatal em /api/series/[type]/[id]:", error);
    return NextResponse.json(
      { error: "Failed to load series data" },
      { status: 500 }
    );
  }
}
