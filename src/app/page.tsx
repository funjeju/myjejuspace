"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import mapboxgl from "mapbox-gl";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import LayerToggle from "@/components/LayerToggle";
import LoginScreen from "@/components/LoginScreen";
import CreateSpaceSheet from "@/components/CreateSpaceSheet";
import DirectionHUD from "@/components/DirectionHUD";
import SpaceDetailSheet from "@/components/SpaceDetailSheet";
import LayerFilter from "@/components/LayerFilter";
import RecordSheet from "@/components/RecordSheet";
import GwandangTab from "@/components/GwandangTab";
import MySpaceTab from "@/components/MySpaceTab";
import EventAlert from "@/components/EventAlert";
import DiscoveryReward from "@/components/DiscoveryReward";
import HallOfFame from "@/components/HallOfFame";
import { useEventProximity } from "@/hooks/useEventProximity";
import { useWarp } from "@/hooks/useWarp";
import { useAuth } from "@/hooks/useAuth";
import { useDroneMove } from "@/hooks/useDroneMove";
import { fetchNearbySpaces } from "@/lib/spaces";
import { Space, SpaceType } from "@/types/space";

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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [layerFilter, setLayerFilter] = useState<SpaceType | "all">("all");
  const [recordSpace, setRecordSpace] = useState<Space | null>(null);
  const [dismissedEvents, setDismissedEvents] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<{ badge: string; points: number; eventName: string } | null>(null);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [mapZoom, setMapZoom] = useState(9.5);

  const { nearbyEvents } = useEventProximity(userLocation, spaces);
  const visibleNearbyEvent = nearbyEvents.find((e) => !dismissedEvents.has(e.space.id));

  const filteredSpaces = (layerFilter === "all" ? spaces : spaces.filter((s) => s.type === layerFilter))
    .filter((s) => s.type !== "event" || mapZoom >= 14);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const { warp } = useWarp(mapRef);
  useDroneMove(mapInstance);

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
    setMapInstance(map);
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

    map.on("zoom", () => setMapZoom(map.getZoom()));
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
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserLocation({ lat, lng });
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1200 });
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
      <Map spaces={filteredSpaces} onSpaceClick={setSelectedSpace} onMapLoad={handleMapLoad} sentinelVisible={sentinelVisible} />
      <DirectionHUD map={mapInstance} spaces={filteredSpaces} userLocation={userLocation} />

      <TopBar nickname={user?.nickname} />

      <LayerToggle
        onLocate={handleLocate}
        sentinelVisible={sentinelVisible}
        onToggleSentinel={() => setSentinelVisible((v) => !v)}
        pitch={pitch}
        onTogglePitch={handleTogglePitch}
      />

      <LayerFilter active={layerFilter} onChange={setLayerFilter} />

      {selectedSpace && !recordSpace && (
        <SpaceDetailSheet
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onWarp={handleWarp}
          onRecord={(space) => { setRecordSpace(space); setSelectedSpace(null); }}
          currentUser={user}
        />
      )}

      {/* 이벤트 근접 알림 */}
      {visibleNearbyEvent && user && (
        <EventAlert
          event={visibleNearbyEvent}
          uid={user.uid}
          onDismiss={() => setDismissedEvents((prev) => new Set([...prev, visibleNearbyEvent.space.id]))}
          onDiscovered={(eventId, r) => {
            setDismissedEvents((prev) => new Set([...prev, eventId]));
            setReward({ ...r, eventName: visibleNearbyEvent.space.name });
          }}
        />
      )}

      {/* 발견 보상 */}
      {reward && (
        <DiscoveryReward
          reward={reward}
          eventName={reward.eventName}
          onDone={() => setReward(null)}
        />
      )}

      {/* 명예의 전당 */}
      {showHallOfFame && (
        <div className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center px-5 pt-14 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => setShowHallOfFame(false)} className="mr-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>닫기</button>
          </div>
          <HallOfFame />
        </div>
      )}

      {recordSpace && user && (
        <RecordSheet
          space={recordSpace}
          authorId={user.uid}
          onClose={() => setRecordSpace(null)}
          onSaved={() => setRecordSpace(null)}
        />
      )}

      {/* 마이스페이스 탭 */}
      {activeTab === "myspace" && user && (
        <div className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold text-xl flex-1">마이스페이스</h2>
            <button onClick={() => setActiveTab("explore")} className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>닫기</button>
          </div>
          <MySpaceTab uid={user.uid} nickname={user.nickname} />
        </div>
      )}

      {/* 괸당 탭 오버레이 */}
      {activeTab === "gwandang" && user && (
        <div className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold text-xl flex-1">괸당</h2>
            <button onClick={() => setActiveTab("explore")} className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>닫기</button>
          </div>
          <GwandangTab uid={user.uid} />
        </div>
      )}

      {/* 더보기 탭 */}
      {activeTab === "more" && (
        <div className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center px-5 pt-14 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold text-xl flex-1">더보기</h2>
            <button onClick={() => setActiveTab("explore")} className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>닫기</button>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            <button onClick={() => { setShowHallOfFame(true); setActiveTab("explore"); }}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl w-full text-left"
              style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-white font-semibold text-sm">발견자 명예의 전당</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>이벤트를 발견한 탐험가들</p>
              </div>
            </button>
          </div>
        </div>
      )}

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
