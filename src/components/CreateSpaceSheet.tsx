"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { createUserSpace, getUserSpaceCount, getDistanceMeters } from "@/lib/spaces";
import { Space } from "@/types/space";

interface CreateSpaceSheetProps {
  lat: number;
  lng: number;
  ownerId: string;
  spaces: Space[];
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateSpaceSheet({ lat, lng, ownerId, spaces, onClose, onCreated }: CreateSpaceSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [preValidated, setPreValidated] = useState(false);
  // spaces는 ref로 보관 — onSnapshot 업데이트 시 effect 재실행 방지
  const spacesRef = useRef(spaces);
  useEffect(() => { spacesRef.current = spaces; }, [spaces]);

  // 시트 열릴 때 딱 1번만 검증 (lat, lng, ownerId 변경 시에만)
  useEffect(() => {
    let cancelled = false;
    setPreValidated(false);
    setError(null);
    setLimitReached(false);

    (async () => {
      // 50m 제한 — 메모리에서 즉시 확인
      const tooClose = spacesRef.current
        .filter((s) => s.type === "user")
        .some((s) => getDistanceMeters(lat, lng, s.coordinates.lat, s.coordinates.lng) < 50);

      if (tooClose) {
        if (!cancelled) { setError("반경 50m 이내에 이미 공간이 있습니다."); setPreValidated(true); }
        return;
      }

      // 공간 개수 제한 — Firestore 1회 쿼리
      const count = await getUserSpaceCount(ownerId);
      if (!cancelled) {
        if (count >= 1) {
          setLimitReached(true);
          setError("무료 플랜은 공간 1개까지 생성 가능합니다.");
        }
        setPreValidated(true);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, ownerId]); // spaces 제외 — ref로 처리

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    // preValidated=true이므로 Firestore 추가 쿼리 없이 바로 저장
    const result = await createUserSpace(ownerId, name, description, lat, lng, spaces, false, preValidated);
    setLoading(false);
    if (result.success) {
      onCreated();
    } else {
      if (result.limitReached) setLimitReached(true);
      setError(result.error ?? "오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 rounded-t-3xl px-5 pt-5 pb-10"
      style={{ background: "rgba(10,15,30,0.96)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.2)" }} />

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg">새 공간 만들기</h2>
        <button onClick={onClose}><X size={20} color="rgba(255,255,255,0.5)" /></button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
        style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
        <MapPin size={14} color="#A78BFA" />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
        {!preValidated && (
          <Loader2 size={11} color="rgba(255,255,255,0.3)" className="animate-spin ml-auto" />
        )}
      </div>

      <div className="mb-3">
        <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>공간 이름 *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="나만의 공간 이름"
          maxLength={30}
          autoFocus
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      <div className="mb-5">
        <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>소개 (선택)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 공간을 소개해주세요"
          maxLength={100}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {error && <p className="text-xs mb-3 text-center" style={{ color: "#EF4444" }}>{error}</p>}

      {limitReached ? (
        <div className="flex flex-col gap-2">
          <div className="w-full py-3 px-4 rounded-2xl text-sm text-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
            이미 공간 1개를 보유 중입니다
          </div>
          <div className="w-full py-3 rounded-2xl text-sm text-center"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: "#A78BFA" }}>
            ✨ 프리미엄으로 추가 공간 생성 가능 (준비 중)
          </div>
        </div>
      ) : (
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim() || !preValidated}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: (name.trim() && preValidated) ? "#A78BFA" : "rgba(167,139,250,0.3)",
            color: "white",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "생성 중..." : !preValidated ? "확인 중..." : "공간 생성하기"}
        </button>
      )}
    </div>
  );
}
