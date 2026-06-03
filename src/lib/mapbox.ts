export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export const JEJU_CENTER: [number, number] = [126.5292, 33.3617];

export const MAPBOX_CONFIG = {
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: JEJU_CENTER,
  zoom: 9.5,
  pitch: 0,
  bearing: 0,
  minZoom: 9,
  maxZoom: 18,
} as const;

export const SPACE_COLORS: Record<string, string> = {
  official: "#22C55E",
  business: "#F97316",
  user: "#A78BFA",
  event: "#EAB308",
};
