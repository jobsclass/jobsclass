# JobsBuild 웹빌더 전략 (리멤버 모델)

> **핵심**: 프로덕트로 승부 → 기술력 차별화 → 유튜브 바이럴

---

## 🎯 비즈니스 모델

### 구독 기반 SaaS
```
FREE:     ₩0/월      (제한적 기능, JobsBuild 브랜딩)
STARTER:  ₩9,900/월  (기본 기능, 커스텀 도메인)
PRO:      ₩29,900/월 (AI 고급 기능, 무제한)
```

### 타겟 고객
```
1차: 1인 프리랜서, 소상공인
2차: 크리에이터, 강사
3차: 스타트업, 에이전시
```

---

## 💡 차별화 포인트 (리멤버 전략)

### 1️⃣ 초간단 UX
```
경쟁사 비교:
❌ 리틀리: 너무 단순 (기능 부족)
❌ 아임웹: 너무 복잡 (학습 곡선 높음)
❌ Wix/Webflow: 드래그앤드롭 (시간 오래 걸림)

✅ JobsBuild: 폼 기반 + AI
- 드래그앤드롭 없음
- 질문 답변만으로 완성
- 1분 만에 실제 배포
```

### 2️⃣ AI 통합
```
기능:
1. AI 카피라이팅
   - 서비스 설명 자동 생성
   - SEO 최적화 자동

2. AI 디자인 추천
   - "카페 웹사이트" → 3가지 템플릿 생성
   - 색상 팔레트 자동 추천
   - 이미지 자동 선택 (Unsplash)

3. AI 레이아웃 조정
   - 모바일 자동 최적화
   - 섹션 순서 AI 추천
```

### 3️⃣ 속도
```
기존 웹빌더: 30분 ~ 2시간
JobsBuild:      1분 ~ 5분

비결:
- 템플릿 기반 (5~10개)
- AI 자동 채우기
- 즉시 배포 (서버리스)
```

---

## 🏗️ 기술 아키텍처

### Phase 1: MVP (2주)

#### 1. 템플릿 시스템
```typescript
// DB 스키마
websites {
  id: uuid
  user_id: uuid (FK)
  template_id: string ("modern", "minimal", "creative")
  title: string
  slug: string (my-site)
  content: jsonb {
    hero: { title, subtitle, image, cta }
    about: { text, image }
    services: [{ title, description, icon }]
    contact: { email, phone, social }
  }
  settings: jsonb {
    colors: { primary, secondary, accent }
    fonts: { heading, body }
  }
  custom_domain: string?
  is_published: boolean
  created_at: timestamp
}

templates {
  id: string
  name: string
  preview_url: string
  schema: jsonb (섹션 구조)
  is_premium: boolean
}
```

#### 2. 폼 기반 빌더 UI
```
Step 1: 템플릿 선택 (3~5개)
Step 2: 기본 정보 입력 (제목, 부제목, 로고)
Step 3: 섹션 구성 (Hero, About, Services, Contact)
Step 4: 색상/폰트 (AI 추천 또는 직접 선택)
Step 5: 배포 (my-site.jobsbuild.com)
```

#### 3. 배포 시스템
```
방식 1: Static Generation (Next.js)
- 폼 제출 → JSON 저장 → 빌드 트리거 → Vercel 배포

방식 2: Dynamic SSR (권장)
- /[username] → DB에서 content 조회 → 템플릿 렌더링
- 빠른 배포 (즉시)
- 수정 즉시 반영
```

---

### Phase 2: AI 통합 (2주)

#### 1. Gemini API 연동
```typescript
// AI 카피라이팅
async function generateCopy(businessType: string, tone: string) {
  const prompt = `
    비즈니스: ${businessType}
    톤: ${tone}
    
    다음을 생성해주세요:
    1. 메인 헤드라인 (10자 이내)
    2. 서브타이틀 (30자 이내)
    3. 서비스 설명 3개 (각 50자 이내)
    4. CTA 버튼 문구
  `
  
  return await gemini.generateText(prompt)
}

// AI 색상 추천
async function recommendColors(businessType: string) {
  const prompt = `
    비즈니스: ${businessType}
    
    브랜드에 어울리는 색상 팔레트를 HEX 코드로 추천:
    1. Primary Color
    2. Secondary Color
    3. Accent Color
  `
  
  return await gemini.generateText(prompt)
}
```

#### 2. Unsplash API 연동
```typescript
// AI 이미지 추천
async function recommendImages(businessType: string) {
  const keywords = await gemini.extractKeywords(businessType)
  
  const images = await unsplash.search({
    query: keywords.join(' '),
    per_page: 9
  })
  
  return images
}
```

