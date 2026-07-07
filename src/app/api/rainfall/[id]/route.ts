import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Na aplicação real, buscaríamos os dados da estação `id`
    // Para o MVP, retornamos o mock year.json
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
    return NextResponse.json(
      { error: "Failed to load rainfall data" },
      { status: 500 }
    );
  }
}
