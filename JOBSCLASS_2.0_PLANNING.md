# 🚀 JobsClass 2.0 기획 문서

**작성일**: 2026-01-26  
**버전**: 2.0  
**목표**: AI 기반 지식 마켓플레이스 - 판매자는 AI로 콘텐츠 제작, 구매자는 AI 상담으로 맞춤 추천

---

## 📋 1. 서비스 개요

### 1.1 핵심 컨셉
**"AI가 돕는 지식 거래 플랫폼"**

- **판매자(파트너)**: AI를 활용해 콘텐츠를 쉽고 빠르게 제작
- **구매자**: AI 상담을 통해 자신에게 맞는 학습 경로 추천
- **차별화**: 단순 마켓플레이스가 아닌 "AI 코치"가 있는 학습 플랫폼

### 1.2 타겟 시장
- **판매자**: 온라인 강사, 코치, 컨설턴트, 전문가, 크리에이터
- **구매자**: 자기계발을 원하는 직장인, 학생, 경력 전환자

### 1.3 비즈니스 모델
1. **거래 수수료**: 판매 금액의 5-15% (플랜별 차등)
2. **구독 수익**: 월 29,000원 ~ 79,000원+ (파트너 플랜)
3. **AI 기능**: 플랜별 사용량 제한 → 업그레이드 유도

---

## 🎯 2. 핵심 기능 정의

### 2.1 판매자(파트너) 기능

#### ✅ 기본 기능 (FREE 플랜)
1. **회원가입 & 프로필 설정**
   - 이메일/비밀번호 회원가입
   - 프로필 URL 설정 (예: `jobsclass.kr/partners/username`)
   - 기본 정보 입력 (이름, 소개, 전문 분야)

2. **상품 등록** (최대 3개)
   - 상품 정보 입력 (제목, 설명, 카테고리, 가격)
   - 이미지 업로드 (썸네일 + 추가 이미지)
   - 상품 타입 선택: 온라인 강의, 멘토링, 전자책, 템플릿, 컨설팅

3. **판매 관리**
   - 주문 내역 조회
   - 구매자 정보 확인
   - 정산 신청

4. **통계 대시보드** (기본)
   - 총 판매액
   - 주문 건수
   - 상품별 판매 현황

#### 🤖 AI 기능 (STARTER/PRO 플랜)

**1) AI 썸네일 생성**
- **목적**: 전문적인 상품 이미지를 AI로 자동 생성
- **사용 모델**: DALL-E 3 또는 Stable Diffusion
- **입력**: 상품 제목, 카테고리, 설명 일부
- **출력**: 3가지 디자인 옵션 제공
- **할당량**: 
  - STARTER: 월 10회
  - PRO: 월 50회
  - ENTERPRISE: 무제한

**2) AI 서비스 기획/설명 생성**
- **목적**: 판매자가 입력한 간단한 정보로 완성된 상품 설명 생성
- **사용 모델**: GPT-4o-mini
- **입력**:
  ```typescript
  {
    title: string              // 상품 제목
    category: string           // 카테고리
    targetAudience: string     // 대상 고객
    keyPoints: string[]        // 핵심 포인트 3-5개
    duration?: string          // 강의 시간/기간
    price: number              // 가격
  }
  ```
- **출력**:
  ```typescript
  {
    description: string        // 상품 설명 (500-800자)
    includes: string[]         // 포함 내용
    requirements: string[]     // 요구사항
    targetAudience: string[]   // 대상 상세
    tagline: string            // 한 줄 소개
    tags: string[]             // 추천 태그
  }
  ```
- **할당량**: 
  - STARTER: 월 30회
  - PRO: 월 150회

**3) AI 블로그 글 제작**
- **목적**: 마케팅/SEO를 위한 블로그 콘텐츠 생성
- **입력**: 주제, 키워드, 톤앤매너
- **출력**: 완성된 블로그 글 (1000-2000자)
- **할당량**: 
  - STARTER: 월 10회
  - PRO: 월 50회

**4) AI 가격 추천**
- **목적**: 시장 분석을 통한 적정 가격 제안
- **입력**: 상품 정보, 카테고리, 경쟁 상품
- **출력**: 권장 가격 + 가격 전략 설명
- **할당량**: 
  - STARTER: 월 30회
  - PRO: 월 150회

#### 🎨 디자인 시스템
- **현재 JobsBuild 디자인 유지**
  - Tailwind CSS 기반
  - 모던하고 깔끔한 UI
  - 모바일 반응형
  - 그라데이션 & 글래스모피즘 스타일

