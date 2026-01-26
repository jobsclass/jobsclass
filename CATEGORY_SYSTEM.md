# JobsBuild 카테고리 시스템

## 개요
JobsBuild는 **8개 대분류 카테고리**와 **30개 세부 분류**로 구성된 체계적인 카테고리 시스템을 갖추고 있습니다.

---

## 📊 전체 카테고리 구조

### 1️⃣ IT·개발 (it-dev)
1인 개발자, 프리랜서 개발자를 위한 온라인 강의 및 멘토링

**세부 분류:**
- **웹 개발** (web-dev): 프론트엔드, 백엔드, 풀스택, React, Node.js, Next.js
- **앱 개발** (app-dev): iOS, Android, Flutter, React Native, 크로스플랫폼
- **데이터·AI** (data-ai): Python, 머신러닝, ChatGPT, 데이터 분석, 딥러닝
- **게임 개발** (game-dev): Unity, Unreal, C#, C++, 게임 디자인
- **프로그래밍 기초** (programming-basics): 코딩 입문, 알고리즘, 자료구조, CS 기초

---

### 2️⃣ 디자인·크리에이티브 (design-creative)
디자이너, 크리에이터를 위한 강의 및 포트폴리오 제작 서비스

**세부 분류:**
- **UI/UX 디자인** (uiux): Figma, Sketch, 프로토타입, 사용자 경험, 웹 디자인
- **그래픽 디자인** (graphic): Photoshop, Illustrator, 브랜딩, 로고, 포스터
- **영상 제작** (video): Premiere, After Effects, 유튜브, 모션그래픽, 편집
- **3D·VR** (3d): Blender, Maya, 3D 모델링, VR, AR

---

### 3️⃣ 비즈니스·마케팅 (business-marketing)
마케터, 콘텐츠 크리에이터를 위한 온라인 강의 및 컨설팅

**세부 분류:**
- **SNS 마케팅** (sns-marketing): 인스타그램, 유튜브, TikTok, 숏폼, 콘텐츠 전략
- **퍼포먼스 마케팅** (performance-marketing): 구글 애즈, 메타 광고, SEO, 데이터 분석, GA4
- **브랜딩·전략** (branding): 브랜드 전략, 포지셔닝, 스토리텔링, CI/BI
- **콘텐츠 제작** (content-creation): 블로그, 카피라이팅, 뉴스레터, 글쓰기

---

### 4️⃣ 재테크·금융 (finance-investment)
재테크 전문가, 경제 유튜버를 위한 온라인 강의 및 1:1 컨설팅

**세부 분류:**
- **주식·투자** (stock): 주식, 해외주식, ETF, 투자 전략, 기술적 분석
- **부동산** (realestate): 부동산 투자, 경매, 임대사업, 청약
- **경제·금융** (economy): 거시경제, 금융상품, 재무설계, 은퇴 준비

---

### 5️⃣ 창업·부업 (startup-sidejob)
1인 창업가, N잡러를 위한 사이드 프로젝트 및 온라인 비즈니스 강의

**세부 분류:**
- **온라인 비즈니스** (online-business): 쿠팡 파트너스, 스마트스토어, 블로그 수익화, 제휴 마케팅
- **오프라인 창업** (offline-business): 프랜차이즈, 카페, 식당, 소자본 창업
- **프리랜서** (freelance): N잡러, 재능 판매, 외주, 포트폴리오

---

### 6️⃣ 라이프·취미 (life-hobby)
취미 크리에이터, 라이프스타일 인플루언서를 위한 온라인 클래스

**세부 분류:**
- **요리·베이킹** (cooking): 홈쿡, 베이킹, 디저트, 건강식, 한식
- **운동·건강** (fitness): 홈트, 필라테스, 요가, 다이어트, 헬스
- **공예·DIY** (craft): 뜨개질, 목공, 캘리그라피, 수공예, 인테리어
- **반려동물** (pet): 반려견, 고양이, 훈련, 건강, 용품

---

### 7️⃣ 자기계발·교양 (self-improvement)
자기계발 코치, 교육 전문가를 위한 온라인 강의 및 멘토링

**세부 분류:**
- **외국어** (language): 영어, 중국어, 일본어, 회화, 토익
- **독서·글쓰기** (reading): 독서법, 글쓰기, 작가, 책 추천, 독서 모임
- **심리·상담** (psychology): 심리학, 상담, 자존감, 인간관계, 마음 치유
- **커리어·이직** (career): 이직, 면접, 이력서, 자기소개서, 커리어 전환

