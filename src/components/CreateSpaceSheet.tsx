"use client";

import { useState } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { createUserSpace } from "@/lib/spaces";

interface CreateSpaceSheetProps {
  lat: number;
  lng: number;
  ownerId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateSpaceSheet({
  lat,
  lng,
  ownerId,
  onClose,
  onCreated,
}: CreateSpaceSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    const result = await createUserSpace(ownerId, name, description, lat, lng);
    setLoading(false);
    if (result.success) {
      onCreated();
    } else {
      setError(result.error ?? "오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 rounded-t-3xl px-5 pt-5 pb-10"
      style={{
        background: "rgba(10,15,30,0.96)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* 핸들 */}
      <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.2)" }} />

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg">새 공간 만들기</h2>
        <button onClick={onClose}>
          <X size={20} color="rgba(255,255,255,0.5)" />
        </button>
      </div>

      {/* 좌표 표시 */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
        style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}
      >
        <MapPin size={14} color="#A78BFA" />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>

      {/* 이름 입력 */}
      <div className="mb-3">
        <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>
          공간 이름 *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="나만의 공간 이름"
          maxLength={30}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </div>

      {/* 설명 입력 */}
      <div className="mb-5">
        <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>
          소개 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 공간을 소개해주세요"
          maxLength={100}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </div>

      {error && (
        <p className="text-xs mb-3 text-center" style={{ color: "#EF4444" }}>{error}</p>
      )}

      <button
        onClick={handleCreate}
        disabled={loading || !name.trim()}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
        style={{
          background: name.trim() ? "#A78BFA" : "rgba(167,139,250,0.3)",
          color: "white",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "생성 중..." : "공간 생성하기"}
      </button>
    </div>
  );
}
