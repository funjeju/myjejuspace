"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, Sparkles, Loader2, Download } from "lucide-react";
import { SPACE_COLORS } from "@/lib/mapbox";

const SPACE_EMOJIS: Record<string, string> = {
  official: "🏔️", business: "🍊", user: "✨", event: "🎪",
};

interface PlanItem {
  id: string;
  name: string;
  type: string;
  memo: string;
  time: string;
}

interface TripPlanTabProps {
  uid: string;
  nickname: string;
}

export default function TripPlanTab({ uid, nickname }: TripPlanTabProps) {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("official");
  const [newTime, setNewTime] = useState("09:00");
  const [newMemo, setNewMemo] = useState("");
  const [adding, setAdding] = useState(false);

  const addItem = () => {
    if (!newName.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName.trim(), type: newType, memo: newMemo.trim(), time: newTime },
    ]);
    setNewName(""); setNewMemo(""); setAdding(false);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleAIPlan = useCallback(async () => {
    if (items.length === 0) return;
    setAiLoading(true); setAiPlan(null);
    try {
      const res = await fetch("/api/ai-travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaces: items.map((i) => ({ name: i.name, type: i.type })),
          nickname,
          question: `다음 장소들을 시간 순서(${items.map((i) => i.time + " " + i.name).join(", ")})에 맞게 여행 일정으로 정리해줘. 이동 동선과 예상 소요 시간도 포함해줘.`,
        }),
      });
      const data = await res.json();
      setAiPlan(data.plan ?? "일정 생성 실패");
    } catch { setAiPlan("오류가 발생했습니다."); }
    finally { setAiLoading(false); }
  }, [items, nickname]);

  const exportPlan = () => {
    const text = items.map((i) => `${i.time} ${i.name}${i.memo ? ` — ${i.memo}` : ""}`).join("\n");
    const full = aiPlan ? `${text}\n\n--- AI 추천 일정 ---\n${aiPlan}` : text;
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "funeju-trip.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
            일정 {items.length}개
          </span>
          <div className="flex gap-2">
            {items.length > 0 && (
              <>
                <button onClick={exportPlan}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <Download size={11} /> 내보내기
                </button>
                <button onClick={handleAIPlan} disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(167,139,250,0.2)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.3)" }}>
                  {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  AI 최적화
                </button>
              </>
            )}
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(34,197,94,0.2)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
              <Plus size={11} /> 추가
            </button>
          </div>
        </div>

        {/* 추가 폼 */}
        {adding && (
          <div className="mb-4 p-4 rounded-2xl flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex gap-2">
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none w-28 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="장소명" className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div className="flex gap-2">
              {(["official", "business", "user", "event"] as const).map((t) => (
                <button key={t} onClick={() => setNewType(t)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: newType === t ? `${SPACE_COLORS[t]}33` : "rgba(255,255,255,0.05)",
                    color: newType === t ? SPACE_COLORS[t] : "rgba(255,255,255,0.4)",
                    border: `1px solid ${newType === t ? SPACE_COLORS[t] + "44" : "transparent"}`,
                  }}>
                  {SPACE_EMOJIS[t]}
                </button>
              ))}
            </div>
            <input value={newMemo} onChange={(e) => setNewMemo(e.target.value)}
              placeholder="메모 (선택)" className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>취소</button>
              <button onClick={addItem} disabled={!newName.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: newName.trim() ? "#22C55E" : "rgba(255,255,255,0.08)" }}>추가</button>
            </div>
          </div>
        )}

        {/* 일정 리스트 */}
        {items.length === 0 && !adding ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <span className="text-4xl">🗓️</span>
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
              + 추가 버튼으로 일정을 만들어보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {items.sort((a, b) => a.time.localeCompare(b.time)).map((item) => {
              const color = SPACE_COLORS[item.type];
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <GripVertical size={14} color="rgba(255,255,255,0.2)" className="flex-shrink-0" />
                  <span className="text-xs font-bold w-12 flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{item.time}</span>
                  <span className="text-lg flex-shrink-0">{SPACE_EMOJIS[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                    {item.memo && <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{item.memo}</p>}
                  </div>
                  <button onClick={() => removeItem(item.id)}>
                    <Trash2 size={14} color="rgba(255,255,255,0.3)" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* AI 결과 */}
        {aiPlan && (
          <div className="px-4 py-4 rounded-2xl"
            style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} color="#A78BFA" />
              <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>AI 최적화 일정</span>
            </div>
            <p className="text-sm text-white leading-relaxed whitespace-pre-line">{aiPlan}</p>
          </div>
        )}
      </div>
    </div>
  );
}
