"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import mapboxgl from "mapbox-gl";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import LayerToggle from "@/components/LayerToggle";
import LoginScreen from "@/components/LoginScreen";
import LoginBanner from "@/components/LoginBanner";
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
import OwnerUpgradeSheet from "@/components/OwnerUpgradeSheet";
import SearchSheet from "@/components/SearchSheet";
import MapContextMenu from "@/components/MapContextMenu";
import ProfileMenu from "@/components/ProfileMenu";
import CCTVSheet from "@/components/CCTVSheet";
import BusinessPortal from "@/components/BusinessPortal";
import TripPlanTab from "@/components/TripPlanTab";
import { useEventProximity } from "@/hooks/useEventProximity";
import { useWarp } from "@/hooks/useWarp";
import { useAuth } from "@/hooks/useAuth";
import { useDroneMove } from "@/hooks/useDroneMove";
import { subscribeSpaces, isInsideJeju, recordBusinessVisit, hasTodayBusinessVisit, touchSpaceActivity } from "@/lib/spaces";
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

type Tab = "explore" | "myspace" | "gwandang" | "more" | "tripplan" | "business";

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [createCoords, setCreateCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [spaces, setSpaces] = useState<Space[]>(MOCK_SPACES);
  const [showMarkers, setShowMarkers] = useState(false);
  const [pitch, setPitch] = useState(0);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [layerFilter, setLayerFilter] = useState<SpaceType | "all">("all");
  const [recordSpace, setRecordSpace] = useState<Space | null>(null);
  const [dismissedEvents, setDismissedEvents] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<{ badge: string; points: number; eventName: string } | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [showOwnerUpgrade, setShowOwnerUpgrade] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCCTV, setShowCCTV] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState(9.5);
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);

  const { nearbyEvents } = useEventProximity(userLocation, spaces);
  const visibleNearbyEvent = nearbyEvents.find((e) => !dismissedEvents.has(e.space.id));

  const filteredSpaces = (layerFilter === "all" ? spaces : spaces.filter((s) => s.type === layerFilter))
    .filter((s) => s.type !== "event" || mapZoom >= 14);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const userRef = useRef(user); // stale closure 방지
  useEffect(() => { userRef.current = user; }, [user]);
  const { warp } = useWarp(mapRef);
  useDroneMove(mapInstance);

  // 실시간 리스너
  useEffect(() => {
    const unsub = subscribeSpaces((fetched) => {
      setSpaces(fetched.length > 0 ? fetched : MOCK_SPACES);
    });
    return unsub;
  }, []);

  const loadSpaces = useCallback(() => {}, []); // 실시간 구독으로 대체됨

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
        if (!mapRef.current) return;
        const { lng, lat } = e.lngLat;
        if (!userRef.current) { setShowLoginPopup(true); return; }
        setCreateCoords({ lat, lng });
        setSelectedSpace(null);
      }, 700);
    };
    const onPressEnd = () => {
      if (pressTimer) clearTimeout(pressTimer);
    };

    map.on("zoom", () => setMapZoom(map.getZoom()));

    // 우클릭 컨텍스트 메뉴 (데스크탑)
    map.on("contextmenu", (e) => {
      e.preventDefault?.();
      if (!userRef.current) { setShowLoginPopup(true); return; }
      const { lng, lat } = e.lngLat;
      setContextMenu({ x: e.originalEvent.clientX, y: e.originalEvent.clientY, lat, lng });
    });

    // 제주도 범위 이탈 방지
    map.on("moveend", () => {
      const { lat, lng } = map.getCenter();
      if (!isInsideJeju(lat, lng)) {
        map.easeTo({ center: [126.5292, 33.3617], duration: 800 });
      }
    });

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
    async (space: Space) => {
      warp(space);
      setSelectedSpace(null);

      // 공간 활동 시간 갱신
      if (space.id && space.type === "user") {
        touchSpaceActivity(space.id).catch(() => {});
      }

      // F-208: 비즈니스 공간 워프 시 힌트 획득 기록 (1일 1회)
      if (space.type === "business" && user) {
        const already = await hasTodayBusinessVisit(user.uid).catch(() => true);
        if (!already) {
          recordBusinessVisit(user.uid, space.id).catch(() => {});
          setNotifications((prev) => [
            ...prev,
            { id: Date.now().toString(), message: `🍊 ${space.name} 방문! 이벤트 힌트 레벨 2 획득` },
          ]);
          setTimeout(() => setNotifications((prev) => prev.slice(1)), 4000);
        }
      }
    },
    [warp, user]
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
      {!user && <LoginBanner />}
      <Map spaces={filteredSpaces} onSpaceClick={setSelectedSpace} onMapLoad={handleMapLoad} showMarkers={showMarkers} />
      <DirectionHUD map={mapInstance} spaces={filteredSpaces} userLocation={userLocation} />

      <TopBar
        nickname={user?.nickname}
        onSearchOpen={() => setShowSearch(true)}
        onCCTVOpen={() => setShowCCTV(true)}
        onProfileClick={() => user && setShowProfileMenu((v) => !v)}
        notificationCount={notifications.length}
      />

      {showProfileMenu && user && (
        <ProfileMenu
          nickname={user.nickname}
          userType={user.type}
          onClose={() => setShowProfileMenu(false)}
          onMySpace={() => setActiveTab("myspace")}
          onCollection={() => setActiveTab("myspace")}
          onTripPlan={() => setActiveTab("tripplan" as Tab)}
          onOwnerUpgrade={() => setShowOwnerUpgrade(true)}
        />
      )}

      <LayerToggle
        onLocate={handleLocate}
        pitch={pitch}
        onTogglePitch={handleTogglePitch}
        showMarkers={showMarkers}
        onToggleMarkers={() => setShowMarkers((v) => !v)}
      />

      <LayerFilter active={layerFilter} onChange={setLayerFilter} />

      {selectedSpace && !recordSpace && (
        <SpaceDetailSheet
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onWarp={handleWarp}
          onRecord={(space) => {
            if (!user) { setShowLoginPopup(true); return; }
            setRecordSpace(space); setSelectedSpace(null);
          }}
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

      {/* 여행 일정 탭 */}
      {activeTab === "tripplan" && user && (
        <div className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center px-5 pt-14 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold text-xl flex-1">여행 일정</h2>
            <button onClick={() => setActiveTab("explore")} className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>닫기</button>
          </div>
          <TripPlanTab uid={user.uid} nickname={user.nickname} />
        </div>
      )}

      {/* 비즈니스 포털 탭 */}
      {activeTab === "business" && user && (
        <div className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center px-5 pt-14 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold text-xl flex-1">비즈니스 포털</h2>
            <button onClick={() => setActiveTab("explore")} className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>닫기</button>
          </div>
          <BusinessPortal uid={user.uid} />
        </div>
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

            {user?.type === "explorer" && (
              <button onClick={() => { setShowOwnerUpgrade(true); setActiveTab("explore"); }}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl w-full text-left"
                style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <span className="text-2xl">✨</span>
                <div>
                  <p className="text-white font-semibold text-sm">스페이스 오너 되기</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>나만의 공간을 만들어보세요</p>
                </div>
              </button>
            )}

            <button onClick={() => setActiveTab("tripplan" as Tab)}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl w-full text-left"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <span className="text-2xl">🗓️</span>
              <div>
                <p className="text-white font-semibold text-sm">여행 일정 만들기</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>AI로 최적 동선 생성</p>
              </div>
            </button>

            <button onClick={() => setActiveTab("business" as Tab)}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl w-full text-left"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
              <span className="text-2xl">🍊</span>
              <div>
                <p className="text-white font-semibold text-sm">비즈니스 포털</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>제주 상권을 FunJeju에 연결</p>
              </div>
            </button>

            {user && (
              <button onClick={async () => {
                const idToken = await import("firebase/auth").then(m => m.getAuth().currentUser?.getIdToken());
                if (!idToken) return;
                const res = await fetch("/api/export-data", { headers: { Authorization: `Bearer ${idToken}` } });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "funeju-data.json"; a.click();
              }}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl w-full text-left"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-2xl">📦</span>
                <div>
                  <p className="text-white font-semibold text-sm">내 데이터 내보내기</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>기록·공간·컬렉션 JSON 다운로드</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 로그인 팝업 */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-10 px-6"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowLoginPopup(false)}>
          <div className="w-full rounded-3xl px-6 py-7 flex flex-col items-center gap-4"
            style={{ background: "rgba(10,15,30,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl">🌿</span>
            <div className="text-center">
              <p className="text-white font-bold text-lg">로그인이 필요해요</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                공간 생성, 기록, 괸당 등<br />모든 활동은 로그인 후 이용 가능합니다
              </p>
            </div>
            <LoginScreen onLogin={() => setShowLoginPopup(false)} />
          </div>
        </div>
      )}

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu && (
        <MapContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lat={contextMenu.lat}
          lng={contextMenu.lng}
          onCreateSpace={() => {
            setCreateCoords({ lat: contextMenu.lat, lng: contextMenu.lng });
            setSelectedSpace(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* 검색 */}
      {showSearch && (
        <SearchSheet
          spaces={spaces}
          onSelectSpace={(space) => { setSelectedSpace(space); setShowSearch(false); }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* CCTV */}
      {showCCTV && <CCTVSheet onClose={() => setShowCCTV(false)} />}

      {/* 오너 업그레이드 */}
      {showOwnerUpgrade && user && (
        <OwnerUpgradeSheet
          uid={user.uid}
          onClose={() => setShowOwnerUpgrade(false)}
          onUpgraded={() => { setShowOwnerUpgrade(false); }}
        />
      )}

      {/* 토스트 알림 */}
      <div className="absolute left-4 right-4 z-40 flex flex-col gap-2" style={{ top: 70 }}>
        {notifications.map((n) => (
          <div key={n.id} className="px-4 py-3 rounded-2xl text-sm text-white text-center"
            style={{ background: "rgba(249,115,22,0.85)", backdropFilter: "blur(8px)" }}>
            {n.message}
          </div>
        ))}
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (!user && tab !== "explore") { setShowLoginPopup(true); return; }
          setActiveTab(tab);
        }}
      />

      {/* 공간 생성 시트 */}
      {createCoords && user && (
        <CreateSpaceSheet
          lat={createCoords.lat}
          lng={createCoords.lng}
          ownerId={user.uid}
          spaces={spaces}
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
