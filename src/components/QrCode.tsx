import { useEffect, useState } from "react";
import QRCode from "qrcode";
import logoNoBg from "@/assets/logo-no-bg.png";

interface Props {
  value: string;
  size?: number;
  className?: string;
  /** Draw the Vula Pay mark in the middle of the code. */
  branded?: boolean;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

interface LogoSource {
  img: HTMLImageElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

// logo-no-bg.png has a transparent margin baked in around the mark itself,
// so drawing it edge-to-edge still leaves visible white space. Crop that
// margin out once (by scanning alpha) and cache the result.
let logoSourcePromise: Promise<LogoSource> | null = null;

function cropContentBBox(img: HTMLImageElement): LogoSource {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scratch = document.createElement("canvas");
  scratch.width = w;
  scratch.height = h;
  const sctx = scratch.getContext("2d");
  if (!sctx) return { img, sx: 0, sy: 0, sw: w, sh: h };

  sctx.drawImage(img, 0, 0);
  const { data } = sctx.getImageData(0, 0, w, h);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if ((data[(y * w + x) * 4 + 3] ?? 0) > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return { img, sx: 0, sy: 0, sw: w, sh: h };
  return { img, sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 };
}

function getLogoSource(): Promise<LogoSource> {
  if (!logoSourcePromise) {
    logoSourcePromise = loadImage(logoNoBg)
      .then((img) => cropContentBBox(img))
      .catch((err) => {
        logoSourcePromise = null;
        throw err;
      });
  }
  return logoSourcePromise;
}

/** Renders a real scannable QR for a Vula Pay payment reference. */
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
        errorCorrectionLevel: branded ? "H" : "M",
        color: { dark: "#12211f", light: "#ffffff" },
      });

      if (branded) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const box = px * 0.3;
          const x = (px - box) / 2;
          const r = box * 0.24;

          ctx.fillStyle = "#ffffff";
          roundedRect(ctx, x - box * 0.08, x - box * 0.08, box * 1.16, box * 1.16, r);
          ctx.fill();

          const { img: logo, sx, sy, sw, sh } = await getLogoSource();
          const pad = box * 0.04;
          ctx.drawImage(logo, sx, sy, sw, sh, x + pad, x + pad, box - pad * 2, box - pad * 2);
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
    <div className={className} style={{ width: size, height: size }} aria-label={`QR code for ${value}`}>
      {src ? (
        <img src={src} alt={`Vula Pay QR code ${value}`} width={size} height={size} />
      ) : (
        <div className="h-full w-full animate-pulse rounded-md bg-muted" />
      )}
    </div>
  );
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