---

### 2.2 구매자 기능

#### ✅ 기본 기능
1. **회원가입 & 로그인**
   - 이메일/비밀번호 회원가입
   - 소셜 로그인 (선택)

2. **마켓플레이스 (상품 검색/탐색)**
   - 카테고리별 상품 목록
   - 인기 상품 / 최신 상품
   - 검색 기능 (제목, 태그)
   - 필터링 (가격, 난이도, 평점)

3. **상품 상세 페이지**
   - 상품 정보 확인
   - 파트너 프로필 보기
   - 리뷰 확인
   - 구매하기 버튼

4. **결제 (Toss Payments)**
   - 카드 결제
   - 간편 결제
   - 결제 성공/실패 처리

5. **구매 대시보드**
   - 구매 내역 조회
   - 학습 진행 현황
   - 리뷰 작성

6. **리뷰 시스템**
   - 별점 + 텍스트 리뷰
   - 리뷰 추천/신고

#### 🤖 AI 상담 기능 (핵심 차별화!)

**1) AI 학습 경로 추천**
- **목적**: 구매자의 목표/수준에 맞는 맞춤형 학습 경로 제시
- **플로우**:
  ```
  1단계: 프로필 입력
  ├─ 관심 분야 선택 (예: 프로그래밍, 디자인, 마케팅)
  ├─ 현재 수준 선택 (초급/중급/고급)
  ├─ 학습 목표 입력 (예: "웹 개발자 취업")
  └─ 가용 시간 & 예산 입력
  
  2단계: AI 진단 & 분석
  ├─ 현재 수준 평가
  ├─ 목표까지 거리 계산
  └─ 최적 학습 경로 생성
  
  3단계: 맞춤 추천
  ├─ 단계별 강의 추천 (3-5단계)
  ├─ 예상 학습 기간
  ├─ 총 투자 비용
  └─ 각 강의 선택 이유 설명
  ```

- **입력 정보**:
  ```typescript
  interface LearnerProfile {
    category: string              // 관심 분야
    currentLevel: string          // 현재 수준
    goals: string[]              // 학습 목표
    learningStyle: string        // 학습 스타일 (영상/텍스트/실습)
    timeCommitment: string       // 가능한 시간
    budget: { min: number; max: number }
    experience: string           // 경험 설명
    challenges: string[]         // 어려운 점
  }
  ```

- **AI 출력**:
  ```typescript
  interface AIRecommendation {
    diagnosis: {
      currentLevel: string       // "중급 입문자"
      strengths: string[]        // 강점
      weaknesses: string[]       // 약점
      readiness: string          // 준비도 평가
    }
    
    learningPath: {
      phase: number
      title: string
      duration: string
      description: string
      recommendedProducts: Product[]
    }[]
    
    recommendedProducts: {
      product: Product
      priority: number           // 1 (최우선) ~ 5
      reason: string            // 추천 이유
      estimatedCompletionTime: string
    }[]
    
    roadmap: {
      week: number
      focus: string
      activities: string[]
      milestones: string[]
    }[]
    
    expectedOutcome: {
      timeline: string          // "3개월 후"
      skills: string[]          // 습득 기술
      careerOpportunities: string[]
    }
  }
  ```

**2) AI 구매 상담 챗봇**
- **목적**: 상품 선택 고민 시 실시간 상담
- **플로우**:
  ```
  구매자: "저는 프로그래밍 완전 초보인데 웹 개발자가 되고 싶어요."
  
  AI: "웹 개발자 목표를 가지신 초보자시군요! 👨‍💻
      
      추천 학습 경로:
      
      1단계 (1-2개월): HTML/CSS 기초
      → 추천 강의: '웹 기초부터 시작하기' (₩49,000)
      
      2단계 (2-3개월): JavaScript 기초
      → 추천 강의: 'JavaScript 완전 정복' (₩79,000)
      
      3단계 (3-4개월): React 또는 Vue.js
      → 추천 강의: 'React로 만드는 실전 프로젝트' (₩99,000)
      
      예상 기간: 6-9개월
      총 투자 비용: ₩227,000
      
      바로 시작하시겠어요? 아니면 더 자세한 상담이 필요하신가요?"
  ```

- **사용 모델**: GPT-4o-mini (대화형)
- **컨텍스트**: 마켓플레이스 전체 상품 정보 + 구매자 프로필
- **무료 제공**: 모든 구매자가 무제한 이용 가능

