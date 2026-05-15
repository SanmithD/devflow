// app/share/[id]/opengraph-image.tsx
import Image from "next/image";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ✅ NOT async, NOT a client component
export default function OGImage({ params }: { params: { id: string } }) {
  const text = decodeURIComponent(params.id.split("_").slice(1).join("_"));
  const preview = text.slice(0, 30) + (text.length > 30 ? "..." : "");

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "48px",
          width: "100%",
          gap: "48px",
        }}
      >
        <Image
          src="https://res.cloudinary.com/dosufm3su/image/upload/v1778859637/devflow-logo_klg4y9.png"
          alt="logo"
          width={160}
          height={160}
          className="object-contain group-hover:opacity-80 transition-opacity duration-200"
          unoptimized
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "42px", fontWeight: 800, color: "white" }}>
            DevFlow
          </span>
          <span style={{ fontSize: "28px", color: "rgba(255,255,255,0.55)" }}>
            {preview}
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
