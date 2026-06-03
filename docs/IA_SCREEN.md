# IA_SCREEN.md

# Information Architecture & Screen Structure

## Navigation Principle

FunJeju는 메뉴 중심 서비스가 아니다.

월드 탐험 중심 구조를 가진다.

사용자는 항상 제주 월드 안에 존재한다.

---

# Global Navigation

## 하단 탭
추천:
월드 / 발견 / 마이스페이스 / 괸당

더보기는 마이스페이스 안으로 흡수
### 월드

제주 탐험 메인 화면

기본 진입 화면

---

### 발견

저장한 스팟

추천 스팟

인기 스팟

이벤트

---

### 마이스페이스

내 공간

여행 기록

컬렉션

AI 비서

---

### 괸당

괸당 목록

괸당 공간

활동 피드

---

### 더보기

설정

알림

고객센터

약관

---

# Screen Structure

## WORLD_HOME

탐험 HUD 구성
- 줌레벨 표시
- 현재 좌표/지역명
- 레이어 토글 (스팟/유저공간/괸당/이벤트 ON/OFF)
- 워프 버튼
- 내 공간으로 돌아가기

제주 전체 상공

기본 진입 화면

구성

* 위성 지도
* 방향 가이드
* 이벤트 알림
* 현재 위치
* 탐험 HUD

---

## REGION_VIEW

줌레벨별 표시 밀도 조절
- 줌 아웃: 권역 대표 스팟만
- 줌 인: 전체 스팟 표시
- 밀집 시 클러스터링

애월

성산

중문

협재

구좌

등

반경 5km 탐험 뷰

구성

* 방향 가이드
* 스팟
* 유저 공간
* 괸당 공간
* 이벤트

---

## SPACE_VIEW

액션
- 저장
- 괸당 신청
- 워프로 이동
- 공유
- 신고

공간 상세 화면

공통 구조

* 헤더
* 대표 이미지
* 소개
* 콘텐츠
* 액션

---

## OFFICIAL_SPACE

관광지

오름

해변

축제

공식 공간

---

## BUSINESS_SPACE

맛집

카페

숙박

체험

비즈니스 공간

---

## USER_SPACE

사용자 공간

* 소개
* 기록
* 컬렉션
* 일정
* 방명록
* 괸당

---

## CREATE_SPACE

공간 생성

* 위치 선택
* 이름 입력
* 공개 범위
* 생성 완료

---

## AI_ASSISTANT

개인 AI 비서

* 여행 추천
* 일정 생성
* 기록 요약

---

## EVENT_CENTER

이벤트 현황

* 진행중 이벤트
* 발견 기록
* 명예의 전당

---

## COLLECTION

수집한 스팟

* 맛집
* 카페
* 오름
* 해변

---

## TRAVEL_PLAN

여행 일정

* 생성
* 수정
* 공유

---

## PROFILE

계정

구독

공간 관리

설정

---

# Overlay System
Layer Toggle Sheet — 레이어 ON/OFF
Zoom Guide — 특정 줌레벨 안내
Cluster Modal — 밀집 스팟 목록
## Warp Modal

공간 이동 확인

---

## Event Modal

이벤트 발견

---

## Hint Modal

힌트 획득

---

## Gwandang Modal

괸당 신청

---

## Space Create Modal

공간 생성 확인


ONBOARDING — 첫 진입 튜토리얼
NOTIFICATION — 알림 전용 화면
ADMIN — 어드민 대시보드 (별도)
BUSINESS_REGISTER — 비즈니스 공간 등록
SEARCH — 검색 (탐험 보조)