---

### 8️⃣ 전문 컨설팅 (consulting)
변호사, 세무사, 노무사 등 전문가를 위한 1:1 컨설팅 서비스

**세부 분류:**
- **법률** (legal): 계약서, 노동법, 부동산 법률, 소송
- **세무·회계** (tax): 종합소득세, 부가가치세, 법인세, 회계, 절세
- **노무·인사** (labor): 4대 보험, 근로계약서, HR, 급여 계산
- **특허·지식재산** (patent): 특허, 상표, 저작권, 디자인 등록

---

## 🗄️ 데이터베이스 구조

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- 카테고리 (8개 대분류)
  category_1 TEXT NOT NULL CHECK (
    category_1 IN (
      'it-dev',
      'design-creative',
      'business-marketing',
      'finance-investment',
      'startup-sidejob',
      'life-hobby',
      'self-improvement',
      'consulting'
    )
  ),
  
  -- 세부 분류 (Depth 2)
  category_2 TEXT CHECK (
    category_2 IN (
      -- IT·개발 (5개)
      'web-dev', 'app-dev', 'data-ai', 'game-dev', 'programming-basics',
      -- 디자인·크리에이티브 (4개)
      'uiux', 'graphic', 'video', '3d',
      -- 비즈니스·마케팅 (4개)
      'sns-marketing', 'performance-marketing', 'branding', 'content-creation',
      -- 재테크·금융 (3개)
      'stock', 'realestate', 'economy',
      -- 창업·부업 (3개)
      'online-business', 'offline-business', 'freelance',
      -- 라이프·취미 (4개)
      'cooking', 'fitness', 'craft', 'pet',
      -- 자기계발·교양 (4개)
      'language', 'reading', 'psychology', 'career',
      -- 전문 컨설팅 (4개)
      'legal', 'tax', 'labor', 'patent'
    )
  ),
  
  -- 태그 (검색 및 필터링용)
  tags JSONB,
  
  ...
);
```

---

## 💻 TypeScript 타입

```typescript
// 서비스 카테고리 (8개 대분류)
export type ServiceCategory = 
  | 'it-dev'
  | 'design-creative'
  | 'business-marketing'
  | 'finance-investment'
  | 'startup-sidejob'
  | 'life-hobby'
  | 'self-improvement'
  | 'consulting'

// 서비스 세부 분류 (Depth 2)
export type ServiceSubcategory = 
  // IT·개발
  | 'web-dev'
  | 'app-dev'
  | 'data-ai'
  | 'game-dev'
  | 'programming-basics'
  // 디자인·크리에이티브
  | 'uiux'
  | 'graphic'
  | 'video'
  | '3d'
  // ... (나머지 카테고리)
```

---

## 🎯 사용 예시

### 서비스 등록 플로우
1. **Step 1: 대분류 선택** → 8개 중 1개 선택 (예: IT·개발)
2. **Step 2: 세부 분류 선택** → 해당 카테고리의 하위 분류 선택 (예: 웹 개발)
3. **Step 3: 태그 입력** → 자동 완성 태그 추천 (예: React, Next.js, TypeScript)
4. **Step 4: 서비스 상세 정보 입력**

### 검색 및 필터링
- **대분류 필터**: IT·개발, 디자인·크리에이티브 등
- **세부 분류 필터**: 웹 개발, 앱 개발 등
- **태그 검색**: React, ChatGPT, 부업 등

---

## 🚀 마이그레이션 가이드

기존 `service_type` 데이터를 새로운 카테고리 시스템으로 마이그레이션할 때:

```sql
-- 예시: online-course → category_1='it-dev', category_2='web-dev'
UPDATE services
SET 
  category_1 = 'it-dev',
  category_2 = 'web-dev',
  tags = '["React", "Next.js", "TypeScript"]'::JSONB
WHERE service_type = 'online-course' AND title LIKE '%React%';
```

---

## 📝 참고 자료

- **카테고리 헬퍼 함수**: `lib/categories.ts`
- **DB 스키마**: `supabase/schema.sql`
- **TypeScript 타입**: `types/database.ts`

---

**최종 업데이트**: 2026-01-24  
**커밋**: feat: 8개 대분류 카테고리 시스템 구축
