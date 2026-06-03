import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db, auth } = getAdmin();
  let uid: string;
  try {
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const [spacesSnap, contentsSnap, collectionsSnap] = await Promise.all([
    db.collection("spaces").where("ownerId", "==", uid).get(),
    db.collection("contents").where("authorId", "==", uid).get(),
    db.collection("collections").where("userId", "==", uid).get(),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    uid,
    spaces: spacesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    records: contentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    collections: collectionsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="funeju-data-${uid.slice(0, 8)}.json"`,
    },
  });
}