**3) 실시간 파트너 매칭 (PRO 플랜 파트너만)**
- **목적**: AI 추천 후 파트너와 1:1 상담 연결
- **플로우**:
  ```
  AI 추천 → "이 강의에 대해 강사님께 직접 문의하시겠어요?" 
  → 구매자 동의 → 파트너에게 알림 → 1:1 채팅 또는 화상 상담
  ```
- **파트너 할당량**: 
  - PRO: 월 50건
  - ENTERPRISE: 무제한

---

### 2.3 계정 분류 시스템

#### 회원가입 시 역할 선택
```
┌─────────────────────────────────────┐
│     JobsClass에 오신 것을 환영합니다!     │
│         어떻게 시작하시겠어요?           │
└─────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐
│   👨‍🏫 판매자   │  │   👨‍🎓 구매자   │
│              │  │              │
│ 내 지식을     │  │ 새로운 것을   │
│ 판매하고 싶어요│  │ 배우고 싶어요  │
│              │  │              │
│  [시작하기]   │  │  [시작하기]   │
└──────────────┘  └──────────────┘
```

#### 역할별 온보딩

**판매자 온보딩**:
```
1단계: 프로필 URL 설정
→ jobsclass.kr/partners/[username]

2단계: 전문 분야 선택
→ 온라인 강의, 멘토링, 컨설팅 등

3단계: 기본 정보 입력
→ 이름, 소개, 경력, 전문성

4단계: 첫 상품 등록 (선택)
→ AI 도움받기 또는 직접 입력

5단계: 완료!
→ 대시보드로 이동
```

**구매자 온보딩**:
```
1단계: 관심 분야 선택
→ 프로그래밍, 디자인, 마케팅, 비즈니스 등

2단계: 학습 목표 입력 (선택)
→ AI 추천을 위한 정보

3단계: 완료!
→ 마켓플레이스로 이동
```

---

## 🗄️ 3. 데이터베이스 설계

### 3.1 통합 전략

**기존 JobsClass 스키마 유지 + 추가**

#### 기존 테이블 (7개) - 그대로 유지
1. `users` - 사용자 기본 정보
2. `partner_profiles` - 파트너 프로필
3. `products` - 상품
4. `orders` - 주문
5. `reviews` - 리뷰
6. `payouts` - 정산
7. `notifications` - 알림

#### 신규 테이블 (5개) - 추가 필요

**1) AI 사용량 관리**
```sql
-- AI 사용량 로그
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES users(id),
  
  feature_type VARCHAR(50) NOT NULL,   -- thumbnail, description, blog, price
  tokens_used INTEGER NOT NULL,
  cost_krw DECIMAL(10,2),
  
  request_data JSONB,
  response_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 월별 사용량 집계 (성능 최적화)
CREATE TABLE ai_usage_monthly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES users(id),
  year_month VARCHAR(7) NOT NULL,      -- '2026-01'
  
  thumbnail_count INTEGER DEFAULT 0,
  description_count INTEGER DEFAULT 0,
  blog_count INTEGER DEFAULT 0,
  price_count INTEGER DEFAULT 0,
  
  total_tokens INTEGER DEFAULT 0,
  total_cost_krw DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(partner_id, year_month)
);
```

