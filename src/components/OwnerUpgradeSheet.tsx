"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2, Star } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface OwnerUpgradeSheetProps {
  uid: string;
  onClose: () => void;
  onUpgraded: () => void;
}

const TERMS = [
  "공간 반경 50m 이내 중복 생성 불가",
  "3개월 미활동 시 관리권이 자동 해제됩니다",
  "공간 내 불법·유해 콘텐츠 게시 금지",
  "상업적 이용 시 비즈니스 플랜 전환 필요",
  "FunJeju 운영 정책 변경 시 공지 후 적용",
];

export default function OwnerUpgradeSheet({ uid, onClose, onUpgraded }: OwnerUpgradeSheetProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", uid), {
        type: "owner",
        ownerSince: Date.now(),
        ownerTermsAgreedAt: Date.now(),
      });
      onUpgraded();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full rounded-t-3xl px-5 pt-5 pb-10"
        style={{ background: "rgba(10,15,30,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.2)" }} />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star size={20} color="#A78BFA" />
            <h2 className="text-white font-bold text-lg">스페이스 오너 되기</h2>
          </div>
          <button onClick={onClose}><X size={20} color="rgba(255,255,255,0.4)" /></button>
        </div>

        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
          스페이스 오너가 되면 제주도 어디든 나만의 공간을 만들 수 있습니다.
          아래 약관에 동의 후 시작하세요.
        </p>

        <div className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {TERMS.map((term, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle size={14} color="rgba(167,139,250,0.6)" className="mt-0.5 flex-shrink-0" />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{term}</span>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <div
            onClick={() => setAgreed((v) => !v)}
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: agreed ? "#A78BFA" : "rgba(255,255,255,0.08)",
              border: agreed ? "none" : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {agreed && <CheckCircle size={14} color="white" />}
          </div>
          <span className="text-sm text-white">위 약관에 동의합니다</span>
        </label>

        <button
          onClick={handleUpgrade}
          disabled={!agreed || loading}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background: agreed ? "#A78BFA" : "rgba(255,255,255,0.08)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
          {loading ? "처리 중..." : "스페이스 오너 시작하기"}
        </button>
      </div>
    </div>
  );
}
