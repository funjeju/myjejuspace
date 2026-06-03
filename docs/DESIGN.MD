# DESIGN_SYSTEM.md

# FunJeju Design System
## Based on Drone Cinematic Style (시안 01)

---

# Design Philosophy

FunJeju는 지도 서비스가 아니다.
제주도를 탐험하는 디지털 월드이다.

디자인의 첫 번째 원칙은 하나다.

**지도를 가리지 않는다.**

모든 UI는 지도 위에 떠 있는 최소한의 존재여야 한다.

---

# Core Principles

## 지도 우선
위성 지도가 항상 주인공이다.
UI는 보조다.

## 최소 UI
필요한 순간에만 나타난다.
불필요한 요소는 존재하지 않는다.

## 공간감
평면이 아니라 입체감이 있어야 한다.
드론이 실제로 떠 있는 느낌.

## 몰입
화면 전환이 아니라 공간 이동이다.
끊김 없이 자연스럽게 이어진다.

---

# Color System

## Base
배경 (지도 오버레이) rgba(0, 0, 0, 0.0) — 지도가 배경
패널 배경 rgba(10, 15, 30, 0.85) + backdrop-blur
카드 배경 rgba(15, 20, 40, 0.80) + backdrop-blur

## Space Type Colors
관광지 (Official) #22C55E 제주 그린
맛집/카페 (Business) #F97316 제주 오렌지
유저 공간 (User) #A78BFA 퍼플
이벤트 (Event) #EAB308 골드

## Direction Guide Colors
방향 화살표 #3B82F6 블루
거리 텍스트 #FFFFFF 화이트
흐림 (먼 거리) rgba(255,255,255,0.3)

## Text
Primary #FFFFFF
Secondary rgba(255,255,255,0.7)
Tertiary rgba(255,255,255,0.4)

## Status
활성 #22C55E
비활성 rgba(255,255,255,0.2)
경고 #EAB308
위험 #EF4444

---
# Typography
폰트: Pretendard
## Scale
Display 24px Bold — 공간 이름 (대형)
Title 18px Bold — 카드 제목
Subtitle 15px SemiBold — 섹션 제목
Body 14px Regular — 일반 텍스트
Caption 12px Medium — 거리, 보조 정보
Micro 11px Regular — 태그, 라벨

## 방향 가이드 전용
거리 표시 14px SemiBold — "5.2km"
방향명 12px Medium — "동쪽 해안"
공간 이름 13px Bold — 공간명

---
# Spacing System
4px xs
8px sm
12px md
16px lg
20px xl
24px 2xl
32px 3xl

---
# Border Radius
버튼/칩 9999px — pill
카드 16px — rounded-2xl
패널 20px — rounded-3xl
아이콘 50% — circle

---
# HUD Components
## 상단 바
위치: 상단 고정
높이: 56px
구성:
좌: 유저 아바타 + 닉네임 + 레벨
중: 날씨/온도 (선택)
우: 검색 / 알림 / 더보기

배경: 상단 그라디언트 페이드
(지도가 비쳐야 함)

## 방향 가이드 화살표
위치: 지도 위 플로팅
구성:

화살표 아이콘 (방향)
거리 텍스트 (km)
공간 이름
공간 타입 컬러
거리별 크기:
1km 이내 scale 1.2 opacity 1.0
13km scale 1.0 opacity 0.8
35km scale 0.85 opacity 0.6
5km 이상 scale 0.7 opacity 0.35

## 레이어 토글
위치: 우측 중앙 고정
형태: 세로 아이콘 버튼 스택
구성:

현재 위치
레이어 필터
3D 토글
배경: 반투명 원형 버튼
크기: 44px × 44px

## 카테고리 칩
위치: 하단 탭 위
형태: 가로 스크롤 pill 버튼
항목: 전체 / 관광지 / 맛집·카페 / 유저공간 / 이벤트

활성: 해당 타입 컬러 배경
비활성: rgba(255,255,255,0.15)

## 하단 탭
탭 4개: 탐험 / 마이스페이스 / 괸당 / 더보기
높이: 60px + safe area
배경: rgba(10,15,30,0.9) + backdrop-blur
활성 아이콘: 컬러
비활성 아이콘: rgba(255,255,255,0.4)

---
# Card Components
## Space Card (워프 카드)
트리거: 공간 클릭
위치: 하단 시트 (지도 위)
높이: 140px

구성:
좌: 대표 이미지 (80×80, rounded-xl)
우상: 공간 이름 (Title)
우중: 태그 칩 (카테고리)
우하: 거리 + 워프 버튼

워프 버튼:
배경: 해당 공간 타입 컬러
텍스트: "워프"
크기: px-5 py-2.5 rounded-full

## 이벤트 알림 카드
위치: 하단 시트
구성:

이벤트 이모지/이미지
이벤트명
힌트 텍스트
거리 프로그레스 바
"힌트 상점 보기" 버튼
---
# Warp Animation
Phase 1 — 진입 (0.6초)
지형이 블러되며 속도감 시작
화면 가장자리 빛 번짐

Phase 2 — 이동 (1.4초)
드론 고속비행
지형이 빠르게 지나감
easeInOut 커브

Phase 3 — 도착 (0.7초)
블러 걷히며 목적지 등장
도착 공간 글로우 효과
효과음 핑

실패 조건:
로딩처럼 느껴지면 안됨
끊기면 안됨

---
# Mapbox Configuration
Style: Mapbox Satellite Streets
초기 좌표: [126.5292, 33.3617] (제주 중심)
초기 줌: 9.5 (제주 전체)
최소 줌: 9 (제주 전체)
최대 줌: 18 (건물 단위)
Pitch: 45° (드론 시점)
Terrain: DEM 활성화 (오름 입체감)

## 줌레벨 정의
910 제주 전체 상공
1012 지역 단위 (애월/성산/중문)
1214 반경 5km 탐험 영역
1416 스팟 상세
16~18 건물/지점 단위

---
# Motion Principles
기본 트랜지션: 200ms ease-out
패널 등장: 300ms ease-out (하단 슬라이드)
카드 등장: 250ms ease-out
화살표 페이드: 500ms ease
워프: 전용 애니메이션 (warp system 참조)

---
# Icon System
크기: 20px (기본) / 16px (소) / 24px (대)
스타일: Lucide Icons (현재 0_aiweb와 동일)
공간 아이콘: 이모지 기반 (🏔️ 🍊 ☕ 🎪)

---
# Dark Mode Only
FunJeju는 다크모드 전용이다.
위성사진 위에서 밝은 UI는 어색하고
탐험/몰입감을 해친다.
라이트모드는 지원하지 않는다.
---
# Accessibility
최소 터치 영역: 44px × 44px
텍스트 대비: WCAG AA 기준
한 손 조작: 주요 액션 하단 집중

---
# Do / Don't
## Do
- 지도가 항상 보이게
- 필요할 때만 UI 노출
- 공간 타입 컬러 일관성 유지
- 워프는 항상 재미있게
## Don't
- 풀스크린 모달 남발
- 지도를 완전히 덮는 UI
- 로딩 화면처럼 느껴지는 전환
- 밝은 배경 사용
