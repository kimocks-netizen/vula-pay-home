import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  value: string;
  size?: number;
  className?: string;
  /** Draw the ScanPay mark in the middle of the code. */
  branded?: boolean;
}

/** Renders a real scannable QR for a permanent ScanPay payment reference. */
export function QrCode({ value, size = 220, className, branded = false }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const px = size * 3;

    async function build() {
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, value, {
        width: px,
        margin: 1,
        // High correction so the centre mark never breaks the scan.
        errorCorrectionLevel: branded ? "H" : "M",
        color: { dark: "#12211f", light: "#ffffff" },
      });

      if (branded) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const box = px * 0.24;
          const x = (px - box) / 2;
          const r = box * 0.24;
          const styles = getComputedStyle(document.documentElement);
          const primary = styles.getPropertyValue("--primary").trim() || "#1d63ff";

          ctx.fillStyle = "#ffffff";
          roundedRect(ctx, x - box * 0.08, x - box * 0.08, box * 1.16, box * 1.16, r);
          ctx.fill();

          ctx.fillStyle = primary.startsWith("oklch") ? `oklch(${primary.replace(/^oklch\(|\)$/g, "")})` : primary;
          roundedRect(ctx, x, x, box, box, r);
          ctx.fill();

          // Simple scan-line mark
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = box * 0.09;
          ctx.lineCap = "round";
          const p = box * 0.26;
          ctx.beginPath();
          ctx.moveTo(x + p, x + p * 1.35);
          ctx.lineTo(x + p, x + p);
          ctx.lineTo(x + p * 1.35, x + p);
          ctx.moveTo(x + box - p * 1.35, x + p);
          ctx.lineTo(x + box - p, x + p);
          ctx.lineTo(x + box - p, x + p * 1.35);
          ctx.moveTo(x + p, x + box - p * 1.35);
          ctx.lineTo(x + p, x + box - p);
          ctx.lineTo(x + p * 1.35, x + box - p);
          ctx.moveTo(x + box - p * 1.35, x + box - p);
          ctx.lineTo(x + box - p, x + box - p);
          ctx.lineTo(x + box - p, x + box - p * 1.35);
          ctx.moveTo(x + p * 0.7, x + box / 2);
          ctx.lineTo(x + box - p * 0.7, x + box / 2);
          ctx.stroke();
        }
      }

      if (!cancelled) setSrc(canvas.toDataURL("image/png"));
    }

    build().catch(() => setSrc(null));
    return () => {
      cancelled = true;
    };
  }, [value, size, branded]);

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      aria-label={`QR code for ${value}`}
    >
      {src ? (
        <img src={src} alt={`ScanPay QR code ${value}`} width={size} height={size} />
      ) : (
        <div className="h-full w-full animate-pulse rounded-md bg-muted" />
      )}
    </div>
  );
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
