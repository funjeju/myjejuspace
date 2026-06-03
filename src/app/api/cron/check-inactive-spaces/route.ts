import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;
const WARNING_PERIOD = 7 * 24 * 60 * 60 * 1000; // 해제 7일 전 경고

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const now = Date.now();
  const cutoff = now - THREE_MONTHS;
  const warningCutoff = cutoff + WARNING_PERIOD;

  const snap = await db.collection("spaces")
    .where("type", "==", "user")
    .where("active", "==", true)
    .get();

  const warned: string[] = [];
  const released: string[] = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const last = data.lastActivityAt ?? data.createdAt ?? 0;

    if (last < cutoff) {
      // 3개월 초과 → 관리권 해제
      await doc.ref.update({ active: false, releasedAt: now, releaseReason: "inactive" });
      released.push(doc.id);

      // 오너에게 알림 기록
      if (data.ownerId) {
        await db.collection("notifications").add({
          uid: data.ownerId,
          type: "space_released",
          message: `"${data.name}" 공간의 관리권이 3개월 미활동으로 해제됐습니다.`,
          spaceId: doc.id,
          createdAt: now,
          read: false,
        });
      }
    } else if (last < warningCutoff && !data.inactiveWarned) {
      // 7일 이내 해제 예정 → 경고 알림
      await doc.ref.update({ inactiveWarned: true });
      warned.push(doc.id);

      if (data.ownerId) {
        await db.collection("notifications").add({
          uid: data.ownerId,
          type: "space_warning",
          message: `"${data.name}" 공간이 7일 후 미활동으로 관리권이 해제됩니다.`,
          spaceId: doc.id,
          createdAt: now,
          read: false,
        });
      }
    }
  }

  return NextResponse.json({ warned: warned.length, released: released.length });
}
