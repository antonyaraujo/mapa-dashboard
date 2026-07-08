import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { fetchAnaApi } from "@/lib/anaApi";

// Cache local por 4h
export const revalidate = 14400;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (process.env.ANA_API_USER && process.env.ANA_API_PASSWORD) {
      console.log(`Buscando série histórica para a estação ${id} na API da ANA...`);
      try {
        // Exemplo: buscando 30 dias com a v2
        const res = await fetchAnaApi(
          `/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v2?Codigos_Estacoes=${id}&Tipo%20Filtro%20Data=DATA_LEITURA&Range%20Intervalo%20de%20busca=DIAS_30`
        );
        const data = await res.json();
        
        // Transformar o payload da ANA no nosso formato simples para os gráficos { x: string[], y: number[] }
        const items = Array.isArray(data) ? data : (data.items || data.Items || []);
        
        const x: string[] = [];
        const y: number[] = [];
        
        items.forEach((item: any) => {
          // A chave exata depende do retorno. Usualmente temos DataHora ou Data, e Chuva ou Valor
          const dateStr = item.DataHora || item.Data || item.dataHora || item.data;
          const val = item.Chuva || item.Valor || item.chuva || item.valor || 0;
          if (dateStr) {
            x.push(dateStr);
            y.push(Number(val) || 0);
          }
        });

        if (x.length > 0) {
          return NextResponse.json({ x, y }, {
            headers: {
              "Cache-Control": "public, s-maxage=14400, stale-while-revalidate=7200",
            },
          });
        }
      } catch (err) {
        console.error(`Falha ao buscar dados para a estação ${id} na API:`, err);
        // Fallback mock below
      }
    }

    // 2. Fallback para Mock local se não houver variáveis ou se falhar
    const jsonDirectory = path.join(process.cwd(), "public/data");
    const fileContents = await fs.readFile(
      path.join(jsonDirectory, "year.json"),
      "utf8"
    );
    const data = JSON.parse(fileContents);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Erro fatal em /api/rainfall/[id]:", error);
    return NextResponse.json(
      { error: "Failed to load rainfall data" },
      { status: 500 }
    );
  }
}
