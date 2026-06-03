"use client";

import { useState } from "react";
import { X, Zap, MapPin } from "lucide-react";
import { NearbyEvent } from "@/hooks/useEventProximity";
import { getFunctions, httpsCallable } from "firebase/functions";

interface EventAlertProps {
  event: NearbyEvent;
  uid: string;
  onDismiss: () => void;
  onDiscovered: (eventId: string, reward: { badge: string; points: number }) => void;
}

export default function EventAlert({ event, uid, onDismiss, onDiscovered }: EventAlertProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dist = event.distanceMeters;

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    try {
      const functions = getFunctions(undefined, "asia-northeast3");
      const discoverEvent = httpsCallable(functions, "discoverEvent");
      const result = await discoverEvent({ eventId: event.space.id });
      const data = result.data as { success: boolean; reward: { badge: string; points: number } };
      onDiscovered(event.space.id, data.reward);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "발견 처리에 실패했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="absolute left-4 right-4 z-30 rounded-2xl px-4 py-4"
      style={{
        bottom: 80,
        background: "rgba(234,179,8,0.15)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(234,179,8,0.4)",
        boxShadow: "0 0 30px rgba(234,179,8,0.2)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0 animate-bounce">{event.space.name.split(" ")[0]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{event.space.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} color="#EAB308" />
            <span className="text-xs" style={{ color: "#EAB308" }}>
              {dist < 100 ? `${Math.round(dist)}m — 바로 앞!` : `${Math.round(dist)}m 근처`}
            </span>
          </div>

          {/* 거리 프로그레스 바 */}
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(5, 100 - (dist / 500) * 100)}%`,
                background: "linear-gradient(to right, #EAB308, #F97316)",
              }}
            />
          </div>
        </div>
        <button onClick={onDismiss} className="flex-shrink-0">
          <X size={16} color="rgba(255,255,255,0.5)" />
        </button>
      </div>

      {error && <p className="text-xs mt-2" style={{ color: "#EF4444" }}>{error}</p>}

      <button
        onClick={handleDiscover}
        disabled={loading}
        className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: "rgba(234,179,8,0.8)", color: "#000" }}
      >
        <Zap size={14} />
        {loading ? "발견 중..." : "발견하기!"}
      </button>
    </div>
  );
}
