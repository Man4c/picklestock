import { ImageResponse } from "next/og";

export const alt = "PickleStock — katalog raket pickleball dengan stok terkini";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "white",
        color: "black",
        padding: "72px 84px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800 }}>
          PickleStock
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 38,
            lineHeight: 1.25,
            color: "dimgray",
          }}
        >
          Temukan paddle yang tepat. Cek stoknya. Pesan langsung.
        </div>
      </div>
      <div
        style={{
          width: 330,
          height: 430,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 190,
            height: 270,
            borderRadius: 76,
            background: "black",
            transform: "rotate(-20deg)",
            display: "flex",
            position: "absolute",
            top: 18,
            left: 36,
          }}
        />
        <div
          style={{
            width: 42,
            height: 145,
            borderRadius: 22,
            background: "black",
            transform: "rotate(-20deg)",
            display: "flex",
            position: "absolute",
            bottom: 22,
            left: 156,
          }}
        />
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 999,
            border: "10px solid black",
            background: "white",
            display: "flex",
            position: "absolute",
            top: 48,
            right: 0,
          }}
        />
      </div>
    </div>,
    size,
  );
}
