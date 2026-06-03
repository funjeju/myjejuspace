# PROJECT_SKILL.md

## Purpose

이 문서는 Codex가 프로젝트를 수행할 때 따라야 하는 단일 운영 규칙(Skill)이다.

목표는:

* 문서 기반 개발
* 작은 단위 구현
* 예측 가능한 변경
* 유지보수 가능한 구조
* 모바일 우선 경험
* 빠른 반복 개발

---

# 현재
Warm Travel + Scrapbook + Postcard Mood

# FunJeju로 변경
Drone Cinematic / Dark Map / Spatial World
DESIGN_SYSTEM.md 참조

## 1. Source of Truth (최우선 규칙)

아래 우선순위를 절대 준수한다.

1. `agents/1_orchestrator.md`
2. `core.md`
3. `docs/*`
4. `TODO.md`
5. 현재 코드베이스

문서와 코드가 충돌하면 문서를 우선한다.

추정하지 말고 문서를 기반으로 판단한다.

모호하면 먼저 질문하거나 가정을 명시한다.

---

## 2. Working Style

작업 전 항상 아래 순서를 따른다.

### Step 1 — Understanding

현재 상태를 이해한다.

반드시 설명:

* 현재 프로젝트 상태
* 목표
* 제약사항
* 필요한 선행조건

---

### Step 2 — Plan

실행 전 짧은 계획을 제시한다.

반드시 포함:

* 작업 범위
* 변경 예상 파일
* 구현 순서
* 위험 요소

큰 변경은 승인 요청 후 진행한다.

---

### Step 3 — Execution

작게 구현한다.

원칙:

* 한 번에 큰 공사 금지
* 작은 기능 단위로 구현
* 실행 가능한 상태 유지
* mock → 실제 연동 순서

변경 후 반드시 설명:

* 수정 파일 목록
* 변경 이유
* 실행 방법
* 테스트 방법

---

### Step 4 — Risks

문제점과 리스크를 설명한다.

예:

* 구조적 위험
* 성능 이슈
* 기술 부채
* 추후 리팩토링 필요사항

---

### Step 5 — Next Recommendation

다음 작업을 제안한다.

항상 작은 단위 기준으로 추천한다.

---

## 3. Development Rules

### Small Scope First

항상 작게 만든다.

좋은 예:

홈 → 네비게이션 → Mock CCTV 카드

나쁜 예:

전체 서비스 한 번에 구현

---

### Mock First

실제 API 연동 전에 Mock 데이터부터 구현한다.

순서:

Mock UI → 사용자 흐름 검증 → API 연결

---

### Preserve Working State

항상 실행 가능한 상태를 유지한다.

앱이 깨지는 대규모 변경 금지.

---

### Explain Before Changing

큰 변경은 먼저 설명한다.

예:

* 폴더 구조 변경
* 상태관리 도입
* DB 구조 변경
* 인증 구조 변경

---

### Minimal Change

최소 수정 원칙을 따른다.

필요 없는 리팩토링 금지.

---

## 4. Tech Rules

기본 기술 스택:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Firebase
* Vercel
* Mapbox GL JS  ← 추가
* Web Audio API ← 추가

원칙:

* TypeScript strict 지향
* App Router 기준
* 컴포넌트 재사용 우선
* 모바일 우선
* 서버/클라이언트 책임 분리
* 환경변수 사용

---

## 5. UI / UX Rules

디자인 방향:

# 현재
Drone Cinematic / Dark Map / Spatial World
DESIGN_SYSTEM.md 참조

원칙:

* Mobile First
* 카드 중심 UI
* 읽기 쉬운 구조
* 터치 친화적 인터랙션
* 지나친 애니메이션 금지
* 정보 밀도보다 이해 우선

공통 요소 우선:

* Header
* Bottom Navigation
* Card System
* Section Layout
* Typography Scale

---

## 6. Git Rules

작업 시작 전 Git 상태 확인.

원칙:

* 큰 변경 전 commit 권장
* rollback 가능 상태 유지
* 변경 범위 설명

---

## 7. Debug Rules

버그 수정 시:

1. 재현
2. 원인 분석
3. 최소 수정
4. 테스트
5. 결과 설명

추정 수정 금지.

원인을 설명한다.

---

## 8. QA Checklist

완료 전 점검:

* 모바일 화면 확인
* 타입 에러 확인
* 빌드 가능 여부
* 문서 기준 위반 여부
* UI 일관성
* console error 여부

---

## 9. Response Format

항상 아래 구조로 답변한다.

### 1. Understanding

현재 이해한 내용

### 2. Plan

실행 계획

### 3. Execution

변경 사항

### 4. Risks

위험 요소

### 5. Next Recommendation

다음 추천 작업

---

## 10. Forbidden

금지사항:

* 문서 무시
* 대규모 무단 변경
* 설명 없는 수정
* 추정 기반 구현
* 갑작스러운 라이브 API 연결
* 과도한 리팩토링
* 실행 불가능한 상태 방치
