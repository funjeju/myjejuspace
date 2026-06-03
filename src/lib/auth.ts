import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from "@/types/space";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  const { uid, displayName, photoURL } = result.user;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const newUser: User = {
      uid,
      type: "explorer",
      nickname: displayName ?? "탐험자",
      avatarUrl: photoURL ?? undefined,
      createdAt: Date.now(),
    };
    await setDoc(ref, newUser);
    return newUser;
  }

  return snap.data() as User;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
