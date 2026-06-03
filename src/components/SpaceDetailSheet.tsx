"use client";

"use client";

import { useState, useEffect } from "react";
import { X, Zap, MapPin, Clock, User, ChevronDown, PenLine, Bookmark, BookmarkCheck } from "lucide-react";
import { Space } from "@/types/space";
import { SPACE_COLORS } from "@/lib/mapbox";
import { addToCollection, removeFromCollection, isInCollection } from "@/lib/collection";
import Guestbook from "./Guestbook";

interface SpaceDetailSheetProps {
  space: Space;
  distance?: number;
  onClose: () => void;
  onWarp: (space: Space) => void;
  onRecord?: (space: Space) => void;
  currentUser?: { uid: string; nickname: string } | null;
}

const SPACE_LABELS: Record<string, string> = {
  official: "관광지",
  business: "비즈니스",
  user: "유저 공간",
  event: "이벤트",
};

const SPACE_EMOJIS: Record<string, string> = {
  official: "🏔️",
  business: "🍊",
  user: "✨",
  event: "🎪",
};

export default function SpaceDetailSheet({ space, distance, onClose, onWarp, onRecord, currentUser }: SpaceDetailSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    isInCollection(currentUser.uid, space.id).then(setCollectionId);
  }, [currentUser, space.id]);

  const handleCollectionToggle = async () => {
    if (!currentUser) return;
    if (collectionId) {
      await removeFromCollection(collectionId);
      setCollectionId(null);
    } else {
      const result = await addToCollection(currentUser.uid, space);
      if (result.success) {
        const newId = await isInCollection(currentUser.uid, space.id);
        setCollectionId(newId);
      }
    }
  };
  const color = SPACE_COLORS[space.type];

  const distanceText = distance != null
    ? distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
    : null;

  const timeAgo = (() => {
    const diff = Date.now() - space.lastActivityAt;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "오늘";
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return `${Math.floor(days / 30)}개월 전`;
  })();

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 rounded-t-3xl"
      style={{
        background: "rgba(10,15,30,0.96)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        maxHeight: expanded ? "80vh" : "auto",
        overflowY: expanded ? "auto" : "visible",
        transition: "max-height 0.3s ease",
      }}
    >
      {/* 핸들 */}
      <div
        className="w-10 h-1 rounded-full mx-auto mt-3 mb-1 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.2)" }}
        onClick={() => setExpanded((v) => !v)}
      />

      {/* 헤더 */}
      <div className="flex items-start gap-3 px-5 pt-3 pb-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          {SPACE_EMOJIS[space.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: `${color}33`, color }}
            >
              {SPACE_LABELS[space.type]}
            </span>
            {space.active && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.2)", color: "#22C55E" }}>
                활성
              </span>
            )}
          </div>
          <h2 className="text-white font-bold text-lg leading-tight">{space.name}</h2>
          {space.description && (
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{space.description}</p>
          )}
        </div>

        <button onClick={onClose} className="flex-shrink-0 mt-1">
          <X size={18} color="rgba(255,255,255,0.4)" />
        </button>
      </div>

      {/* 태그 */}
      {space.tags && space.tags.length > 0 && (
        <div className="flex gap-2 px-5 pb-3 flex-wrap">
          {space.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 메타 정보 */}
      <div className="flex items-center gap-4 px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {distanceText && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} color="rgba(255,255,255,0.4)" />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{distanceText}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock size={13} color="rgba(255,255,255,0.4)" />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{timeAgo}</span>
        </div>
        {space.ownerId && (
          <div className="flex items-center gap-1.5">
            <User size={13} color="rgba(255,255,255,0.4)" />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>오너</span>
          </div>
        )}
        <button
          className="ml-auto flex items-center gap-1"
          onClick={() => setExpanded((v) => !v)}
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <span className="text-xs">더보기</span>
          <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* 방명록 */}
      {expanded && (
        <div className="pb-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {currentUser ? (
            <Guestbook spaceId={space.id} authorId={currentUser.uid} nickname={currentUser.nickname} />
          ) : (
            <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              로그인 후 방명록을 남길 수 있습니다
            </p>
          )}
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="px-5 pb-8 pt-2 flex gap-2">
        {currentUser && (
          <button
            onClick={handleCollectionToggle}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: collectionId ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.08)", border: `1px solid ${collectionId ? "rgba(234,179,8,0.4)" : "rgba(255,255,255,0.12)"}` }}
          >
            {collectionId
              ? <BookmarkCheck size={18} color="#EAB308" />
              : <Bookmark size={18} color="rgba(255,255,255,0.6)" />}
          </button>
        )}
        {onRecord && (
          <button
            onClick={() => onRecord(space)}
            className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <PenLine size={15} />
            기록
          </button>
        )}
        <button
          onClick={() => onWarp(space)}
          className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: color, boxShadow: `0 0 20px ${color}60` }}
        >
          <Zap size={16} />
          워프
        </button>
      </div>
    </div>
  );
}