---

### Phase 3: 고급 기능 (4주)

#### 1. 템플릿 확장
```
- 10개 템플릿 (업종별)
- 커스텀 템플릿 업로드 (PRO)
- 템플릿 마켓플레이스 (나중에)
```

#### 2. SEO 최적화
```
- 자동 메타태그 생성
- Sitemap 자동 생성
- Google Analytics 연동
```

#### 3. 커스텀 도메인
```
- my-domain.com 연결
- SSL 자동 발급 (Let's Encrypt)
- DNS 설정 가이드
```

---

## 📈 유튜브 마케팅 전략

### 콘텐츠 아이디어
```
1. "AI로 1분 만에 카페 웹사이트 만들기"
   - 실제 타이머 표시
   - Before/After 비교
   - 예상 조회수: 10만+

2. "코딩 없이 포트폴리오 10분 완성"
   - 프리랜서 타겟
   - 실전 예제
   - 예상 조회수: 5만+

3. "리틀리 vs 아임웹 vs JobsBuild 비교"
   - 속도, 기능, 가격 비교
   - 공정한 평가
   - 예상 조회수: 3만+

4. "월 1만원으로 전문가 웹사이트 만드는 법"
   - 가성비 강조
   - 실제 사용 사례
   - 예상 조회수: 5만+
```

### 전환 퍼널
```
유튜브 영상 시청
→ 설명란 링크 클릭 (jobsbuild.com)
→ 무료 체험 가입
→ 웹사이트 생성 (1분)
→ 유료 전환 (7일 후)
```

### 목표
```
1개월: 영상 10개 → 가입 1,000명 → 유료 100명
2개월: 영상 20개 → 가입 5,000명 → 유료 500명
3개월: 영상 30개 → 가입 10,000명 → 유료 1,000명

수익: 1,000명 × ₩9,900 = ₩9,900,000/월
```

---

## 🚀 MVP 개발 일정 (2주)

### Week 1: 코어 기능
```
Day 1-2: DB 스키마 재설계
- websites 테이블 생성
- templates 테이블 생성
- 파트너 → 유저 용어 변경

Day 3-4: 템플릿 시스템
- 템플릿 3개 제작 (Modern, Minimal, Creative)
- 템플릿 선택 UI

Day 5-7: 폼 빌더 UI
- Step 1-5 폼 구현
- 실시간 미리보기
```

### Week 2: 배포 & AI
```
Day 1-3: 배포 시스템
- Dynamic SSR 구현
- /[username] 라우팅
- 즉시 배포 테스트

Day 4-5: AI 통합
- Gemini API 연동
- AI 카피라이팅 기능
- AI 색상 추천

Day 6-7: 테스트 & 배포
- E2E 테스트
- Vercel 배포
- 유튜브 첫 영상 제작
```

---

## 💰 수익 시뮬레이션

### 낙관적 시나리오
```
1개월: 가입 1,000명 × 10% = 100명 유료 (₩990,000)
2개월: 가입 5,000명 × 10% = 500명 유료 (₩4,950,000)
3개월: 가입 10,000명 × 10% = 1,000명 유료 (₩9,900,000)

6개월: 30,000명 × 10% = 3,000명 유료 (₩29,700,000)
```

### 보수적 시나리오
```
1개월: 가입 100명 × 5% = 5명 유료 (₩49,500)
2개월: 가입 500명 × 5% = 25명 유료 (₩247,500)
3개월: 가입 1,000명 × 5% = 50명 유료 (₩495,000)

6개월: 5,000명 × 5% = 250명 유료 (₩2,475,000)
```

---

## 🎯 성공 지표 (KPI)

### 제품 지표
```
- 가입 → 첫 웹사이트 생성: 80% 이상
- 생성 → 배포: 90% 이상
- 평균 생성 시간: 5분 이하
- 무료 → 유료 전환: 10% 목표
```

### 마케팅 지표
```
- 유튜브 영상 조회수: 영상당 평균 5만+
- CTR (클릭률): 5% 이상
- 가입 전환율: 10% 이상
```

---

## 🔥 핵심 전략 요약

1. **프로덕트로 승부**: 마켓플레이스(영업력) → 웹빌더(기술력)
2. **리멤버 전략**: 초간단 UX + AI = 차별화
3. **속도**: 1분 만에 완성 (실제 구현)
4. **유튜브**: 바이럴 콘텐츠 → 즉시 체험 → 유료 전환
5. **구독 모델**: 안정적 MRR (Monthly Recurring Revenue)

---

**JobsBuild - 1분 만에 완성하는 AI 웹빌더** 🚀
