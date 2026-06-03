"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import mapboxgl from "mapbox-gl";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import LayerToggle from "@/components/LayerToggle";
import SpaceCard from "@/components/SpaceCard";
import LoginScreen from "@/components/LoginScreen";
import CreateSpaceSheet from "@/components/CreateSpaceSheet";
import { useWarp } from "@/hooks/useWarp";
import { useAuth } from "@/hooks/useAuth";
import { fetchNearbySpaces } from "@/lib/spaces";
import { Space } from "@/types/space";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const MOCK_SPACES: Space[] = [
  {
    id: "1",
    type: "official",
    name: "성산일출봉",
    coordinates: { lat: 33.4585, lng: 126.9422 },
    active: true,
    lastActivityAt: Date.now(),
    tags: ["유네스코", "오름"],
  },
  {
    id: "2",
    type: "official",
    name: "한라산 백록담",
    coordinates: { lat: 33.3617, lng: 126.5292 },
    active: true,
    lastActivityAt: Date.now(),
    tags: ["국립공원", "등산"],
  },
  {
    id: "3",
    type: "business",
    name: "제주 흑돼지 거리",
    coordinates: { lat: 33.4996, lng: 126.5312 },
    active: true,
    lastActivityAt: Date.now(),
    tags: ["맛집", "흑돼지"],
  },
  {
    id: "4",
    type: "user",
    name: "나만의 카페 뷰포인트",
    coordinates: { lat: 33.4741, lng: 126.3317 },
    active: true,
    lastActivityAt: Date.now(),
  },
  {
    id: "5",
    type: "event",
    name: "🎪 숨겨진 이벤트",
    coordinates: { lat: 33.2529, lng: 126.5100 },
    active: true,
    lastActivityAt: Date.now(),
  },
];

type Tab = "explore" | "myspace" | "gwandang" | "more";

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [createCoords, setCreateCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [spaces, setSpaces] = useState<Space[]>(MOCK_SPACES);
  const [pitch, setPitch] = useState(0);
  const [sentinelVisible, setSentinelVisible] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { warp } = useWarp(mapRef);

  const loadSpaces = useCallback(async () => {
    try {
      const fetched = await fetchNearbySpaces(33.3617, 126.5292);
      setSpaces(fetched.length > 0 ? fetched : MOCK_SPACES);
    } catch {
      setSpaces(MOCK_SPACES);
    }
  }, []);

  const PITCH_STEPS = [0, 25, 45, 65];
  const handleTogglePitch = useCallback(() => {
    const idx = PITCH_STEPS.indexOf(pitch);
    const next = PITCH_STEPS[(idx + 1) % PITCH_STEPS.length];
    setPitch(next);
    mapRef.current?.easeTo({ pitch: next, duration: 600 });
  }, [pitch]);

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
    loadSpaces();

    // 롱프레스(700ms) → 공간 생성
    let pressTimer: ReturnType<typeof setTimeout> | null = null;

    const onPressStart = (e: mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) => {
      pressTimer = setTimeout(() => {
        const { lng, lat } = e.lngLat;
        setCreateCoords({ lat, lng });
        setSelectedSpace(null);
      }, 700);
    };
    const onPressEnd = () => {
      if (pressTimer) clearTimeout(pressTimer);
    };

    map.on("mousedown", onPressStart);
    map.on("mouseup", onPressEnd);
    map.on("mousemove", onPressEnd);
    map.on("touchstart", onPressStart);
    map.on("touchend", onPressEnd);
    map.on("touchmove", onPressEnd);
  }, [loadSpaces]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 15,
        duration: 1200,
      });
    });
  }, []);

  const handleWarp = useCallback(
    (space: Space) => {
      warp(space);
      setSelectedSpace(null);
    },
    [warp]
  );

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌿</div>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {!user && <LoginScreen onLogin={() => {}} />}
      <Map spaces={spaces} onSpaceClick={setSelectedSpace} onMapLoad={handleMapLoad} sentinelVisible={sentinelVisible} />

      <TopBar nickname={user?.nickname} />

      <LayerToggle
        onLocate={handleLocate}
        sentinelVisible={sentinelVisible}
        onToggleSentinel={() => setSentinelVisible((v) => !v)}
        pitch={pitch}
        onTogglePitch={handleTogglePitch}
      />

      <div
        className="absolute left-0 right-0 z-10 px-4 transition-all duration-300"
        style={{
          bottom: selectedSpace ? 72 : -200,
          opacity: selectedSpace ? 1 : 0,
        }}
      >
        {selectedSpace && (
          <SpaceCard
            space={selectedSpace}
            onClose={() => setSelectedSpace(null)}
            onWarp={handleWarp}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 공간 생성 시트 */}
      {createCoords && user && (
        <CreateSpaceSheet
          lat={createCoords.lat}
          lng={createCoords.lng}
          ownerId={user.uid}
          onClose={() => setCreateCoords(null)}
          onCreated={() => {
            setCreateCoords(null);
            loadSpaces();
          }}
        />
      )}
    </main>
  );
}
