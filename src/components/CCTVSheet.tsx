"use client";

import { useState, useEffect } from "react";
import { X, Video } from "lucide-react";

interface CCTVItem {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

const MOCK_CCTV: CCTVItem[] = [
  { id: "1", name: "제주시 연동 교차로", location: "연동", lat: 33.4890, lng: 126.4983 },
  { id: "2", name: "중문관광단지 입구", location: "중문", lat: 33.2529, lng: 126.4124 },
  { id: "3", name: "성산일출봉 진입로", location: "성산", lat: 33.4585, lng: 126.9200 },
  { id: "4", name: "한라산 1100고지", location: "1100고지", lat: 33.3617, lng: 126.3825 },
  { id: "5", name: "애월 해안도로", location: "애월", lat: 33.4630, lng: 126.3149 },
  { id: "6", name: "서귀포 매일올레시장", location: "서귀포", lat: 33.2490, lng: 126.5600 },
];

interface CCTVSheetProps {
  onClose: () => void;
}

export default function CCTVSheet({ onClose }: CCTVSheetProps) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<CCTVItem>(MOCK_CCTV[0]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ pointerEvents: "auto" }}
    >
      {/* Sheet */}
      <div
        className="relative flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "rgba(10,15,30,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          maxHeight: "70vh",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <Video size={18} color="#3B82F6" />
            <span className="text-white font-semibold text-base">제주 실시간 CCTV</span>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 transition">
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        {/* Video Placeholder */}
        <div
          className="mx-4 mb-4 flex flex-col items-center justify-center gap-2"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderRadius: 12,
            border: "1px solid rgba(59,130,246,0.3)",
            aspectRatio: "16/9",
          }}
        >
          <span style={{ fontSize: 40 }}>📹</span>
          <p className="text-white font-medium text-sm">{selected.name}</p>
          <p className="text-slate-400 text-xs">{selected.location} · 실시간 영상 준비 중</p>
          <div
            className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
            <span className="text-red-400 text-xs font-medium">LIVE</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginInline: 16, marginBottom: 12 }} />

        {/* Thumbnail Scroll */}
        <div className="overflow-x-auto px-4 pb-6" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-3" style={{ width: "max-content" }}>
            {MOCK_CCTV.map((cctv) => {
              const isActive = cctv.id === selected.id;
              return (
                <button
                  key={cctv.id}
                  onClick={() => setSelected(cctv)}
                  className="flex flex-col items-center gap-1.5 transition"
                  style={{ minWidth: 80 }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.5)",
                      border: isActive ? "2px solid #3B82F6" : "2px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      transition: "border-color 0.2s",
                    }}
                  >
                    📹
                  </div>
                  <p
                    className="text-xs text-center leading-tight"
                    style={{
                      color: isActive ? "#3B82F6" : "#94A3B8",
                      fontWeight: isActive ? 600 : 400,
                      maxWidth: 72,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cctv.location}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
