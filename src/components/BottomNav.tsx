"use client";

import { Compass, Star, Users, MoreHorizontal } from "lucide-react";

export type BottomTab = "explore" | "myspace" | "gwandang" | "more";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: BottomTab) => void;
}

const TABS = [
  { id: "explore" as BottomTab, label: "탐험", Icon: Compass },
  { id: "myspace" as BottomTab, label: "마이스페이스", Icon: Star },
  { id: "gwandang" as BottomTab, label: "괸당", Icon: Users },
  { id: "more" as BottomTab, label: "더보기", Icon: MoreHorizontal },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-around pb-safe"
      style={{
        height: 60,
        background: "rgba(10,15,30,0.92)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-1 min-w-[44px]"
          >
            <Icon
              size={22}
              color={active ? "#A78BFA" : "rgba(255,255,255,0.35)"}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? "#A78BFA" : "rgba(255,255,255,0.35)" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
