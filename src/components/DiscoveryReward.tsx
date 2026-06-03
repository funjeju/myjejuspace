"use client";

import { useEffect, useState } from "react";
import { Star, Trophy } from "lucide-react";

interface DiscoveryRewardProps {
  reward: { badge: string; points: number };
  eventName: string;
  onDone: () => void;
}

export default function DiscoveryReward({ reward, eventName, onDone }: DiscoveryRewardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    setTimeout(() => { setVisible(false); setTimeout(onDone, 400); }, 3500);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="flex flex-col items-center gap-4 px-10 py-8 rounded-3xl"
        style={{
          background: "rgba(234,179,8,0.15)",
          border: "1px solid rgba(234,179,8,0.5)",
          transform: visible ? "scale(1)" : "scale(0.8)",
          transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div className="text-5xl animate-spin" style={{ animationDuration: "2s" }}>🎪</div>
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-xl">발견!</p>
          <p className="text-white font-semibold mt-1">{eventName}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.3)" }}>
            <Trophy size={14} color="#EAB308" />
            <span className="text-sm font-bold" style={{ color: "#EAB308" }}>{reward.badge}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <Star size={14} color="#A78BFA" />
            <span className="text-sm font-bold" style={{ color: "#A78BFA" }}>+{reward.points}pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
