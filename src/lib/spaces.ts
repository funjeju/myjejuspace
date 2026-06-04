import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  GeoPoint,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Space } from "@/types/space";

// 제주도 대략적 bbox
const JEJU_BOUNDS = {
  minLat: 33.10, maxLat: 33.57,
  minLng: 126.14, maxLng: 126.98,
};

export function isInsideJeju(lat: number, lng: number): boolean {
  return (
    lat >= JEJU_BOUNDS.minLat && lat <= JEJU_BOUNDS.maxLat &&
    lng >= JEJU_BOUNDS.minLng && lng <= JEJU_BOUNDS.maxLng
  );
}

// 실시간 스페이스 구독 (onSnapshot)
export function subscribeSpaces(callback: (spaces: Space[]) => void): () => void {
  const q = query(collection(db, "spaces"), where("active", "==", true));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Space)));
  });
}

// F-208 비즈니스 공간 방문 시 힌트 획득 기록
export async function recordBusinessVisit(uid: string, spaceId: string): Promise<void> {
  await addDoc(collection(db, "businessVisits"), {
    uid,
    spaceId,
    visitedAt: Date.now(),
  });
}

// 오늘 비즈니스 방문 여부 확인
export async function hasTodayBusinessVisit(uid: string): Promise<boolean> {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, "businessVisits"),
    where("uid", "==", uid),
    where("visitedAt", ">=", startOfDay.getTime())
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// 공간 삭제
export async function deleteUserSpace(spaceId: string, ownerId: string): Promise<{ success: boolean; error?: string }> {
  const ref = doc(db, "spaces", spaceId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { success: false, error: "공간을 찾을 수 없습니다." };
  if (snap.data().ownerId !== ownerId) return { success: false, error: "권한이 없습니다." };
  await deleteDoc(ref);
  return { success: true };
}

// 공간 활동 시간 갱신
export async function touchSpaceActivity(spaceId: string): Promise<void> {
  await updateDoc(doc(db, "spaces", spaceId), { lastActivityAt: Date.now(), inactiveWarned: false });
}

// 방문 기록 — 출석일수 + 방문자 수 업데이트 → 레벨 재계산
export async function recordSpaceVisit(spaceId: string, visitorUid: string): Promise<void> {
  const { calcSpaceLevel } = await import("./spaceLevel");
  const ref = doc(db, "spaces", spaceId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const lastVisitDate = data.lastVisitDate ?? "";
  const visitDays = (data.visitDays ?? 0) + (lastVisitDate === today ? 0 : 1);
  const visitorCount = (data.visitorCount ?? 0) + 1;
  const levelInfo = calcSpaceLevel(visitDays, visitorCount);

  await updateDoc(ref, {
    visitDays,
    visitorCount,
    lastVisitDate: today,
    level: levelInfo.level,
    lastActivityAt: Date.now(),
  });
}

// 두 좌표 간 거리 (미터)
export function getDistanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 50m 내 기존 유저 공간 존재 여부 확인 (메모리 내 spaces 사용 → Firestore 쿼리 없음)
function isTooCloseInMemory(lat: number, lng: number, spaces: Space[]): boolean {
  return spaces
    .filter((s) => s.type === "user")
    .some((s) => getDistanceMeters(lat, lng, s.coordinates.lat, s.coordinates.lng) < 50);
}

// F-401: 유저당 보유 공간 수 확인
export async function getUserSpaceCount(ownerId: string): Promise<number> {
  const q = query(collection(db, "spaces"), where("ownerId", "==", ownerId), where("type", "==", "user"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.size;
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim()).filter(Boolean);

export async function createUserSpace(
  ownerId: string,
  name: string,
  description: string,
  lat: number,
  lng: number,
  spaces: Space[],
  isPremium = false,
  preValidated = false,
  userEmail?: string
): Promise<{ success: boolean; error?: string; space?: Space; limitReached?: boolean }> {
  if (!name.trim()) return { success: false, error: "공간 이름을 입력해주세요." };

  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  // 50m 제한은 어드민 포함 모두 적용
  if (!preValidated && isTooCloseInMemory(lat, lng, spaces)) {
    return { success: false, error: "반경 50m 이내에 이미 공간이 있습니다." };
  }

  // 개수 제한은 어드민 제외
  if (!preValidated && !isAdmin && !isPremium) {
    const count = await getUserSpaceCount(ownerId);
    if (count >= 1) {
      return { success: false, error: "무료 플랜은 공간 1개까지 생성 가능합니다.", limitReached: true };
    }
  }

  const space: Omit<Space, "id"> & { geoPoint: GeoPoint } = {
    type: "user",
    name: name.trim(),
    description: description.trim(),
    coordinates: { lat, lng },
    geoPoint: new GeoPoint(lat, lng),
    ownerId,
    active: true,
    lastActivityAt: Date.now(),
  };

  const ref = await addDoc(collection(db, "spaces"), space);
  return { success: true, space: { ...space, id: ref.id } };
}

export async function fetchNearbySpaces(lat: number, lng: number): Promise<Space[]> {
  // 제주 전체 범위 내 공간 로드 (추후 geohash 쿼리로 교체)
  const snap = await getDocs(collection(db, "spaces"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Space));
}
