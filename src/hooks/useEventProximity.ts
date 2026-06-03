"use client";

import { useEffect, useState, useRef } from "react";
import { Space } from "@/types/space";
import { getDistanceMeters } from "@/lib/spaces";

export interface NearbyEvent {
  space: Space;
  distanceMeters: number;
}

// 반경 500m 이내 이벤트 감지
export function useEventProximity(
  userLocation: { lat: number; lng: number } | null,
  spaces: Space[]
) {
  const [nearbyEvents, setNearbyEvents] = useState<NearbyEvent[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userLocation) return;

    const events = spaces.filter((s) => s.type === "event");
    const nearby: NearbyEvent[] = [];

    for (const space of events) {
      const dist = getDistanceMeters(
        userLocation.lat, userLocation.lng,
        space.coordinates.lat, space.coordinates.lng
      );
      if (dist <= 500) {
        nearby.push({ space, distanceMeters: dist });
      }
    }

    // 새로 들어온 이벤트만 알림
    const newOnes = nearby.filter((n) => !notifiedRef.current.has(n.space.id));
    newOnes.forEach((n) => notifiedRef.current.add(n.space.id));

    setNearbyEvents(nearby);
  }, [userLocation, spaces]);

  return { nearbyEvents };
}
