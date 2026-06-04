"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface MapContextMenuProps {
  x: number;
  y: number;
  lat: number;
  lng: number;
  onCreateSpace: () => void;
  onClose: () => void;
}

export default function MapContextMenu({ x, y, lat, lng, onCreateSpace, onClose }: MapContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // 화면 경계 보정
  const menuW = 220;
  const menuH = 100;
  const adjustedX = x + menuW > window.innerWidth ? x - menuW : x;
  const adjustedY = y + menuH > window.innerHeight ? y - menuH : y;

  return (
    <div
      ref={ref}
      className="fixed z-40 rounded-2xl overflow-hidden"
      style={{
        left: adjustedX,
        top: adjustedY,
        background: "rgba(10,15,30,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        minWidth: menuW,
      }}
    >
      {/* 좌표 표시 */}
      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      </div>

      {/* 메뉴 항목 */}
      <button
        onClick={() => { onCreateSpace(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(167,139,250,0.2)" }}>
          <MapPin size={14} color="#A78BFA" />
        </div>
        <span className="text-sm font-semibold text-white">이 위치에 스페이스 만들기</span>
      </button>
    </div>
  );
}
