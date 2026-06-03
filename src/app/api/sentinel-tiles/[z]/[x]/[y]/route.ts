import { NextRequest, NextResponse } from "next/server";

// 액세스 토큰 메모리 캐시 (서버 인스턴스 내)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }

  const res = await fetch(
    "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SENTINEL_CLIENT_ID!,
        client_secret: process.env.SENTINEL_CLIENT_SECRET!,
      }),
    }
  );

  if (!res.ok) throw new Error("Sentinel Hub token fetch failed");
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// 타일 좌표 → WGS84 bbox 변환
function tileToBbox(x: number, y: number, z: number): [number, number, number, number] {
  const n = Math.pow(2, z);
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const northRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const southRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
  return [west, (southRad * 180) / Math.PI, east, (northRad * 180) / Math.PI];
}

// False Color: 식생=선홍, 물=짙은청, 도심=청회 — Mapbox와 확연히 다름
const EVALSCRIPT = `//VERSION=3
function setup() {
  return { input: ["B08", "B04", "B03"], output: { bands: 3 } };
}
function evaluatePixel(s) {
  return [2.5 * s.B08, 2.5 * s.B04, 2.5 * s.B03];
}`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const bbox = tileToBbox(Number(x), Number(y), Number(z));

  try {
    const token = await getAccessToken();

    const body = {
      input: {
        bounds: {
          bbox,
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: { maxCloudCoverage: 30 },
          },
        ],
      },
      output: {
        width: 256,
        height: 256,
        responses: [{ identifier: "default", format: { type: "image/png" } }],
      },
      evalscript: EVALSCRIPT,
    };

    const res = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const image = await res.arrayBuffer();
    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // 타일 24시간 캐시
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
