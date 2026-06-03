import {
  collection,
  addDoc,
  getDocs,
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

// 공간 활동 시간 갱신
export async function touchSpaceActivity(spaceId: string): Promise<void> {
  await updateDoc(doc(db, "spaces", spaceId), { lastActivityAt: Date.now(), inactiveWarned: false });
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

// 50m 내 기존 유저 공간 존재 여부 확인
async function isTooClose(lat: number, lng: number): Promise<boolean> {
  // 위도 0.0005도 ≈ 55m, 간단한 bbox 사전 필터
  const snap = await getDocs(
    query(collection(db, "spaces"), where("type", "==", "user"))
  );
  for (const d of snap.docs) {
    const s = d.data() as Space & { coordinates: { lat: number; lng: number } };
    if (getDistanceMeters(lat, lng, s.coordinates.lat, s.coordinates.lng) < 50) {
      return true;
    }
  }
  return false;
}

export async function createUserSpace(
  ownerId: string,
  name: string,
  description: string,
  lat: number,
  lng: number
): Promise<{ success: boolean; error?: string; space?: Space }> {
  if (!name.trim()) return { success: false, error: "공간 이름을 입력해주세요." };

  const tooClose = await isTooClose(lat, lng);
  if (tooClose) {
    return { success: false, error: "반경 50m 이내에 이미 공간이 있습니다." };
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
