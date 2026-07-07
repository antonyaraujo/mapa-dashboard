import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Mapa Dashboard - Rede Hidrometeorológica Nacional";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          color: "white",
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1 style={{ fontWeight: "bold", marginBottom: "20px" }}>Mapa Dashboard</h1>
          <p style={{ fontSize: 32, opacity: 0.8, textAlign: "center", maxWidth: "800px" }}>
            Visualização Interativa de Dados da Rede Hidrometeorológica Nacional (ANA)
          </p>
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "40px",
            fontSize: 24,
            opacity: 0.5,
          }}
        >
          Next.js • React-Leaflet • TailwindCSS • TanStack Query
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
