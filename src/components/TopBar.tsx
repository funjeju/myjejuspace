"use client";

import { Search, Bell, User, Video } from "lucide-react";

interface TopBarProps {
  nickname?: string;
  onSearchOpen?: () => void;
  onCCTVOpen?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
}

export default function TopBar({ nickname = "탐험자", onSearchOpen, onCCTVOpen, onProfileClick, notificationCount = 0 }: TopBarProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-safe"
      style={{
        height: 56,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
      }}
    >
      <button
        onClick={onProfileClick}
        className="flex items-center gap-2 active:opacity-70 transition-opacity"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: "rgba(167,139,250,0.3)", border: "1px solid rgba(167,139,250,0.5)" }}
        >
          <User size={16} color="#A78BFA" />
        </div>
        <span className="text-white text-sm font-semibold">{nickname}</span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onCCTVOpen}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
          title="CCTV"
        >
          <Video size={16} color="#3B82F6" />
        </button>
        <button
          onClick={onSearchOpen}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
          title="검색"
        >
          <Search size={18} color="white" />
        </button>
        <div className="relative">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Bell size={18} color="white" />
          </button>
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "#EF4444", color: "white" }}>
              {notificationCount > 9 ? "9+" : notificationCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
