import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin 초기화 (서버사이드)
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

const JEJU_BOUNDS = {
  minLat: 33.10, maxLat: 33.57,
  minLng: 126.14, maxLng: 126.98,
};

const HINT_REGIONS = [
  { name: "제주시", lat: 33.4996, lng: 126.5312 },
  { name: "서귀포시", lat: 33.2541, lng: 126.5600 },
  { name: "애월읍", lat: 33.4630, lng: 126.3149 },
  { name: "성산읍", lat: 33.4585, lng: 126.9200 },
  { name: "한림읍", lat: 33.4159, lng: 126.2658 },
  { name: "남원읍", lat: 33.2690, lng: 126.7102 },
  { name: "안덕면", lat: 33.2503, lng: 126.3604 },
  { name: "조천읍", lat: 33.5316, lng: 126.6396 },
];

const EVENT_TITLES = [
  "🌊 바람의 조각", "🌺 제주의 선물", "🌙 달빛 탐험",
  "🌿 숲속의 비밀", "🔮 신비한 오브젝트", "⭐ 별의 파편",
  "🦋 제주의 나비", "🌋 용암의 흔적", "🍊 황금 감귤",
];

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function getRegionName(lat: number, lng: number) {
  return HINT_REGIONS.reduce((nearest, r) => {
    const d = Math.sqrt((lat - r.lat) ** 2 + (lng - r.lng) ** 2);
    const nd = Math.sqrt((lat - nearest.lat) ** 2 + (lng - nearest.lng) ** 2);
    return d < nd ? r : nearest;
  }).name;
}

export async function GET(req: NextRequest) {
  // Vercel Cron 인증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const count = Math.floor(Math.random() * 2) + 1;
  const spawned: string[] = [];

  for (let i = 0; i < count; i++) {
    const lat = randomInRange(JEJU_BOUNDS.minLat, JEJU_BOUNDS.maxLat);
    const lng = randomInRange(JEJU_BOUNDS.minLng, JEJU_BOUNDS.maxLng);
    const regionName = getRegionName(lat, lng);
    const title = EVENT_TITLES[Math.floor(Math.random() * EVENT_TITLES.length)];

    const ref = await db.collection("spaces").add({
      type: "event",
      name: title,
      coordinates: { lat, lng },
      active: true,
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      hint: {
        level1: regionName,
        level2: { lat, lng, radius: 10000 },
        level3: { lat, lng, radius: 1000 },
      },
      discoveredBy: null,
      createdAt: Date.now(),
    });
    spawned.push(ref.id);
  }

  return NextResponse.json({ spawned, count });
}
