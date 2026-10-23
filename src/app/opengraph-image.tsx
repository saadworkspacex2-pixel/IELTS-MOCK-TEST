import { ImageResponse } from "next/og";

export const alt = "IELTS Mock Test — প্রস্তুতি, পরীক্ষা, উন্নতি";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "76px",
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #212529 58%, #E51A24 160%)",
        color: "white",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#fca5a5" }}>
        IELTS MOCK TEST
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 24, fontSize: 76, lineHeight: 1.1, fontWeight: 800 }}>
        <span style={{ display: "flex" }}>প্রস্তুতি নিন।</span>
        <span style={{ display: "flex" }}>আত্মবিশ্বাস নিয়ে দিন।</span>
      </div>
      <div style={{ display: "flex", marginTop: 30, fontSize: 28, color: "#e5e7eb" }}>
        Reading · Listening · Writing · Grammar
      </div>
    </div>,
    size,
  );
}
