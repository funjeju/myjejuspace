"use client";

import { useEffect, useRef } from "react";
import { User, Star, Bookmark, Map, LogOut, ChevronRight } from "lucide-react";
import { signOut } from "@/lib/auth";

interface ProfileMenuProps {
  nickname: string;
  userType: "explorer" | "owner";
  discoveryCount?: number;
  onClose: () => void;
  onMySpace: () => void;
  onCollection: () => void;
  onTripPlan: () => void;
  onOwnerUpgrade: () => void;
}

export default function ProfileMenu({
  nickname, userType, discoveryCount = 0,
  onClose, onMySpace, onCollection, onTripPlan, onOwnerUpgrade,
}: ProfileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const MENU = [
    { icon: Star, label: "마이스페이스", sub: "내 공간 관리", action: onMySpace },
    { icon: Bookmark, label: "컬렉션", sub: "저장한 공간", action: onCollection },
    { icon: Map, label: "여행 일정", sub: "AI 일정 만들기", action: onTripPlan },
  ];

  return (
    <div
      ref={ref}
      className="absolute left-3 z-40 rounded-2xl overflow-hidden"
      style={{
        top: 60,
        width: 240,
        background: "rgba(10,15,30,0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* 프로필 헤더 */}
      <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(167,139,250,0.25)", border: "1px solid rgba(167,139,250,0.4)" }}>
            <User size={18} color="#A78BFA" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{nickname}</p>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: userType === "owner" ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.08)", color: userType === "owner" ? "#A78BFA" : "rgba(255,255,255,0.5)" }}>
              {userType === "owner" ? "스페이스 오너" : "탐험자"}
            </span>
          </div>
        </div>
        {discoveryCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>이벤트 발견 {discoveryCount}회</span>
          </div>
        )}
      </div>

      {/* 메뉴 항목 */}
      <div className="py-1.5">
        {MENU.map(({ icon: Icon, label, sub, action }) => (
          <button key={label} onClick={() => { action(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5">
            <Icon size={16} color="rgba(255,255,255,0.5)" />
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{label}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>
            </div>
            <ChevronRight size={14} color="rgba(255,255,255,0.25)" />
          </button>
        ))}

        {userType === "explorer" && (
          <button onClick={() => { onOwnerUpgrade(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5">
            <span className="text-base">✨</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium" style={{ color: "#A78BFA" }}>스페이스 오너 되기</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>나만의 공간 생성</p>
            </div>
            <ChevronRight size={14} color="rgba(167,139,250,0.4)" />
          </button>
        )}
      </div>

      {/* 로그아웃 */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5">
          <LogOut size={16} color="rgba(239,68,68,0.7)" />
          <span className="text-sm" style={{ color: "rgba(239,68,68,0.8)" }}>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
