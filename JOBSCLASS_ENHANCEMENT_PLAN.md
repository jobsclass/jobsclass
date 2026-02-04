# 🎯 JobsClass 개선 계획서

**작성일**: 2026-02-04  
**목적**: JobsVentures에서 개발한 지식서비스 매칭 기능을 JobsClass에 **참고하여 보완**

---

## ⚠️ 중요 원칙

**기존 JobsClass 프로젝트를 절대 덮어쓰지 않습니다!**

- ✅ 기존 코드 유지
- ✅ 기존 DB 구조 유지
- ✅ 새로운 기능만 **추가**
- ✅ 개선 필요한 부분만 **보완**

---

## 📊 두 프로젝트 비교 분석

### 프로젝트 현황

#### JobsClass (기존)
- **목적**: 전문가 지식 판매 플랫폼 (쇼핑몰 형태)
- **완성도**: 40%
- **핵심 기능**:
  - ✅ 파트너 인증 (Supabase Auth)
  - ✅ 서비스 등록/관리 (7가지 타입)
  - ✅ 공개 서비스 페이지
  - ❌ 구매자 인증 (JWT) - 미완성
  - ❌ 장바구니 - 미완성
  - ❌ 결제 시스템 - 미완성
  - ❌ 리뷰 시스템 - 미완성

#### JobsVentures (현재)
- **목적**: 스타트업 생태계 플랫폼 (투자/채용/전문가)
- **완성도**: 80%
- **지식서비스 기능**:
  - ✅ 전문가 서비스 등록/관리
  - ✅ 서비스 검색/필터링
  - ✅ 주문 시스템
  - ✅ 리뷰 시스템
  - ✅ 결제 연동 (토스페이먼츠)
  - ✅ 크레딧 시스템

---

## 🔍 핵심 차이점 분석

### 1. 서비스 등록/관리

#### JobsClass (기존)
```typescript
// 테이블: services
{
  id, partner_id, title, slug, 
  service_type, // 7가지 타입
  base_price, delivery_days,
  description, features, requirements,
  category_1, category_2, tags,
  is_published, view_count
}

// 7가지 서비스 타입:
- website_creation (웹사이트 제작)
- design (디자인)
- content (콘텐츠)
- marketing (마케팅)
- consulting (컨설팅)
- video_course (동영상 강의)
- ebook (전자책)
```

#### JobsVentures (참고)
```typescript
// 테이블: expert_services
{
  id, profile_id, title, 
  category, // 카테고리 중심
  service_type, // 시간제/프로젝트제/패키지
  price, duration_hours, duration_days,
  description, features, deliverables,
  is_active, views_count, orders_count,
  rating, review_count
}

// 카테고리 중심 분류:
- development (개발)
- design (디자인)
- marketing (마케팅)
- writing (글쓰기)
- consulting (컨설팅)
```

**🎯 개선 제안**:
1. ✅ **기존 유지**: JobsClass의 7가지 서비스 타입 유지
2. ✅ **추가**: `views_count`, `orders_count`, `rating`, `review_count` 컬럼 추가
3. ✅ **개선**: 검색/필터링 UI 개선 (JobsVentures 참고)

---

### 2. 주문/결제 시스템

#### JobsClass (기존)
```typescript
// 테이블: orders
{
  id, order_number, partner_id, buyer_id,
  total_amount, discount_amount, final_amount,
  status, // pending/paid/completed/refunded
  payment_method, payment_at
}

// 상태: 기본만 있음
```

#### JobsVentures (참고)
```typescript
// 테이블: service_orders
{
  id, service_id, buyer_id, seller_id,
  order_number, amount, status,
  payment_method, payment_key, // 토스페이먼츠 연동
  started_at, completed_at,
  review_submitted
}

// 상태: 더 세분화
- pending (대기)
- confirmed (확인)
- in_progress (진행중)
- completed (완료)
- cancelled (취소)
- refunded (환불)
```

**🎯 개선 제안**:
1. ✅ **기존 유지**: orders 테이블 구조 유지
2. ✅ **추가**: `payment_key`, `started_at`, `completed_at` 컬럼 추가
3. ✅ **개선**: 주문 상태 세분화 (confirmed, in_progress 추가)
4. ✅ **추가**: 주문 진행 상황 표시 UI

