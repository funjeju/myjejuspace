# DB_API.md

# Database & API Structure

# Collections

/users

/spaces

/posts

/gwandang

/events

/plans

/collections

/businesses

/notifications

---

# Users

users/{uid}

{
  uid,
  nickname,
  profileImage,
  homeSpaceId,
  type: "explorer" | "owner",  // 추가
  premium,
  agreedOwnerTermsAt,          // 추가 (약관 동의 시각)
  createdAt,
  lastActiveAt
}

---

# Spaces

spaces/{spaceId}

{
  id,
  type,
  ownerId,
  name,
  description,
  latitude,
  longitude,
  radius: 50,                  // 추가 (중복 검사 기준)
  visibility,
  lastActivityAt,              // 추가 (미활동 체크 기준)
  createdAt,
  updatedAt,
  active,
  visitCount,
  likeCount
}

---

# Space Type

official

business

user

event

---

# Visibility

public

gwandang

private

---

# User Space Rule

1인 기본 공간 1개

추가 공간은 Premium

50m 이내 생성 금지

3개월 미활동 시 회수 가능

---

# Posts

{
  ownerId,
  spaceId,
  images[],
  content,
  aiSummary,
  visibility,                  // 추가 (공개/괸당/비공개)
  location: { lat, lng },      // 추가 (기록한 위치)
  createdAt
}

---

# Gwandang

gwandang/{id}

{
requesterId,
receiverId,

status,

createdAt
}

---

# Status

pending

accepted

rejected

---

# Collections

collections/{id}

{
ownerId,

title,

spots[],

createdAt
}

---

# Travel Plans

plans/{id}

{
ownerId,

title,

description,

spots[],

startDate,

endDate
}

---

# Events

events/{eventId}

{
  type,
  latitude,
  longitude,
  hintLevel1: "동쪽 해안 어딘가",   // 추가
  hintLevel2Radius: 10000,           // 추가 (10km)
  hintLevel3Radius: 1000,            // 추가 (1km)
  startAt,
  endAt,
  status: "active" | "completed" | "expired",
  discoveredBy,
  discoveredAt                        // 추가
}
---

# Event Types

golden_tangerine

dokkaebi

dolphin

sunrise

treasure

---

# Event Discovery

발견 시

status

↓

completed

---

# Business Space

businesses/{id}

{
ownerId,

businessName,

category,

address,

phone,

couponEnabled,

hintEnabled
}

---

# Notification

notifications/{id}

{
userId,

type,

title,

message,

read
}

---

# API Layer

GET /spaces

GET /spaces/:id

POST /spaces

PATCH /spaces/:id

DELETE /spaces/:id

---

GET /events

POST /events/discover

---

POST /gwandang/request

POST /gwandang/accept

---

POST /posts

GET /posts

---

POST /plans

GET /plans

---

# Search Strategy

초기

Firestore Query

---

성장 이후

Algolia

또는

Typesense

연동

---

# Scaling Strategy

MVP

Firestore Only

↓

10만 유저

Search Engine 도입

↓

100만 유저

Dedicated Service Layer 구축

/hints/{id}
{
  eventId,
  userId,
  businessSpaceId,    // 어떤 상점에서 획득했는지
  level,              // 1 | 2 | 3
  usedAt
}

/visits/{id}
{
  userId,
  spaceId,
  visitedAt
}
// 공간 미활동 체크 + 방문 기록용

/rewards/{id}
{
  userId,
  eventId,
  type,               // badge | trophy | coupon
  receivedAt
}

GET /spaces/nearby?lat=&lng=&radius=   // 근처 공간 탐색
GET /spaces/check-overlap?lat=&lng=    // 50m 중복 검사
POST /hints/acquire                    // 힌트 획득
GET /events/active                     // 진행중 이벤트
GET /users/:uid/collections            // 컬렉션 목록
GET /gwandang/:uid                     // 괸당 목록
PATCH /spaces/:id/activity             // 활동 시간 갱신


{
  ownerId,
  spaceId,            // 추가 (spaces 컬렉션과 연결)
  businessName,
  category,
  address,
  phone,
  verified: boolean,  // 추가 (사업자 인증 여부)
  couponEnabled,
  hintEnabled,
  hintCount: 0,       // 추가 (오늘 힌트 제공 횟수)
  createdAt
}
