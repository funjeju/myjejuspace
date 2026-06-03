"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
import { Space } from "@/types/space";

const TYPE_EMOJI: Record<Space["type"], string> = {
  official: "🏛️",
  business: "🏪",
  user: "📍",
  event: "🎉",
};

const TYPE_COLOR: Record<Space["type"], string> = {
  official: "#22C55E",
  business: "#F97316",
  user: "#A78BFA",
  event: "#EAB308",
};

const TYPE_LABEL: Record<Space["type"], string> = {
  official: "공식",
  business: "비즈니스",
  user: "유저",
  event: "이벤트",
};

interface SearchSheetProps {
  spaces: Space[];
  onSelectSpace: (space: Space) => void;
  onClose: () => void;
}

export default function SearchSheet({ spaces, onSelectSpace, onClose }: SearchSheetProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const filtered = query.trim()
    ? spaces.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleSelect(space: Space) {
    handleClose();
    setTimeout(() => onSelectSpace(space), 300);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ pointerEvents: "none" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "rgba(10,15,30,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          maxHeight: "80vh",
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <Search size={18} color="#94A3B8" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="공간 이름으로 검색..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-base outline-none"
          />
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 transition">
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginInline: 16 }} />

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {query.trim() === "" ? (
            <p className="text-slate-500 text-sm text-center py-8">검색어를 입력하세요</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">검색 결과가 없습니다</p>
          ) : (
            filtered.map((space) => (
              <button
                key={space.id}
                onClick={() => handleSelect(space)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
              >
                <span className="text-2xl w-8 text-center">{TYPE_EMOJI[space.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{space.name}</p>
                  {space.description && (
                    <p className="text-slate-500 text-xs truncate mt-0.5">{space.description}</p>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    background: TYPE_COLOR[space.type] + "22",
                    color: TYPE_COLOR[space.type],
                    border: `1px solid ${TYPE_COLOR[space.type]}44`,
                  }}
                >
                  {TYPE_LABEL[space.type]}
                </span>
              </button>
            ))
          )}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
