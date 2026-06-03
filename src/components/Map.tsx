"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAPBOX_CONFIG, SPACE_COLORS } from "@/lib/mapbox";
import { Space } from "@/types/space";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps {
  spaces: Space[];
  onSpaceClick: (space: Space) => void;
  onMapLoad?: (map: mapboxgl.Map) => void;
  sentinelVisible?: boolean;
  showMarkers?: boolean;
}

export default function Map({ spaces, onSpaceClick, onMapLoad, sentinelVisible = false, showMarkers = true }: MapProps) {
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
        el.style.cssText = `
          width: 36px; height: 36px;
          border-radius: 50%;
          background: ${SPACE_COLORS[space.type]};
          border: 2px solid rgba(255,255,255,0.8);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 12px ${SPACE_COLORS[space.type]}80;
          transition: transform 0.15s ease;
        `;
        el.innerHTML = space.type === "official" ? "🏔️" : space.type === "business" ? "🍊" : space.type === "user" ? "✨" : "🎪";
        el.addEventListener("mouseenter", () => (el.style.transform = "scale(1.2)"));
        el.addEventListener("mouseleave", () => (el.style.transform = "scale(1)"));
        el.addEventListener("click", () => onSpaceClick(space));

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

      // Sentinel-2 레이어 추가 (기본 숨김)
      map.addSource("sentinel", {
        type: "raster",
        tiles: ["/api/sentinel-tiles/{z}/{x}/{y}"],
        tileSize: 256,
        minzoom: 9,
        maxzoom: 16,
      });
      map.addLayer({
        id: "sentinel-layer",
        type: "raster",
        source: "sentinel",
        paint: { "raster-opacity": 0 },
      });

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

  // Sentinel 레이어 토글
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded()) return;
    map.setPaintProperty("sentinel-layer", "raster-opacity", sentinelVisible ? 1 : 0);
  }, [sentinelVisible]);

  return <div ref={containerRef} className="w-full h-full" />;
}
