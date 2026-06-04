export interface LevelThreshold {
  level: number;
  minDays: number;    // 출석 일수
  minVisitors: number; // 방문자 수
  label: string;
  icon: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minDays: 0,   minVisitors: 0,    label: "작은 쉼터",   icon: "/icons/space-lv1.png" },
  { level: 2, minDays: 7,   minVisitors: 20,   label: "캠핑 베이스", icon: "/icons/space-lv2.png" },
  { level: 3, minDays: 30,  minVisitors: 100,  label: "아늑한 거처", icon: "/icons/space-lv3.png" },
  { level: 4, minDays: 90,  minVisitors: 300,  label: "나만의 집",   icon: "/icons/space-lv4.png" },
  { level: 5, minDays: 180, minVisitors: 700,  label: "프라이빗 빌라", icon: "/icons/space-lv5.png" },
  { level: 6, minDays: 365, minVisitors: 1500, label: "제주 랜드마크", icon: "/icons/space-lv6.png" },
];

export function calcSpaceLevel(visitDays: number, visitorCount: number): LevelThreshold {
  // 출석일 OR 방문자 중 하나라도 기준 충족하면 레벨업
  let result = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (visitDays >= threshold.minDays || visitorCount >= threshold.minVisitors) {
      result = threshold;
    }
  }
  return result;
}

export function getNextLevel(current: LevelThreshold): LevelThreshold | null {
  const idx = LEVEL_THRESHOLDS.findIndex((t) => t.level === current.level);
  return LEVEL_THRESHOLDS[idx + 1] ?? null;
}
