import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { GwandangRelation, User } from "@/types/space";

// 괸당 요청 보내기
export async function sendGwandangRequest(fromUid: string, toUid: string) {
  // 이미 관계가 있는지 확인
  const existing = await getRelation(fromUid, toUid);
  if (existing) return { error: "이미 괸당 요청이 존재합니다." };

  await addDoc(collection(db, "gwandang"), {
    fromUserId: fromUid,
    toUserId: toUid,
    status: "pending",
    connectedAt: Date.now(),
  });
  return { success: true };
}

// 요청 수락
export async function acceptGwandang(relationId: string) {
  await updateDoc(doc(db, "gwandang", relationId), {
    status: "accepted",
    connectedAt: Date.now(),
  });
}

// 괸당 해제 or 요청 거절
export async function removeGwandang(relationId: string) {
  await deleteDoc(doc(db, "gwandang", relationId));
}

// 두 유저 간 관계 조회
export async function getRelation(uid1: string, uid2: string): Promise<(GwandangRelation & { id: string }) | null> {
  const q1 = query(collection(db, "gwandang"), where("fromUserId", "==", uid1), where("toUserId", "==", uid2));
  const q2 = query(collection(db, "gwandang"), where("fromUserId", "==", uid2), where("toUserId", "==", uid1));
  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const snap = [...s1.docs, ...s2.docs][0];
  if (!snap) return null;
  return { id: snap.id, ...(snap.data() as GwandangRelation) };
}

// 내 괸당 목록 (수락된)
export async function getMyGwandang(uid: string): Promise<(GwandangRelation & { id: string; peer: User | null })[]> {
  const q1 = query(collection(db, "gwandang"), where("fromUserId", "==", uid), where("status", "==", "accepted"));
  const q2 = query(collection(db, "gwandang"), where("toUserId", "==", uid), where("status", "==", "accepted"));
  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const relations = [...s1.docs, ...s2.docs].map((d) => ({ id: d.id, ...(d.data() as GwandangRelation) }));

  const withPeers = await Promise.all(
    relations.map(async (r) => {
      const peerUid = r.fromUserId === uid ? r.toUserId : r.fromUserId;
      const userSnap = await getDoc(doc(db, "users", peerUid));
      return { ...r, peer: userSnap.exists() ? (userSnap.data() as User) : null };
    })
  );
  return withPeers;
}

// 받은 대기 중 요청
export async function getPendingRequests(uid: string): Promise<(GwandangRelation & { id: string; peer: User | null })[]> {
  const q = query(collection(db, "gwandang"), where("toUserId", "==", uid), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const relations = snap.docs.map((d) => ({ id: d.id, ...(d.data() as GwandangRelation) }));

  return Promise.all(
    relations.map(async (r) => {
      const userSnap = await getDoc(doc(db, "users", r.fromUserId));
      return { ...r, peer: userSnap.exists() ? (userSnap.data() as User) : null };
    })
  );
}

// 방명록 남기기
export async function addGuestEntry(spaceId: string, authorId: string, nickname: string, message: string) {
  await addDoc(collection(db, "guestbook"), {
    spaceId,
    authorId,
    nickname,
    message: message.slice(0, 100),
    createdAt: Date.now(),
  });
}

// 방명록 조회
export async function getGuestEntries(spaceId: string) {
  const q = query(
    collection(db, "guestbook"),
    where("spaceId", "==", spaceId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string; spaceId: string; authorId: string; nickname: string; message: string; createdAt: number;
  }[];
}