---

### 3. 리뷰 시스템

#### JobsClass (기존)
```typescript
// 테이블: 없음 (미구현)
```

#### JobsVentures (참고)
```typescript
// 테이블: service_reviews
{
  id, service_id, order_id, 
  user_id, expert_id,
  rating, comment,
  is_public, created_at
}

// 기능:
- 주문 완료 후 리뷰 작성
- 별점 1-5점
- 전문가 프로필에 평균 평점 표시
- 서비스별 리뷰 목록
```

**🎯 개선 제안**:
1. ✅ **추가**: `service_reviews` 테이블 생성
2. ✅ **추가**: 주문 완료 후 리뷰 작성 UI
3. ✅ **추가**: 파트너 프로필에 평균 평점 표시
4. ✅ **추가**: 서비스 상세 페이지에 리뷰 목록 표시

---

### 4. 검색/필터링

#### JobsClass (기존)
```typescript
// 기본 필터링만 있음
- 카테고리 필터
- 검색어 입력
```

#### JobsVentures (참고)
```typescript
// 고급 필터링
- 검색어 (제목/설명)
- 카테고리 필터
- 타입 필터 (시간제/프로젝트제/패키지)
- 가격 범위 필터
- 평점 필터
- 정렬 (최신순/인기순/평점순/가격순)
```

**🎯 개선 제안**:
1. ✅ **개선**: 검색 UI 강화 (실시간 검색, 하이라이트)
2. ✅ **추가**: 가격 범위 필터
3. ✅ **추가**: 평점 필터 (리뷰 시스템 구현 후)
4. ✅ **추가**: 정렬 옵션 (인기순/평점순)

---

### 5. 크레딧 시스템

#### JobsClass (기존)
```typescript
// 없음 (미구현)
```

#### JobsVentures (참고)
```typescript
// 테이블: user_credits, credit_packages, credit_events
{
  // 크레딧 구매 패키지
  // 크레딧으로 서비스 구매 가능
  // 일일 출석 체크로 크레딧 획득
  // 이벤트 크레딧 지급
}
```

**🎯 개선 제안**:
1. ❓ **검토 필요**: 크레딧 시스템 도입 여부 결정
2. ❓ **대안**: 일반 결제만 사용할지, 크레딧도 추가할지 선택
3. ❓ **장점**: 크레딧 시스템 → 선결제 유도, 플랫폼 락인 효과
4. ❓ **단점**: 시스템 복잡도 증가

---

## 📋 구체적인 개선 작업 목록

### Priority 1: 리뷰 시스템 (필수)

#### 1.1 DB 테이블 추가
```sql
-- supabase/migrations/add_review_system.sql
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partner_profiles(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_service_id ON service_reviews(service_id);
CREATE INDEX idx_reviews_partner_id ON service_reviews(partner_id);
CREATE INDEX idx_reviews_buyer_id ON service_reviews(buyer_id);
```

#### 1.2 services 테이블에 컬럼 추가
```sql
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS orders_count INTEGER DEFAULT 0;
```

#### 1.3 API 라우트 추가
```typescript
// app/api/reviews/submit/route.ts
- POST: 리뷰 작성
- 입력: order_id, rating, comment
- 검증: 주문 완료 여부, 이미 리뷰 작성했는지

// app/api/reviews/list/route.ts
- GET: 서비스별 리뷰 목록
- 쿼리: service_id, page, limit

// app/api/reviews/stats/route.ts
- GET: 서비스별 리뷰 통계
- 반환: 평균 평점, 리뷰 수, 별점별 분포
```

#### 1.4 UI 컴포넌트 추가
```typescript
// components/reviews/ReviewForm.tsx
- 별점 선택 (1-5)
- 리뷰 텍스트 입력
- 제출 버튼

// components/reviews/ReviewList.tsx
- 리뷰 카드 목록
- 페이지네이션
- 정렬 (최신순/평점순)

// components/reviews/ReviewStats.tsx
- 평균 평점 표시
- 별점별 분포 차트
- 총 리뷰 수
```

---

### Priority 2: 주문 상태 관리 개선

