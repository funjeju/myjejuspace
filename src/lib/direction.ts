import { Space } from "@/types/space";
import { SPACE_COLORS } from "./mapbox";
import { getDistanceMeters } from "./spaces";

export interface ArrowInfo {
  space: Space;
  angle: number;       // 화면 기준 각도 (라디안)
  distanceKm: number;
  scale: number;
  opacity: number;
  color: string;
}

// 두 좌표 간 방위각 (라디안)
function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1R = (lat1 * Math.PI) / 180;
  const lat2R = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2R);
  const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
  return Math.atan2(y, x);
}

export function buildArrows(
  userLat: number,
  userLng: number,
  mapBearing: number,
  spaces: Space[]
): ArrowInfo[] {
  return spaces
    .map((space) => {
      const distM = getDistanceMeters(userLat, userLng, space.coordinates.lat, space.coordinates.lng);
      const distKm = distM / 1000;

      // 지도 회전 보정
      const bearing = getBearing(userLat, userLng, space.coordinates.lat, space.coordinates.lng);
      const angle = bearing - (mapBearing * Math.PI) / 180;

      // 거리별 크기/투명도
      let scale: number;
      let opacity: number;
      if (distKm < 1) { scale = 1.2; opacity = 1.0; }
      else if (distKm < 3) { scale = 1.0; opacity = 0.8; }
      else if (distKm < 5) { scale = 0.85; opacity = 0.6; }
      else { scale = 0.7; opacity = 0.35; }

      return {
        space,
        angle,
        distanceKm: distKm,
        scale,
        opacity,
        color: SPACE_COLORS[space.type],
      };
    })
    .filter((a) => a.distanceKm < 30) // 30km 이상은 표시 안 함
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8); // 최대 8개
}

export function drawArrows(
  canvas: HTMLCanvasElement,
  arrows: ArrowInfo[],
  userScreenX: number,
  userScreenY: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const radius = Math.min(canvas.width, canvas.height) * 0.32;

  arrows.forEach(({ angle, distanceKm, scale, opacity, color, space }) => {
    const x = userScreenX + Math.sin(angle) * radius;
    const y = userScreenY - Math.cos(angle) * radius;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(angle);

    const s = scale * 20;

    // 화살표 배경 원
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = `${color}22`;
    ctx.fill();
    ctx.strokeStyle = `${color}88`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 화살표
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.5, s * 0.4);
    ctx.lineTo(0, 0);
    ctx.lineTo(-s * 0.5, s * 0.4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.rotate(-angle);

    // 거리 텍스트
    const distText = distanceKm < 1
      ? `${Math.round(distanceKm * 1000)}m`
      : `${distanceKm.toFixed(1)}km`;

    ctx.font = `bold ${Math.round(10 * scale)}px sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(distText, 0, s * 2.4);

    // 공간 이름 (가까운 것만)
    if (distanceKm < 5) {
      ctx.font = `${Math.round(9 * scale)}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(
        space.name.length > 8 ? space.name.slice(0, 8) + "…" : space.name,
        0,
        s * 3.6
      );
    }

    ctx.restore();
  });
}
