import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Space } from "@/types/space";

export interface CollectionItem {
  id: string;
  userId: string;
  spaceId: string;
  spaceName: string;
  spaceType: string;
  savedAt: number;
}

export async function addToCollection(userId: string, space: Space) {
  const q = query(
    collection(db, "collections"),
    where("userId", "==", userId),
    where("spaceId", "==", space.id)
  );
  const snap = await getDocs(q);
  if (!snap.empty) return { error: "이미 컬렉션에 있습니다." };

  await addDoc(collection(db, "collections"), {
    userId,
    spaceId: space.id,
    spaceName: space.name,
    spaceType: space.type,
    savedAt: Date.now(),
  });
  return { success: true };
}

export async function removeFromCollection(itemId: string) {
  await deleteDoc(doc(db, "collections", itemId));
}

export async function getMyCollection(userId: string): Promise<CollectionItem[]> {
  const q = query(
    collection(db, "collections"),
    where("userId", "==", userId),
    orderBy("savedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CollectionItem));
}

export async function isInCollection(userId: string, spaceId: string): Promise<string | null> {
  const q = query(
    collection(db, "collections"),
    where("userId", "==", userId),
    where("spaceId", "==", spaceId)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}