#### 2.1 orders 테이블 컬럼 추가
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_key TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_submitted BOOLEAN DEFAULT false;
```

#### 2.2 주문 상태 세분화
```typescript
// 기존: pending → paid → completed
// 개선: pending → paid → confirmed → in_progress → completed

// 상태별 액션:
- pending: 결제 대기
- paid: 결제 완료 (파트너 확인 필요)
- confirmed: 파트너 확인 완료 (작업 시작 가능)
- in_progress: 작업 진행 중
- completed: 완료 (리뷰 작성 가능)
- cancelled: 취소
- refunded: 환불
```

#### 2.3 주문 진행 상황 UI
```typescript
// app/dashboard/orders/[id]/page.tsx
- 주문 진행 단계 표시 (타임라인)
- 각 단계별 날짜/시간 표시
- 현재 단계 강조
- 다음 액션 버튼 (확인/시작/완료)
```

---

### Priority 3: 검색/필터링 UI 개선

#### 3.1 고급 검색 기능
```typescript
// app/dashboard/services/page.tsx 개선
- 실시간 검색 (debounce)
- 검색어 하이라이트
- 최근 검색어 저장
- 추천 검색어
```

#### 3.2 필터 옵션 추가
```typescript
// 가격 범위 필터
- 슬라이더 UI
- 최소/최대 가격 입력

// 정렬 옵션
- 최신순
- 인기순 (orders_count)
- 평점순 (rating)
- 가격 낮은순/높은순
```

---

### Priority 4: 서비스 통계 강화

#### 4.1 대시보드 통계 추가
```typescript
// app/dashboard/page.tsx 개선
- 총 조회수
- 총 주문 수
- 평균 평점
- 이번 달 매출
- 인기 서비스 TOP 3
```

#### 4.2 서비스별 상세 통계
```typescript
// app/dashboard/services/[id]/stats/page.tsx (신규)
- 일별/주별/월별 조회수 그래프
- 주문 전환율
- 평점 추이
- 리뷰 키워드 분석
```

---

## ⚠️ 작업 시 주의사항

### 1. 기존 코드 보존
- ✅ 기존 파일을 절대 덮어쓰지 않음
- ✅ 새로운 파일은 별도로 생성
- ✅ 기존 테이블 스키마 변경 시 마이그레이션 파일 사용

### 2. 점진적 개선
- ✅ Priority 1부터 순차적으로 작업
- ✅ 각 기능별로 테스트 완료 후 다음 단계 진행
- ✅ 커밋 단위: 기능 하나씩

### 3. 사용자 확인
- ✅ 각 Priority 작업 전 사용자 승인 필요
- ✅ 작업 범위 명확히 정의
- ✅ 예상 소요 시간 제시

---

## 📊 예상 작업 시간

| Priority | 작업 내용 | 소요 시간 | 난이도 |
|----------|----------|----------|--------|
| Priority 1 | 리뷰 시스템 | 2-3시간 | 중 |
| Priority 2 | 주문 상태 관리 | 1-2시간 | 하 |
| Priority 3 | 검색/필터링 UI | 1-2시간 | 하 |
| Priority 4 | 서비스 통계 | 2-3시간 | 중 |
| **합계** | **전체** | **6-10시간** | - |

---

## 🎯 작업 진행 방식

### Step 1: 사용자 확인
- 이 문서 검토
- 작업 우선순위 확정
- 작업 범위 조정

### Step 2: Priority별 작업
각 Priority마다:
1. DB 마이그레이션 작성
2. API 라우트 구현
3. UI 컴포넌트 구현
4. 테스트
5. 커밋 & 푸시

### Step 3: 최종 검토
- 전체 기능 통합 테스트
- 문서 업데이트
- 배포 가이드 작성

---

## 💬 다음 단계

**지금 진행할까요?**

1. ✅ **Yes**: Priority 1 (리뷰 시스템)부터 시작
2. ❓ **수정**: 작업 우선순위/범위 조정
3. ⏸️ **보류**: 나중에 진행

---

**문서 위치**: `/home/user/webapp/JOBSCLASS_ENHANCEMENT_PLAN.md`  
**작성자**: AI Assistant  
**최종 업데이트**: 2026-02-04