**2) 구독 플랜 관리**
```sql
-- 구독 플랜 정의
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,          -- FREE, STARTER, PRO, ENTERPRISE
  display_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,              -- 월 비용 (원)
  platform_fee_rate DECIMAL(5,2) NOT NULL, -- 플랫폼 수수료 (%)
  
  max_products INTEGER,
  max_storage_gb INTEGER,
  
  ai_thumbnail_quota INTEGER,
  ai_description_quota INTEGER,
  ai_blog_quota INTEGER,
  ai_price_quota INTEGER,
  
  custom_domain BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 파트너 구독 정보
CREATE TABLE partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES users(id) UNIQUE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  status VARCHAR(20) NOT NULL,         -- active, cancelled, expired
  
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**3) 구매자 AI 추천**
```sql
-- 구매자 학습 프로필
CREATE TABLE buyer_learning_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) UNIQUE,
  
  category VARCHAR(50) NOT NULL,
  current_level VARCHAR(20) NOT NULL,
  goals TEXT[],
  
  learning_style VARCHAR(50),
  time_commitment VARCHAR(50),
  budget_min INTEGER,
  budget_max INTEGER,
  
  experience TEXT,
  challenges TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI 추천 기록
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  profile_id UUID REFERENCES buyer_learning_profiles(id),
  
  diagnosis JSONB NOT NULL,
  learning_path JSONB NOT NULL,
  recommended_products JSONB NOT NULL,
  roadmap JSONB,
  
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI 상담 세션
CREATE TABLE ai_consultation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  
  messages JSONB NOT NULL,             -- 대화 기록
  recommended_products UUID[],
  status VARCHAR(20) NOT NULL,         -- active, completed, abandoned
  
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**4) 파트너-구매자 매칭**
```sql
-- 실시간 상담 요청
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  partner_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  
  message TEXT NOT NULL,               -- 구매자 문의 내용
  status VARCHAR(20) NOT NULL,         -- pending, accepted, rejected, completed
  
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### 3.2 JobsBuild 데이터 통합 전략

**JobsBuild에서 가져올 테이블**:
- ❌ `websites` - 삭제 (다중 웹사이트 기능 제거)
- ✅ `user_profiles` → `partner_profiles`로 통합
- ✅ `services` → `products`로 통합
- ✅ `blog_posts` → 파트너 프로필에 포함 (선택)
- ✅ `portfolios` → 파트너 프로필에 포함 (선택)
- ✅ `orders` - 그대로 유지
- ✅ `payments` → `orders`로 통합

**통합 마이그레이션 스크립트**:
```sql
-- Step 1: JobsBuild의 user_profiles → partner_profiles
INSERT INTO partner_profiles (user_id, display_name, profile_url, tagline, description)
SELECT 
  user_id,
  display_name,
  CONCAT('partners/', username),
  tagline,
  bio
FROM old_user_profiles
WHERE onboarding_complete = true;

-- Step 2: JobsBuild의 services → products
INSERT INTO products (partner_id, title, slug, description, category, price, product_type)
SELECT 
  user_id,
  title,
  slug,
  description,
  category,
  price,
  'course'  -- 기본값
FROM old_services
WHERE is_published = true;
```

---

## 🎨 4. 화면 구조 (와이어프레임)

### 4.1 메인 페이지 (랜딩)

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] JobsClass        [마켓플레이스] [가격] [로그인] [시작하기]  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                                                            │
│    🚀 AI가 돕는 지식 거래 플랫폼                            │
│    전문가는 쉽게 팔고, 학습자는 정확하게 배웁니다             │
│                                                            │
│    [👨‍🏫 판매자로 시작하기]  [👨‍🎓 구매자로 시작하기]        │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  💡 판매자에게                                              │
│  ─────────────────                                         │
│  ✅ AI로 3분 만에 상품 등록                                 │
│  ✅ AI 썸네일 자동 생성                                     │
│  ✅ AI 상품 설명 자동 작성                                  │
│  ✅ 수수료 5-15% (업계 최저)                                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  🎯 구매자에게                                              │
│  ─────────────────                                         │
│  ✅ AI 학습 경로 추천                                       │
│  ✅ 내 수준에 맞는 강의 찾기                                │
│  ✅ 실시간 AI 상담                                          │
│  ✅ 안전한 결제 & 환불 보장                                 │
└────────────────────────────────────────────────────────────┘

[인기 강의] [최신 강의] [추천 파트너]
```

### 4.2 판매자 대시보드

```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  대시보드  상품관리  주문관리  정산  설정   [프로필] │
└────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 총 판매액    │ 이번 달 판매 │ 총 주문     │ 미정산 금액  │
│ ₩1,250,000 │ ₩450,000   │ 47건        │ ₩320,000    │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌────────────────────────────────────────────────────────────┐
│  🤖 AI 사용량 (PRO 플랜)                                    │
│  ─────────────────                                         │
│  AI 썸네일:   ████████░░  20/50                           │
│  AI 상품설명: ████████░░  85/150                          │
│  AI 블로그:   ████░░░░░░  12/50                           │
│                                                            │
│  [플랜 업그레이드]                                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  📦 내 상품                              [+ 새 상품 등록]    │
│  ─────────────────                                         │
│  [썸네일] React 완전 정복            ₩99,000  ●게시 중     │
│  [썸네일] JavaScript 기초            ₩49,000  ●게시 중     │
│  [썸네일] 포트폴리오 만들기           ₩79,000  ○비공개      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  📈 최근 주문                                               │
│  ─────────────────                                         │
│  김철수 - React 완전 정복 - ₩99,000 - 2026-01-25         │
│  박영희 - JavaScript 기초 - ₩49,000 - 2026-01-24         │
└────────────────────────────────────────────────────────────┘
```

