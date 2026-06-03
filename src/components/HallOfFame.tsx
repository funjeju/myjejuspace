"use client";

import { useEffect, useState } from "react";
import { Trophy, MapPin } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Discovery {
  id: string;
  uid: string;
  eventName: string;
  discoveredAt: number;
  coordinates: { lat: number; lng: number };
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function HallOfFame() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "discoveries"), orderBy("discoveredAt", "desc"), limit(20));
      const snap = await getDocs(q);
      setDiscoveries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Discovery)));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Trophy size={16} color="#EAB308" />
        <h3 className="text-white font-bold">발견자 명예의 전당</h3>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl animate-pulse">🏆</div>
        </div>
      ) : discoveries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Trophy size={40} color="rgba(255,255,255,0.1)" />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>아직 발견된 이벤트가 없습니다</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {discoveries.map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: i < 3 ? "rgba(234,179,8,0.1)" : "rgba(255,255,255,0.04)", border: i < 3 ? "1px solid rgba(234,179,8,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-lg font-bold w-7 text-center flex-shrink-0" style={{ color: i === 0 ? "#EAB308" : i === 1 ? "#94A3B8" : i === 2 ? "#CD7C2F" : "rgba(255,255,255,0.3)" }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{d.eventName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} color="rgba(255,255,255,0.3)" />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {d.coordinates.lat.toFixed(4)}, {d.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
                {timeAgo(d.discoveredAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
