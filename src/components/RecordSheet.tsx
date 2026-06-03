"use client";

import { useState, useRef } from "react";
import { X, Sparkles, Globe, Users, Lock, Loader2, Camera, Check } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Space, Visibility } from "@/types/space";
import { SPACE_COLORS } from "@/lib/mapbox";

interface RecordSheetProps {
  space: Space;
  authorId: string;
  onClose: () => void;
  onSaved: () => void;
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; Icon: typeof Globe; desc: string }[] = [
  { value: "public", label: "공개", Icon: Globe, desc: "모두에게 보임" },
  { value: "gwandang", label: "괸당 공개", Icon: Users, desc: "괸당만 볼 수 있음" },
  { value: "private", label: "비공개", Icon: Lock, desc: "나만 볼 수 있음" },
];

export default function RecordSheet({ space, authorId, onClose, onSaved }: RecordSheetProps) {
  const [text, setText] = useState("");
  const [refined, setRefined] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const color = SPACE_COLORS[space.type];

  const handleAI = async () => {
    if (!text.trim()) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, spaceName: space.name, spaceType: space.type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRefined(data.refined);
      setTags(data.tags ?? []);
    } catch {
      setError("AI 정리에 실패했습니다. 직접 저장할 수 있습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!text.trim() && !refined) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "contents"), {
        spaceId: space.id,
        authorId,
        type: "record",
        visibility,
        text: refined ?? text,
        originalText: text,
        tags,
        createdAt: Date.now(),
      });
      setDone(true);
      setTimeout(onSaved, 800);
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="absolute left-0 right-0 bottom-0 z-20 rounded-t-3xl px-5 py-10 flex flex-col items-center gap-3"
        style={{ background: "rgba(10,15,30,0.96)", backdropFilter: "blur(16px)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${color}33` }}>
          <Check size={28} color={color} />
        </div>
        <p className="text-white font-bold">기록이 저장됐습니다</p>
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 bottom-0 z-20 rounded-t-3xl"
      style={{ background: "rgba(10,15,30,0.96)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "90vh", overflowY: "auto" }}>
      <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ background: "rgba(255,255,255,0.2)" }} />

      <div className="flex items-center justify-between px-5 mb-4">
        <div>
          <h2 className="text-white font-bold text-lg">기록 남기기</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{space.name}</p>
        </div>
        <button onClick={onClose}><X size={20} color="rgba(255,255,255,0.4)" /></button>
      </div>

      {/* 텍스트 입력 */}
      <div className="px-5 mb-3">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setRefined(null); setTags([]); }}
          placeholder="이 순간을 짧게 기록해보세요..."
          rows={4}
          maxLength={200}
          className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{text.length}/200</span>
          <button
            onClick={handleAI}
            disabled={!text.trim() || aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: text.trim() ? `${color}33` : "rgba(255,255,255,0.05)",
              color: text.trim() ? color : "rgba(255,255,255,0.3)",
              border: `1px solid ${text.trim() ? color + "44" : "transparent"}`,
            }}
          >
            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI로 다듬기
          </button>
        </div>
      </div>

      {/* AI 결과 */}
      {refined && (
        <div className="mx-5 mb-4 px-4 py-3 rounded-2xl"
          style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} color={color} />
            <span className="text-xs font-semibold" style={{ color }}>AI 감성 버전</span>
          </div>
          <p className="text-sm text-white leading-relaxed">{refined}</p>
          {tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 사진 추가 */}
      <div className="px-5 mb-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}
        >
          <Camera size={16} />
          사진 추가 (준비 중)
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" multiple />
      </div>

      {/* 공개 범위 */}
      <div className="px-5 mb-5">
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>공개 범위</p>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map(({ value, label, Icon, desc }) => {
            const active = visibility === value;
            return (
              <button key={value} onClick={() => setVisibility(value)}
                className="flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all"
                style={{
                  background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                  border: active ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                <Icon size={16} color={active ? "#A78BFA" : "rgba(255,255,255,0.4)"} />
                <span className="text-xs font-semibold" style={{ color: active ? "#A78BFA" : "rgba(255,255,255,0.5)" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-center mb-3 px-5" style={{ color: "#EF4444" }}>{error}</p>}

      {/* 저장 버튼 */}
      <div className="px-5 pb-10">
        <button
          onClick={handleSave}
          disabled={saving || (!text.trim() && !refined)}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: (text.trim() || refined) ? color : "rgba(255,255,255,0.1)", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "저장 중..." : "기록 저장하기"}
        </button>
      </div>
    </div>
  );
}