### 4.3 상품 등록 페이지 (AI 통합)

```
┌────────────────────────────────────────────────────────────┐
│  새 상품 등록                                               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  1️⃣ 기본 정보                                               │
│  ─────────────────                                         │
│  상품 제목: [React로 만드는 포트폴리오 웹사이트____________] │
│  카테고리: [온라인 강의 ▼]                                  │
│  가격:     [₩____________]  [🤖 AI 가격 추천 받기]          │
│  난이도:   ( ) 초급  (●) 중급  ( ) 고급                    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  2️⃣ 썸네일 이미지                                            │
│  ─────────────────                                         │
│  [이미지 업로드]  또는  [🤖 AI 썸네일 생성]                 │
│                                                            │
│  AI 생성 옵션:                                              │
│  [ ] 현대적이고 미니멀한 디자인                             │
│  [ ] 기술적이고 전문적인 느낌                               │
│  [ ] 친근하고 따뜻한 분위기                                 │
│                                                            │
│  [생성하기] → 3가지 옵션 제공                               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  3️⃣ 상품 설명                                               │
│  ─────────────────                                         │
│  [직접 입력]  또는  [🤖 AI 설명 생성]                       │
│                                                            │
│  AI 생성을 위한 정보:                                        │
│  - 핵심 포인트 1: [React 기초부터 실전까지____________]     │
│  - 핵심 포인트 2: [포트폴리오 웹사이트 제작__________]     │
│  - 핵심 포인트 3: [배포 & 운영 가이드________________]     │
│  - 대상 고객: [React 입문자_________________________]     │
│  - 강의 시간: [총 20시간_____________________________]     │
│                                                            │
│  [AI 설명 생성하기] → 500-800자 자동 생성                   │
│                                                            │
│  생성된 설명:                                               │
│  [자동 생성된 텍스트가 여기 표시됩니다_________________]    │
│  [수정하기]                                                 │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  [미리보기]              [임시저장]            [등록하기]    │
└────────────────────────────────────────────────────────────┘
```

### 4.4 구매자 마켓플레이스

```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  홈  마켓플레이스  내 학습  🤖AI 추천    [프로필]   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  💡 나에게 맞는 강의를 찾고 계신가요?                        │
│  🤖 AI 학습 경로 추천을 받아보세요!                          │
│                                                            │
│  [🎯 AI 추천 받기]                                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  [검색__________________________________________] [검색]    │
│                                                            │
│  [전체 ▼]  [가격 ▼]  [난이도 ▼]  [평점 ▼]                 │
└────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ [썸네일]     │ [썸네일]     │ [썸네일]     │
│ React 완전   │ JavaScript   │ 포트폴리오   │
│ 정복         │ 기초         │ 만들기       │
│ ★★★★★ (127) │ ★★★★☆ (89)  │ ★★★★★ (156) │
│ ₩99,000     │ ₩49,000     │ ₩79,000     │
│ @김개발      │ @박코딩      │ @이디자인    │
└──────────────┴──────────────┴──────────────┘
```

### 4.5 AI 학습 경로 추천 페이지

