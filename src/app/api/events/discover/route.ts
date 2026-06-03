import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return { db: getFirestore(), auth: getAuth() };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.slice(7);
  const { db, auth } = getAdmin();

  let uid: string;
  try {
    const decoded = await auth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { eventId } = await req.json();
  const eventRef = db.collection("spaces").doc(eventId);

  try {
    const reward = await db.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (!snap.exists) throw new Error("not-found");

      const event = snap.data()!;
      if (event.discoveredBy) throw new Error("already-discovered");
      if (event.expiresAt < Date.now()) throw new Error("expired");

      tx.update(eventRef, { discoveredBy: uid, discoveredAt: Date.now(), active: false });

      const discoveryRef = db.collection("discoveries").doc();
      tx.set(discoveryRef, {
        uid,
        eventId,
        eventName: event.name,
        coordinates: event.coordinates,
        discoveredAt: Date.now(),
      });

      const userRef = db.collection("users").doc(uid);
      tx.update(userRef, { discoveryCount: FieldValue.increment(1) });

      return { badge: "탐험가", points: 100 };
    });

    return NextResponse.json({ success: true, reward });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "already-discovered") return NextResponse.json({ error: "이미 발견된 이벤트입니다." }, { status: 409 });
    if (msg === "expired") return NextResponse.json({ error: "만료된 이벤트입니다." }, { status: 410 });
    if (msg === "not-found") return NextResponse.json({ error: "이벤트를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
