"use client";

import { Layers, Navigation } from "lucide-react";

// 0°=수직, 25°=살짝, 45°=드론, 65°=눈높이
const PITCH_STEPS = [0, 25, 45, 65];
// 버튼 내 막대 시각적 기울기 (CSS perspective용)
const PITCH_VISUAL = [0, 25, 45, 65];

interface LayerToggleProps {
  onLocate: () => void;
  sentinelVisible: boolean;
  onToggleSentinel: () => void;
  pitch: number;
  onTogglePitch: () => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
}

export default function LayerToggle({ onLocate, sentinelVisible, onToggleSentinel, pitch, onTogglePitch, showMarkers, onToggleMarkers }: LayerToggleProps) {
  const is3D = pitch > 0;

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
      {/* 마커 토글 */}
      <button
        onClick={onToggleMarkers}
        title={showMarkers ? "마커 숨기기" : "마커 보기"}
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: showMarkers ? "rgba(59,130,246,0.2)" : "rgba(10,15,30,0.80)",
          backdropFilter: "blur(8px)",
          border: showMarkers ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span className="text-sm">{showMarkers ? "📍" : "🗺️"}</span>
      </button>

      <button
        onClick={onLocate}
        title="현재 위치"
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: "rgba(10,15,30,0.80)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <Navigation size={18} color="rgba(255,255,255,0.7)" />
      </button>

      {/* Sentinel-2 토글 — 추후 활성화 */}
      {false && <button
        onClick={onToggleSentinel}
        title={sentinelVisible ? "Sentinel OFF" : "Sentinel ON"}
        className="w-11 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200"
        style={{
          background: sentinelVisible ? "rgba(34,197,94,0.25)" : "rgba(10,15,30,0.80)",
          backdropFilter: "blur(8px)",
          border: sentinelVisible ? "1px solid rgba(34,197,94,0.6)" : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Layers size={14} color={sentinelVisible ? "#22C55E" : "rgba(255,255,255,0.6)"} />
        <span className="text-[8px] font-bold leading-none" style={{ color: sentinelVisible ? "#22C55E" : "rgba(255,255,255,0.4)" }}>
          S2
        </span>
      </button>}

      {/* Pitch toggle — 4단계 */}
      <button
        onClick={onTogglePitch}
        title="시점 변경"
        className="w-11 rounded-2xl flex flex-col items-center justify-center py-2 gap-1 transition-all duration-200"
        style={{
          background: is3D ? "rgba(59,130,246,0.20)" : "rgba(10,15,30,0.80)",
          backdropFilter: "blur(8px)",
          border: is3D ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {PITCH_STEPS.map((step, i) => {
          const active = pitch === step;
          return (
            <div
              key={step}
              className="w-5 rounded-sm transition-all duration-200"
              style={{
                height: 3,
                background: active ? "#3B82F6" : "rgba(255,255,255,0.2)",
                transform: `perspective(20px) rotateX(${PITCH_VISUAL[i]}deg)`,
                transformOrigin: "center",
              }}
            />
          );
        })}
        <span className="text-[9px] font-bold mt-0.5 leading-none" style={{ color: is3D ? "#3B82F6" : "rgba(255,255,255,0.5)" }}>
          {pitch}°
        </span>
      </button>
    </div>
  );
}