```
┌────────────────────────────────────────────────────────────┐
│  🤖 AI 학습 경로 추천                                        │
│  당신의 목표에 맞는 최적의 학습 경로를 찾아드립니다           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  1️⃣ 관심 분야를 선택해주세요                                  │
│  ─────────────────                                         │
│  [💻 프로그래밍]  [🎨 디자인]  [📈 마케팅]  [💼 비즈니스]   │
│  [📝 글쓰기]  [🎬 영상 제작]  [기타]                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  2️⃣ 현재 수준은 어떠신가요?                                   │
│  ─────────────────                                         │
│  ( ) 완전 초보 - 경험이 전혀 없어요                         │
│  (●) 입문자 - 기본적인 것만 알고 있어요                     │
│  ( ) 중급자 - 어느 정도 할 수 있어요                        │
│  ( ) 고급자 - 실무 경험이 있어요                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  3️⃣ 학습 목표를 입력해주세요                                  │
│  ─────────────────                                         │
│  [웹 개발자로 취업하고 싶어요__________________________]    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  4️⃣ 주당 학습 가능 시간은?                                    │
│  ─────────────────                                         │
│  ( ) 주 1-2시간  (●) 주 3-5시간  ( ) 주 10시간 이상        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  5️⃣ 예산 범위는?                                              │
│  ─────────────────                                         │
│  최소: [50,000]원    최대: [300,000]원                      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  [🤖 AI 학습 경로 추천 받기]                                 │
└────────────────────────────────────────────────────────────┘

[↓ AI 분석 중... 약 10초 소요]

┌────────────────────────────────────────────────────────────┐
│  ✨ AI 추천 결과                                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  📊 진단 결과                                                │
│  ─────────────────                                         │
│  현재 수준: 웹 개발 입문자                                   │
│  강점: 학습 의지가 높고 시간 투자 가능                       │
│  약점: 프로그래밍 기초 지식 필요                             │
│  준비도: ████████░░ 80% - 목표 달성 가능성 높음            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  🛤️ 추천 학습 경로 (총 6개월)                                │
│  ─────────────────                                         │
│  ▶ 1단계 (1-2개월): HTML/CSS 기초                          │
│    추천 강의: "웹 기초부터 시작하기" - ₩49,000             │
│    ⭐⭐⭐⭐⭐ (156명 수강) @김개발                           │
│    → 웹 페이지 구조와 스타일링을 배웁니다                   │
│                                                            │
│  ▶ 2단계 (2-3개월): JavaScript 기초                        │
│    추천 강의: "JavaScript 완전 정복" - ₩79,000            │
│    ⭐⭐⭐⭐⭐ (289명 수강) @박코딩                           │
│    → 동적인 웹사이트를 만들 수 있습니다                     │
│                                                            │
│  ▶ 3단계 (3-4개월): React 프레임워크                        │
│    추천 강의: "React로 만드는 실전 프로젝트" - ₩99,000     │
│    ⭐⭐⭐⭐★ (412명 수강) @이개발                           │
│    → 현대적인 웹 앱을 제작할 수 있습니다                    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  💰 예상 투자                                                │
│  ─────────────────                                         │
│  총 비용: ₩227,000 (예산 내)                                │
│  예상 기간: 6개월                                            │
│  예상 결과: 주니어 웹 개발자 취업 가능                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┘
│  [강의 둘러보기]    [💬 AI 상담하기]    [장바구니에 모두 담기] │
└────────────────────────────────────────────────────────────┘
```

### 4.6 AI 상담 챗봇

```
┌────────────────────────────────────────────────────────────┐
│  🤖 AI 학습 상담                              [최소화] [닫기] │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  AI: 안녕하세요! 학습 고민을 도와드릴게요. 무엇이 궁금하신가요?│
│  ─────────────────                                         │
│  YOU: 저는 프로그래밍 완전 초보인데 웹 개발자가 되고 싶어요. │
│       어떤 강의를 들어야 할까요?                            │
│  ─────────────────                                         │
│  AI: 웹 개발자 목표를 가지신 초보자시군요! 👨‍💻              │
│      추천 학습 경로를 안내해드릴게요.                        │
│                                                            │
│      1단계 (1-2개월): HTML/CSS 기초                        │
│      → [웹 기초부터 시작하기] (₩49,000)                    │
│                                                            │
│      2단계 (2-3개월): JavaScript 기초                      │
│      → [JavaScript 완전 정복] (₩79,000)                   │
│                                                            │
│      3단계 (3-4개월): React                                │
│      → [React 실전 프로젝트] (₩99,000)                     │
│                                                            │
│      예상 기간: 6-9개월                                     │
│      총 투자: ₩227,000                                      │
│                                                            │
│      더 자세한 상담이 필요하신가요? 😊                       │
│  ─────────────────                                         │
│  [메시지 입력_______________________________________] [전송] │
└────────────────────────────────────────────────────────────┘

[빠른 질문]
• 이 강의가 내게 맞나요?
• 다른 추천 강의 보기
• 예산 조정하기
• 강사님과 상담하기
```

---

## 🚀 5. 개발 로드맵

### 5.1 Phase 1: 기반 통합 (2주)

#### Week 1: JobsBuild → JobsClass 코드 이전
**목표**: 기존 코드 완전 통합

**Day 1-2: 프로젝트 구조 정리**
- JobsBuild 저장소를 JobsClass 저장소로 복사
- 불필요한 파일 정리 (websites 관련)
- 패키지 업데이트

**Day 3-4: 데이터베이스 통합**
- JobsClass 스키마 적용
- JobsBuild 데이터 마이그레이션 스크립트 작성
- 테스트 데이터 이전

**Day 5-7: 기능 통합 & 테스트**
- Toss Payments 코드 이전
- AI 온보딩 코드 이전
- 통합 테스트

#### Week 2: 역할 분리 & 마켓플레이스
**목표**: 판매자/구매자 계정 분류 완성

