import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), "public/data");
    const fileContents = await fs.readFile(
      path.join(jsonDirectory, "stations.json"),
      "utf8"
    );
    const stations = JSON.parse(fileContents);

    return NextResponse.json(stations, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load stations data" },
      { status: 500 }
    );
  }
}
