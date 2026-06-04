"use client";

import { useEffect, useState, useCallback } from "react";
import { Bookmark, X, Sparkles, Loader2, Send, Trash2 } from "lucide-react";
import { getMyCollection, removeFromCollection, CollectionItem } from "@/lib/collection";
import { calcSpaceLevel } from "@/lib/spaceLevel";
import { SPACE_COLORS } from "@/lib/mapbox";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Space } from "@/types/space";
import { deleteUserSpace } from "@/lib/spaces";

const SPACE_EMOJIS: Record<string, string> = {
  official: "🏔️", business: "🍊", user: "✨", event: "🎪",
};

interface MySpaceTabProps {
  uid: string;
  nickname: string;
}

async function confirmDelete(spaceId: string, uid: string, reload: () => void) {
  if (!confirm("이 공간을 삭제하시겠습니까? 복구할 수 없습니다.")) return;
  await deleteUserSpace(spaceId, uid);
  reload();
}

export default function MySpaceTab({ uid, nickname }: MySpaceTabProps) {
  const [mySpaces, setMySpaces] = useState<Space[]>([]);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, spacesSnap] = await Promise.all([
      getMyCollection(uid),
      getDocs(query(collection(db, "spaces"), where("ownerId", "==", uid))),
    ]);
    setItems(data);
    setMySpaces(spacesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Space)).filter((s) => s.type === "user"));
    setLoading(false);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (id: string) => {
    await removeFromCollection(id);
    load();
  };

  const handleAIPlan = async () => {
    if (items.length === 0) return;
    setAiLoading(true);
    setAiPlan(null);
    try {
      const res = await fetch("/api/ai-travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaces: items.map((i) => ({ name: i.spaceName, type: i.spaceType })), nickname }),
      });
      const data = await res.json();
      setAiPlan(data.plan ?? "일정을 생성하지 못했습니다.");
    } catch {
      setAiPlan("오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai-travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaces: items.map((i) => ({ name: i.spaceName, type: i.spaceType })),
          nickname,
          question: userMsg,
        }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.plan ?? "답변을 생성하지 못했습니다." }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: "ai", text: "오류가 발생했습니다." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="text-2xl animate-pulse">✨</div></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 내 공간 */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">✨</span>
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
            내 공간
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-1"
            style={{
              background: mySpaces.length > 0 ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)",
              color: mySpaces.length > 0 ? "#22C55E" : "rgba(255,255,255,0.4)",
            }}>
            {mySpaces.length > 0 ? `${mySpaces.length}개 있음` : "없음"}
          </span>
        </div>

        {mySpaces.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <span className="text-2xl">🏝️</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>아직 공간이 없어요</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>지도에서 우클릭 → 스페이스 만들기</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {mySpaces.map((space) => {
              const levelInfo = calcSpaceLevel(space.visitDays ?? 0, space.visitorCount ?? 0);
              return (
                <div key={space.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <img src={levelInfo.icon} style={{ width: 40, height: 40, objectFit: "contain" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm truncate">{space.name}</p>
                      <span className="text-xs" style={{ color: "#A78BFA" }}>Lv.{levelInfo.level}</span>
                    </div>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>📅 {space.visitDays ?? 0}일</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>👣 {space.visitorCount ?? 0}명</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: space.active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: space.active ? "#22C55E" : "rgba(255,255,255,0.4)" }}>
                    {space.active ? "활성" : "비활성"}
                  </span>
                  <button onClick={() => confirmDelete(space.id, uid, load)}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.15)" }}>
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mx-4 my-2" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* 컬렉션 */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark size={14} color="rgba(255,255,255,0.5)" />
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
            컬렉션 {items.length}곳
          </span>
          {items.length > 0 && (
            <button
              onClick={handleAIPlan}
              disabled={aiLoading}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(167,139,250,0.2)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.3)" }}
            >
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              AI 여행 일정
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Bookmark size={36} color="rgba(255,255,255,0.12)" />
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
              공간을 탐험하며 컬렉션을 채워보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {items.map((item) => {
              const color = SPACE_COLORS[item.spaceType] ?? "#A78BFA";
              return (
                <div key={item.id} className="relative px-3 py-3 rounded-2xl"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <button onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2">
                    <X size={13} color="rgba(255,255,255,0.3)" />
                  </button>
                  <div className="text-2xl mb-1.5">{SPACE_EMOJIS[item.spaceType] ?? "📍"}</div>
                  <p className="text-white text-xs font-semibold leading-tight truncate">{item.spaceName}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI 일정 결과 */}
      {aiPlan && (
        <div className="mx-4 mb-4 px-4 py-4 rounded-2xl"
          style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={13} color="#A78BFA" />
            <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>AI 추천 여행 일정</span>
          </div>
          <p className="text-sm text-white leading-relaxed whitespace-pre-line">{aiPlan}</p>
        </div>
      )}

      {/* AI 여행 비서 채팅 */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} color="#A78BFA" />
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>AI 여행 비서</span>
        </div>

        {chatHistory.length > 0 && (
          <div className="flex flex-col gap-2 mb-3 max-h-60 overflow-y-auto">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm"
                  style={{
                    background: msg.role === "user" ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.07)",
                    color: "white",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <Loader2 size={14} color="#A78BFA" className="animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleChat(); }}
            placeholder="제주 여행 질문을 해보세요..."
            className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: chatInput.trim() ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)" }}>
            <Send size={15} color={chatInput.trim() ? "#A78BFA" : "rgba(255,255,255,0.3)"} />
          </button>
        </div>
      </div>
    </div>
  );
}