**Day 8-10: 회원가입 리팩토링**
- 역할 선택 페이지
- 판매자 온보딩
- 구매자 온보딩

**Day 11-12: 마켓플레이스 UI**
- 상품 목록 페이지
- 상품 상세 페이지
- 검색 & 필터

**Day 13-14: 구매자 대시보드**
- 구매 내역
- 리뷰 작성
- 학습 진행 현황

---

### 5.2 Phase 2: AI 기능 통합 (2주)

#### Week 3: 판매자 AI 기능
**목표**: AI 썸네일, 설명, 블로그 생성

**Day 15-16: AI API 설계**
```typescript
// POST /api/ai/generate-thumbnail
{
  title: string
  category: string
  style: 'modern' | 'technical' | 'warm'
}
→ { imageUrl: string }

// POST /api/ai/generate-description
{
  title: string
  category: string
  keyPoints: string[]
  targetAudience: string
}
→ {
  description: string
  includes: string[]
  requirements: string[]
  ...
}
```

**Day 17-18: UI 통합**
- 상품 등록 페이지에 AI 버튼 추가
- 생성 중 로딩 인디케이터
- 결과 미리보기 & 수정 기능

**Day 19-20: 사용량 제한 로직**
- 플랜별 할당량 체크
- 사용량 대시보드
- 초과 시 업그레이드 유도

**Day 21: 테스트**
- AI 기능 전체 테스트
- 에러 처리 확인

#### Week 4: 구매자 AI 기능
**목표**: AI 학습 경로 추천 & 챗봇

**Day 22-24: AI 추천 시스템**
```typescript
// POST /api/ai/recommend-learning-path
{
  profile: LearnerProfile
}
→ {
  diagnosis: {...}
  learningPath: [...]
  recommendedProducts: [...]
  roadmap: [...]
}
```

**Day 25-27: AI 챗봇**
- WebSocket 또는 Server-Sent Events
- 대화 컨텍스트 유지
- 상품 추천 로직

**Day 28: 통합 & 테스트**

---

### 5.3 Phase 3: 구독 & 결제 (1주)

#### Week 5: 구독 플랜 시스템
**목표**: 플랜 비교 페이지 & 구독 결제

**Day 29-30: 요금제 페이지**
- 플랜 비교 UI
- 플랜 선택 & 결제 플로우

**Day 31-32: Toss Payments 구독 연동**
- 정기 결제 구현
- 플랜 업그레이드/다운그레이드
- 자동 갱신 처리

**Day 33-35: 정산 시스템**
- 파트너 정산 신청
- 관리자 승인 플로우
- 정산 내역 조회

---

### 5.4 Phase 4: 최적화 & 배포 (1주)

#### Week 6: 성능 최적화 & 론칭
**목표**: 프로덕션 배포

**Day 36-37: 성능 최적화**
- 이미지 최적화 (Next.js Image)
- DB 쿼리 최적화 (인덱스 추가)
- API 응답 캐싱
- 코드 스플리팅

**Day 38-39: 보안 강화**
- Supabase RLS 활성화
- 환경변수 보안 점검
- Rate Limiting 추가

**Day 40-42: 프로덕션 배포**
- Vercel 배포
- 도메인 연결 (jobsclass.kr)
- 모니터링 설정 (Sentry)
- 전체 기능 테스트

---

## 🛡️ 6. 기술 스택 (최종)

### Frontend
- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Radix UI
- **Icons**: Lucide React
- **State Management**: React Context (필요 시 Zustand)

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

### AI Integration
- **Text Generation**: OpenAI GPT-4o-mini
- **Image Generation**: DALL-E 3 (OpenAI)
- **Embeddings**: OpenAI text-embedding-3-small (추천 시스템용)

### Payment
- **Payment Gateway**: Toss Payments
- **Subscription**: Toss Payments 정기 결제

### Deployment
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **Monitoring**: Sentry (에러 트래킹)
- **Analytics**: Vercel Analytics

### DevOps
- **Version Control**: Git (GitHub)
- **CI/CD**: Vercel 자동 배포
- **Environment**: .env.local (로컬), Vercel Environment Variables (프로덕션)

---

## 📊 7. 예상 비용 & 수익 분석

### 7.1 월간 운영 비용

**인프라 비용**:
- Vercel Pro: $20/월 (₩26,000)
- Supabase Pro: $25/월 (₩32,500)
- **소계**: ₩58,500/월

