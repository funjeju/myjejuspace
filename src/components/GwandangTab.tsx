"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Check, X, Users, Clock } from "lucide-react";
import {
  getMyGwandang,
  getPendingRequests,
  acceptGwandang,
  removeGwandang,
} from "@/lib/gwandang";
import { GwandangRelation, User } from "@/types/space";

interface GwandangTabProps {
  uid: string;
}

type Relation = GwandangRelation & { id: string; peer: User | null };

export default function GwandangTab({ uid }: GwandangTabProps) {
  const [gwandang, setGwandang] = useState<Relation[]>([]);
  const [pending, setPending] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [g, p] = await Promise.all([getMyGwandang(uid), getPendingRequests(uid)]);
    setGwandang(g);
    setPending(p);
    setLoading(false);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id: string) => {
    await acceptGwandang(id);
    load();
  };

  const handleRemove = async (id: string) => {
    await removeGwandang(id);
    load();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-2xl animate-pulse">🌿</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* 대기 중 요청 */}
      {pending.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} color="#EAB308" />
            <span className="text-sm font-semibold" style={{ color: "#EAB308" }}>
              괸당 요청 {pending.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(167,139,250,0.2)" }}>
                  {r.peer?.nickname?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{r.peer?.nickname ?? "알 수 없음"}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>괸당 요청을 보냈습니다</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(r.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" }}>
                    <Check size={16} color="#22C55E" />
                  </button>
                  <button onClick={() => handleRemove(r.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
                    <X size={16} color="#EF4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 괸당 목록 */}
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} color="rgba(255,255,255,0.5)" />
        <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
          나의 괸당 {gwandang.length}명
        </span>
      </div>

      {gwandang.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <UserPlus size={40} color="rgba(255,255,255,0.15)" />
          <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            아직 괸당이 없습니다<br />공간을 탐험하며 인연을 만들어보세요
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {gwandang.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)" }}>
                {r.peer?.nickname?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{r.peer?.nickname ?? "알 수 없음"}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {r.peer?.type === "owner" ? "스페이스 오너" : "탐험자"}
                </p>
              </div>
              <button onClick={() => handleRemove(r.id)}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.15)", color: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.2)" }}>
                해제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
