# ARCHITECTURE.md

# System Architecture

## Architecture Philosophy

FunJeju는 지도 서비스가 아니다.

모든 기능은 "공간(Space)" 중심으로 설계한다.

관광지

맛집

카페

사용자 공간

비즈니스 공간

이벤트

모두 Space 개념을 기반으로 한다.

---

# Technology Stack

## Frontend

Next.js
TypeScript
PWA
Mapbox GL JS
Canvas API (방향가이드/워프 오버레이)
Web Audio API (워프 효과음)
Tailwind CSS

## Infrastructure
Vercel (배포)
Firebase Cloud Functions (이벤트 생성/만료/알림)

## External API
카카오 로컬 API (POI 데이터)
---

## Backend

Firebase

Firestore

Firebase Auth

Firebase Storage

Cloud Functions

---

## AI

Gemini

---

## Maps

Mapbox Satellite

Mapbox Terrain DEM

---

# Core Domain Model

User
- uid
- type: explorer | owner
- createdAt

Space
- id
- type: official | business | user | event
- coordinates: { lat, lng }
- ownerId
- active: boolean
- lastActivityAt

Content
- spaceId
- type: record | photo | collection | plan
- visibility: public | gwandang | private

Relationship (괸당)
- fromUserId
- toUserId
- status: pending | accepted
- connectedAt

---

## Mapbox Configuration
Style: Satellite Streets
Zoom Range: 9 (제주 전체) ~ 18 (건물 단위)
Initial View: 제주도 중심 좌표 (33.3617, 126.5292)
Camera: Pitch 45도 (드론 시점)
Terrain: DEM 활성화 (오름 입체감)

# Space Architecture

모든 공간은 동일한 구조를 가진다.

차이는 Type 뿐이다.

---

## Official Space

관광지

오름

해변

축제

---

## Business Space

맛집

카페

숙소

체험

상점

---

## User Space

사용자 공간

---

## Event Space

이벤트 임시 공간

---

# Coordinate System

모든 공간은 GPS 좌표를 가진다.

latitude

longitude

필수

---

# Warp System

현재 좌표

↓

목표 좌표

↓

거리 계산

↓

애니메이션

↓

도착

---

# Direction Guide System

사용자 위치 기준

방향 계산

거리 계산

가이드 생성

---

# Discovery Engine

## Discovery Engine
우선순위 계산 기준
- 거리 (가까울수록 높음)
- 활성도 (최근 활동)
- 인기도 (방문자 수)
- 괸당 여부 (괸당 공간 우선 표시)

현재 위치 기준

반경 탐색

↓

레이어 필터

↓

우선순위 계산

↓

노출

---

# Space Ownership

유저는 공간을 소유하지 않는다.

공간 관리권을 가진다.

---

# Activity Validation

공간 활성 상태 유지 조건

* 방문
* 기록 작성
* 수정
* 상호작용

---

# AI Architecture

개인 기록

*

공간 데이터

*

컬렉션 데이터

↓

개인 여행 비서

---

# Event Architecture

생성: Cloud Functions 스케줄러 (1일 1~3회)
좌표: 제주 육지 영역 내 랜덤
만료: 생성 후 24시간 or 발견 시
힌트 레벨:
- Level 1: 지역명만 (기본)
- Level 2: 반경 10km (비즈니스 공간 방문)
- Level 3: 반경 1km (프리미엄 힌트)
랜덤 이벤트 생성

↓

이벤트 좌표 저장

↓

힌트 생성

↓

탐색

↓

발견

↓

보상 지급

---

# Future Expansion

AR

공간 경제

공간 거래

비즈니스 생태계

지역 상권 연결

제주 디지털 월드

## Security
- Firebase Auth 필수
- 스페이스 오너: 추가 약관 동의 기록 저장
- 공간 생성: 서버사이드 50m 중복 검사
- 이벤트 발견: 중복 수령 방지 (Cloud Functions)
- 비즈니스 공간: 사업자 인증 후 활성화
