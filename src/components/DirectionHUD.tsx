"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Space } from "@/types/space";
import { buildArrows, drawArrows } from "@/lib/direction";

interface DirectionHUDProps {
  map: mapboxgl.Map | null;
  spaces: Space[];
  userLocation: { lat: number; lng: number } | null;
}

export default function DirectionHUD({ map, spaces, userLocation }: DirectionHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map || !userLocation || spaces.length === 0) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const render = () => {
      const center = map.getCenter();
      const bearing = map.getBearing();

      // 유저 위치의 화면 좌표
      const userPoint = map.project([userLocation.lng, userLocation.lat]);

      const arrows = buildArrows(
        userLocation.lat,
        userLocation.lng,
        bearing,
        spaces
      );

      drawArrows(canvas, arrows, userPoint.x, userPoint.y);
    };

    render();
    map.on("move", render);
    map.on("zoom", render);
    map.on("rotate", render);
    window.addEventListener("resize", resize);

    return () => {
      map.off("move", render);
      map.off("zoom", render);
      map.off("rotate", render);
      window.removeEventListener("resize", resize);
    };
  }, [map, spaces, userLocation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none"
    />
  );
}
