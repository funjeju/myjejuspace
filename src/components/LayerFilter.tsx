"use client";

import { SpaceType } from "@/types/space";
import { SPACE_COLORS } from "@/lib/mapbox";

const FILTERS: { type: SpaceType | "all"; label: string; emoji: string }[] = [
  { type: "all", label: "전체", emoji: "🗺️" },
  { type: "official", label: "관광지", emoji: "🏔️" },
  { type: "business", label: "맛집·카페", emoji: "🍊" },
  { type: "user", label: "유저공간", emoji: "✨" },
  { type: "event", label: "이벤트", emoji: "🎪" },
];

interface LayerFilterProps {
  active: SpaceType | "all";
  onChange: (type: SpaceType | "all") => void;
}

export default function LayerFilter({ active, onChange }: LayerFilterProps) {
  return (
    <div className="absolute left-0 right-0 z-10 flex gap-2 px-4 overflow-x-auto no-scrollbar"
      style={{ bottom: 72 }}
    >
      {FILTERS.map(({ type, label, emoji }) => {
        const isActive = active === type;
        const color = type === "all" ? "#A78BFA" : SPACE_COLORS[type];
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200"
            style={{
              background: isActive ? `${color}33` : "rgba(10,15,30,0.75)",
              border: isActive ? `1px solid ${color}88` : "1px solid rgba(255,255,255,0.1)",
              color: isActive ? color : "rgba(255,255,255,0.6)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
