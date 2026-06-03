"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, Plus, Ticket, MapPin, Loader2, Check, X } from "lucide-react";
import {
  collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BusinessSpace {
  id: string;
  name: string;
  description: string;
  category: string;
  coordinates: { lat: number; lng: number };
  ownerId: string;
  active: boolean;
  phone?: string;
  hours?: string;
}

interface Coupon {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  discount: string;
  expiresAt: number;
  usedCount: number;
  active: boolean;
}

interface BusinessPortalProps {
  uid: string;
}

const CATEGORIES = ["맛집", "카페", "숙소", "체험", "상점", "기타"];

export default function BusinessPortal({ uid }: BusinessPortalProps) {
  const [spaces, setSpaces] = useState<BusinessSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<BusinessSpace | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "register" | "coupons">("list");

  // 비즈니스 공간 등록 폼
  const [form, setForm] = useState({ name: "", description: "", category: "맛집", phone: "", hours: "" });
  const [saving, setSaving] = useState(false);

  // 쿠폰 등록 폼
  const [couponForm, setCouponForm] = useState({ title: "", description: "", discount: "", days: "30" });

  const loadSpaces = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, "spaces"), where("type", "==", "business"), where("ownerId", "==", uid));
    const snap = await getDocs(q);
    setSpaces(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessSpace)));
    setLoading(false);
  }, [uid]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);

  const loadCoupons = useCallback(async (spaceId: string) => {
    const q = query(collection(db, "coupons"), where("spaceId", "==", spaceId));
    const snap = await getDocs(q);
    setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon)));
  }, []);

  const handleRegister = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "spaces"), {
      type: "business",
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      phone: form.phone.trim(),
      hours: form.hours.trim(),
      coordinates: { lat: 33.3617, lng: 126.5292 }, // 기본값, 추후 지도 선택
      ownerId: uid,
      active: false, // 승인 후 활성화
      lastActivityAt: Date.now(),
      createdAt: Date.now(),
    });
    setSaving(false);
    setForm({ name: "", description: "", category: "맛집", phone: "", hours: "" });
    setView("list");
    loadSpaces();
  };

  const handleAddCoupon = async () => {
    if (!selectedSpace || !couponForm.title.trim()) return;
    const expiresAt = Date.now() + parseInt(couponForm.days) * 86400000;
    await addDoc(collection(db, "coupons"), {
      spaceId: selectedSpace.id,
      title: couponForm.title.trim(),
      description: couponForm.description.trim(),
      discount: couponForm.discount.trim(),
      expiresAt,
      usedCount: 0,
      active: true,
      createdAt: Date.now(),
    });
    setCouponForm({ title: "", description: "", discount: "", days: "30" });
    loadCoupons(selectedSpace.id);
  };

  const toggleCoupon = async (c: Coupon) => {
    await updateDoc(doc(db, "coupons", c.id), { active: !c.active });
    loadCoupons(selectedSpace!.id);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 size={24} color="#F97316" className="animate-spin" />
    </div>
  );

  if (view === "register") return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => setView("list")} style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">← 뒤로</button>
        <h3 className="text-white font-bold text-base">비즈니스 공간 등록</h3>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { key: "name", label: "상호명 *", placeholder: "가게 이름" },
          { key: "description", label: "소개", placeholder: "한 줄 소개" },
          { key: "phone", label: "전화번호", placeholder: "064-000-0000" },
          { key: "hours", label: "영업시간", placeholder: "09:00 ~ 21:00" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</label>
            <input value={form[key as keyof typeof form]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        ))}
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setForm((p) => ({ ...p, category: c }))}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: form.category === c ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.06)",
                  color: form.category === c ? "#F97316" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${form.category === c ? "rgba(249,115,22,0.4)" : "transparent"}`,
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs px-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          * 등록 후 운영팀 검토 후 활성화됩니다
        </p>
        <button onClick={handleRegister} disabled={!form.name.trim() || saving}
          className="w-full py-4 rounded-2xl font-bold text-white mt-2 flex items-center justify-center gap-2"
          style={{ background: form.name.trim() ? "#F97316" : "rgba(255,255,255,0.08)" }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Store size={16} />}
          {saving ? "등록 중..." : "등록 신청"}
        </button>
      </div>
    </div>
  );

  if (view === "coupons" && selectedSpace) return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => { setView("list"); setSelectedSpace(null); }} style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">← 뒤로</button>
        <h3 className="text-white font-bold text-base truncate">{selectedSpace.name} — 쿠폰</h3>
      </div>

      {/* 쿠폰 추가 */}
      <div className="p-4 rounded-2xl mb-4 flex flex-col gap-2"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>새 쿠폰 추가</p>
        {[
          { key: "title", placeholder: "쿠폰 제목 (예: 10% 할인)" },
          { key: "description", placeholder: "사용 조건" },
          { key: "discount", placeholder: "혜택 (예: 1만원 이상 10% 할인)" },
        ].map(({ key, placeholder }) => (
          <input key={key} value={couponForm[key as keyof typeof couponForm]}
            onChange={(e) => setCouponForm((p) => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
        ))}
        <div className="flex gap-2 items-center">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>유효기간</span>
          <select value={couponForm.days} onChange={(e) => setCouponForm((p) => ({ ...p, days: e.target.value }))}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {["7", "14", "30", "60", "90"].map((d) => <option key={d} value={d}>{d}일</option>)}
          </select>
          <button onClick={handleAddCoupon} disabled={!couponForm.title.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: couponForm.title.trim() ? "#F97316" : "rgba(255,255,255,0.08)" }}>
            추가
          </button>
        </div>
      </div>

      {/* 쿠폰 목록 */}
      {coupons.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>등록된 쿠폰이 없습니다</p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: c.active ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${c.active ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.08)"}` }}>
              <Ticket size={18} color={c.active ? "#F97316" : "rgba(255,255,255,0.3)"} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{c.title}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{c.discount}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>사용 {c.usedCount}회</p>
              </div>
              <button onClick={() => toggleCoupon(c)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: c.active ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)" }}>
                {c.active ? <Check size={14} color="#22C55E" /> : <X size={14} color="rgba(255,255,255,0.4)" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 목록 뷰
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>내 비즈니스 공간</span>
        <button onClick={() => setView("register")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(249,115,22,0.2)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)" }}>
          <Plus size={11} /> 공간 등록
        </button>
      </div>

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Store size={40} color="rgba(255,255,255,0.12)" />
          <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            등록된 비즈니스 공간이 없습니다<br />제주 상권을 FunJeju에 연결하세요
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {spaces.map((space) => (
            <div key={space.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(249,115,22,0.15)" }}>🍊</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{space.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{space.category}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: space.active ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)", color: space.active ? "#22C55E" : "rgba(255,255,255,0.4)" }}>
                    {space.active ? "활성" : "검토 중"}
                  </span>
                </div>
              </div>
              <button onClick={() => { setSelectedSpace(space); loadCoupons(space.id); setView("coupons"); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                <Ticket size={12} /> 쿠폰
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
