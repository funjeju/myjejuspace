"use client";

import { Search, Bell, User } from "lucide-react";

interface TopBarProps {
  nickname?: string;
}

export default function TopBar({ nickname = "탐험자" }: TopBarProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-safe"
      style={{
        height: 56,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: "rgba(167,139,250,0.3)", border: "1px solid rgba(167,139,250,0.5)" }}
        >
          <User size={16} color="#A78BFA" />
        </div>
        <span className="text-white text-sm font-semibold">{nickname}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <Search size={18} color="white" />
        </button>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <Bell size={18} color="white" />
        </button>
      </div>
    </div>
  );
}
