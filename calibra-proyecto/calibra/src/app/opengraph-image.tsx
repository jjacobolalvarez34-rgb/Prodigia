import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6C4CF1, #4B2FCF)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: "10px solid rgba(255,255,255,0.9)",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "18px solid transparent",
              borderRight: "18px solid transparent",
              borderBottom: "56px solid #FFC53D",
              transform: "rotate(20deg)",
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "white" }}>Prodigia</div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>
          Práctica adaptativa: cálculo mental y lógica
        </div>
      </div>
    ),
    { ...size }
  );
}
