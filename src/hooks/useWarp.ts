import { useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Space } from "@/types/space";

function createWarpSound(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.7);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.8);
}

export function useWarp(mapRef: React.MutableRefObject<mapboxgl.Map | null>) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const warp = useCallback(
    (space: Space) => {
      const map = mapRef.current;
      if (!map) return;

      // Play sound
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        createWarpSound(audioCtxRef.current);
      } catch {
        // Audio not supported — silent warp
      }

      // Phase 1: zoom out slightly
      map.easeTo({ zoom: map.getZoom() - 1.5, duration: 600, easing: (t) => t });

      // Phase 2: fly to target
      setTimeout(() => {
        map.flyTo({
          center: [space.coordinates.lng, space.coordinates.lat],
          zoom: 15,
          pitch: 45,
          bearing: Math.random() * 20 - 10,
          duration: 1400,
          essential: true,
        });
      }, 600);
    },
    [mapRef]
  );

  return { warp };
}
