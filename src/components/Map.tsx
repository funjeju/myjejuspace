"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAPBOX_CONFIG, SPACE_COLORS } from "@/lib/mapbox";
import { Space } from "@/types/space";

mapboxgl.accessToken = MAPBOX_TOKEN;

// 유저 공간 레벨별 마커 이미지
export const SPACE_LEVEL_ICONS: Record<number, string> = {
  1: "/icons/space-lv1.png",
  2: "/icons/space-lv2.png",
  3: "/icons/space-lv3.png",
  4: "/icons/space-lv4.png",
  5: "/icons/space-lv5.png",
  6: "/icons/space-lv6.png",
};

interface MapProps {
  spaces: Space[];
  onSpaceClick: (space: Space) => void;
  onMapLoad?: (map: mapboxgl.Map) => void;
  showMarkers?: boolean;
}

export default function Map({ spaces, onSpaceClick, onMapLoad, showMarkers = true }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const addMarkers = useCallback(
    (map: mapboxgl.Map) => {
      clearMarkers();
      if (!showMarkers) return;
      spaces.forEach((space) => {
        const el = document.createElement("div");
        el.className = "space-marker";
        el.style.cssText = `cursor: pointer; transition: transform 0.15s ease;`;
        el.addEventListener("mouseenter", () => (el.style.transform = "scale(1.15)"));
        el.addEventListener("mouseleave", () => (el.style.transform = "scale(1)"));
        el.addEventListener("click", () => onSpaceClick(space));

        if (space.type === "user") {
          // Lv.1 이미지 마커
          el.style.cssText += `width: 56px; height: 56px;`;
          const img = document.createElement("img");
          img.src = "/icons/space-lv1.png";
          img.style.cssText = `width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));`;
          el.appendChild(img);
        } else {
          // 기존 원형 마커
          el.style.cssText += `
            width: 36px; height: 36px;
            border-radius: 50%;
            background: ${SPACE_COLORS[space.type]};
            border: 2px solid rgba(255,255,255,0.8);
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            box-shadow: 0 0 12px ${SPACE_COLORS[space.type]}80;
          `;
          el.innerHTML = space.type === "official" ? "🏔️" : space.type === "business" ? "🍊" : "🎪";
        }

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([space.coordinates.lng, space.coordinates.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    },
    [spaces, onSpaceClick, clearMarkers]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      ...MAPBOX_CONFIG,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      // Sentinel-2 레이어는 활성화 시점에 동적으로 추가 (불필요한 429 방지)

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      addMarkers(map);
      onMapLoad?.(map);
    });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current?.loaded()) {
      addMarkers(mapRef.current);
    }
  }, [spaces, addMarkers, showMarkers]);

  // Sentinel: 비활성화 상태 — 추후 활성화

  return <div ref={containerRef} className="w-full h-full" />;
}
