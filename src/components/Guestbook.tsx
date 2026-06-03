"use client";

import { useEffect, useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { addGuestEntry, getGuestEntries } from "@/lib/gwandang";

interface GuestbookProps {
  spaceId: string;
  authorId: string;
  nickname: string;
}

type Entry = { id: string; nickname: string; message: string; createdAt: number };

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function Guestbook({ spaceId, authorId, nickname }: GuestbookProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getGuestEntries(spaceId);
    setEntries(data);
    setLoading(false);
  }, [spaceId]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    await addGuestEntry(spaceId, authorId, nickname, message.trim());
    setMessage("");
    await load();
    setSending(false);
  };

  return (
    <div>
      <p className="text-xs font-semibold mb-3 px-5" style={{ color: "rgba(255,255,255,0.4)" }}>
        방명록 {entries.length > 0 ? `(${entries.length})` : ""}
      </p>

      {/* 입력 */}
      <div className="flex gap-2 px-5 mb-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="방명록을 남겨보세요..."
          maxLength={100}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: message.trim() ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)" }}
        >
          {sending ? <Loader2 size={16} color="#A78BFA" className="animate-spin" /> : <Send size={16} color={message.trim() ? "#A78BFA" : "rgba(255,255,255,0.3)"} />}
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="px-5 py-4 flex justify-center">
          <Loader2 size={18} color="rgba(255,255,255,0.3)" className="animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>첫 방명록을 남겨보세요</p>
      ) : (
        <div className="flex flex-col gap-2 px-5 pb-2">
          {entries.map((e) => (
            <div key={e.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: "rgba(167,139,250,0.2)" }}>
                {e.nickname[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-white">{e.nickname}</span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{timeAgo(e.createdAt)}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{e.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
