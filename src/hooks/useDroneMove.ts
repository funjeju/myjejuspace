"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

export function useDroneMove(map: mapboxgl.Map | null) {
  useEffect(() => {
    if (!map) return;

    // 드래그 중 속도 샘플 (최근 5개 평균)
    const samples: { dx: number; dy: number; dt: number }[] = [];
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let startCenter: mapboxgl.LngLat | null = null;

    const onDragStart = () => {
      samples.length = 0;
      lastTime = performance.now();
      startCenter = map.getCenter();
    };

    const onDrag = () => {
      // Mapbox가 이미 중심점을 옮겨줌 — 우리는 속도만 추적
      const now = performance.now();
      const center = map.getCenter();
      if (startCenter) {
        const pt = map.project(center);
        const prevPt = map.project(startCenter);
        const dx = pt.x - prevPt.x;
        const dy = pt.y - prevPt.y;
        const dt = now - lastTime;
        if (dt > 0) {
          samples.push({ dx, dy, dt });
          if (samples.length > 5) samples.shift();
        }
        lastX = pt.x;
        lastY = pt.y;
        lastTime = now;
        startCenter = center;
      }
    };

    const onDragEnd = () => {
      if (samples.length === 0) return;

      // 평균 속도 (픽셀/ms)
      const totalDt = samples.reduce((s, r) => s + r.dt, 0);
      const avgVx = samples.reduce((s, r) => s + r.dx, 0) / totalDt;
      const avgVy = samples.reduce((s, r) => s + r.dy, 0) / totalDt;
      const speed = Math.sqrt(avgVx ** 2 + avgVy ** 2);

      if (speed < 0.05) return; // 너무 느리면 관성 없음

      // 관성 거리: 속도에 비례 (드론 부양감)
      const inertiaFactor = 600;
      const targetDx = avgVx * inertiaFactor;
      const targetDy = avgVy * inertiaFactor;

      const currentCenter = map.project(map.getCenter());
      const targetScreen = {
        x: currentCenter.x + targetDx,
        y: currentCenter.y + targetDy,
      };

      const canvas = map.getCanvas();
      const clampedX = Math.max(0, Math.min(canvas.clientWidth, targetScreen.x));
      const clampedY = Math.max(0, Math.min(canvas.clientHeight, targetScreen.y));
      const targetLngLat = map.unproject([clampedX, clampedY]);

      // 드론 감속 곡선: easeOut cubic
      map.easeTo({
        center: targetLngLat,
        duration: Math.min(1800, speed * 8000),
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });

      samples.length = 0;
    };

    map.on("dragstart", onDragStart);
    map.on("drag", onDrag);
    map.on("dragend", onDragEnd);

    return () => {
      map.off("dragstart", onDragStart);
      map.off("drag", onDrag);
      map.off("dragend", onDragEnd);
    };
  }, [map]);
}