**AI 비용** (파트너 1,000명 기준):
- GPT-4o-mini: 평균 ₩5,000,000/월
  - 상품 설명 생성: 5,000회 × ₩52 = ₩260,000
  - AI 추천: 10,000회 × ₩200 = ₩2,000,000
  - AI 챗봇: 20,000회 × ₩100 = ₩2,000,000
  - 기타 AI 기능: ₩740,000
- DALL-E 3: 평균 ₩1,000,000/월
  - 썸네일 생성: 2,000회 × ₩500 = ₩1,000,000

**총 운영 비용**: 약 ₩6,058,500/월

### 7.2 월간 예상 수익

**구독 수익** (파트너 1,000명 기준):
- FREE (30%): 300명 × ₩0 = ₩0
- STARTER (40%): 400명 × ₩29,000 = ₩11,600,000
- PRO (25%): 250명 × ₩79,000 = ₩19,750,000
- ENTERPRISE (5%): 50명 × ₩300,000 = ₩15,000,000

**구독 수익 합계**: ₩46,350,000/월

**거래 수수료** (월 거래액 ₩100,000,000 가정):
- FREE (15%): ₩30M × 15% = ₩4,500,000
- STARTER (10%): ₩40M × 10% = ₩4,000,000
- PRO (7%): ₩25M × 7% = ₩1,750,000
- ENTERPRISE (5%): ₩5M × 5% = ₩250,000

**수수료 수익 합계**: ₩10,500,000/월

### 7.3 수익성 분석

**총 매출**: ₩56,850,000/월  
**총 비용**: ₩6,058,500/월  
**순이익**: ₩50,791,500/월  
**이익률**: **89.3%**

**Break-even Point**: 파트너 약 150명

---

## ✅ 8. 성공 지표 (KPI)

### 8.1 파트너 지표
- 신규 파트너 가입: 월 50명 이상
- 활성 파트너 비율: 60% 이상
- 평균 상품 등록 수: 파트너당 5개 이상
- 플랜 업그레이드율: 월 10% 이상

### 8.2 구매자 지표
- 신규 구매자 가입: 월 200명 이상
- 구매 전환율: 15% 이상
- 재구매율: 30% 이상
- AI 추천 사용률: 50% 이상

### 8.3 AI 기능 지표
- AI 상품 설명 생성 만족도: 4.5/5 이상
- AI 추천 정확도: 70% 이상
- AI 챗봇 완료율: 60% 이상

### 8.4 비즈니스 지표
- 월 거래액: ₩100,000,000 이상
- 플랫폼 수수료 수익: ₩10,000,000 이상
- 구독 수익: ₩40,000,000 이상
- 순이익: ₩50,000,000 이상

---

## 🎯 9. 최종 체크리스트

### ✅ 개발 전 준비
- [ ] JobsBuild 코드 백업
- [ ] JobsClass 저장소 준비
- [ ] Supabase 프로젝트 생성
- [ ] OpenAI API 키 발급
- [ ] Toss Payments 계정 준비

### ✅ Phase 1 완료 기준
- [ ] JobsBuild → JobsClass 코드 이전 완료
- [ ] 데이터베이스 통합 완료
- [ ] 판매자/구매자 계정 분류 완료
- [ ] 마켓플레이스 기본 UI 완성

### ✅ Phase 2 완료 기준
- [ ] 판매자 AI 기능 3가지 작동 (썸네일/설명/블로그)
- [ ] 구매자 AI 추천 시스템 작동
- [ ] AI 챗봇 작동
- [ ] 사용량 제한 로직 작동

### ✅ Phase 3 완료 기준
- [ ] 요금제 페이지 완성
- [ ] Toss Payments 구독 결제 작동
- [ ] 정산 시스템 작동

### ✅ Phase 4 완료 기준
- [ ] 성능 최적화 완료
- [ ] 보안 강화 완료
- [ ] 프로덕션 배포 완료
- [ ] 전체 기능 테스트 통과

---

## 📝 10. 다음 단계

### 즉시 실행할 작업 (지금!)

1. **이 기획서 검토 & 승인**
   - 내용 확인
   - 수정 사항 피드백

2. **개발 환경 준비**
   - JobsBuild 저장소 → JobsClass로 이름 변경
   - 새로운 브랜치 생성: `develop/jobsclass-2.0`

3. **개발 시작**
   - Phase 1 Day 1 시작
   - 프로젝트 구조 정리

---

**이 기획서에 동의하시면 바로 개발을 시작하겠습니다!** 🚀

**질문이나 수정 사항이 있으면 알려주세요.**
