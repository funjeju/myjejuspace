"use client";

import { Space } from "@/types/space";
import { SPACE_COLORS } from "@/lib/mapbox";
import { X, Zap, MapPin } from "lucide-react";

interface SpaceCardProps {
  space: Space;
  distance?: number;
  onClose: () => void;
  onWarp: (space: Space) => void;
}

const SPACE_LABELS: Record<string, string> = {
  official: "관광지",
  business: "비즈니스",
  user: "유저 공간",
  event: "이벤트",
};

const SPACE_EMOJIS: Record<string, string> = {
  official: "🏔️",
  business: "🍊",
  user: "✨",
  event: "🎪",
};

export default function SpaceCard({ space, distance, onClose, onWarp }: SpaceCardProps) {
  const color = SPACE_COLORS[space.type];
  const distanceText = distance != null ? (distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`) : null;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: "rgba(10,15,30,0.88)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        {SPACE_EMOJIS[space.type]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-base truncate">{space.name}</p>
        <span
          className="inline-block text-xs px-2 py-0.5 rounded-full mt-0.5"
          style={{ background: `${color}33`, color }}
        >
          {SPACE_LABELS[space.type]}
        </span>
        {distanceText && (
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={12} className="opacity-50" color="white" />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{distanceText}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 items-end flex-shrink-0">
        <button onClick={onClose} className="p-1 rounded-full" style={{ color: "rgba(255,255,255,0.4)" }}>
          <X size={16} />
        </button>
        <button
          onClick={() => onWarp(space)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: color, boxShadow: `0 0 12px ${color}80` }}
        >
          <Zap size={14} />
          워프
        </button>
      </div>
    </div>
  );
}
