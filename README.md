# Corefy - AI 웹사이트 빌더 🚀

> 🏆 **특허 핵심 기술 3가지 탑재**
> 1. 멀티모달 AI 생성 (텍스트 + 이미지 동시 생성)
> 2. 대화형 온보딩 (질의응답 기반 웹사이트 자동 생성)
> 3. 컨텍스트 기반 가격 추천 (시장 분석 + AI)

---

## 📋 목차
- [기능 소개](#기능-소개)
- [기술 스택](#기술-스택)
- [환경 변수 설정](#환경-변수-설정)
- [로컬 개발 환경 구축](#로컬-개발-환경-구축)
- [Vercel 배포 가이드](#vercel-배포-가이드)
- [AI 기능 사용법](#ai-기능-사용법)
- [특허 기술 상세](#특허-기술-상세)

---

## 🎯 기능 소개

### ✨ AI 기반 웹사이트 자동 생성
- **10분 안에** 전문가급 웹사이트 완성
- **5개 질문**만 답하면 AI가 모든 것을 자동 생성
- 프로필, 서비스 3개, 블로그 5개, 포트폴리오 3개, 커리어 자동 구축

### 🎨 멀티모달 AI 생성 (특허 기술)
- **원클릭**으로 텍스트 + 이미지 동시 생성
- 텍스트-이미지 **일관성 검증** 알고리즘
- GPT-4o-mini + DALL-E 3 통합

### 💰 AI 가격 책정 추천 (특허 기술)
- **12개 카테고리** 시장 데이터 기반
- 가격 범위, 근거, 전략, 팁 제공
- 시장 인사이트 자동 분석

### 🌐 공개 웹사이트 자동 배포
- `corefy.vercel.app/{username}` 즉시 공개
- SEO 최적화 자동 적용
- 반응형 디자인

---

## 🛠 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Supabase** (Database, Auth, Storage)
- **Next.js API Routes**

### AI
- **OpenAI GPT-4o-mini** (텍스트 생성)
- **OpenAI DALL-E 3** (이미지 생성)

### Deployment
- **Vercel** (자동 배포)

---

## 🔐 환경 변수 설정

### 1. `.env.local` 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (필수)
JWT_SECRET=your_jwt_secret_32_characters_minimum

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API (필수 - AI 기능용)
OPENAI_API_KEY=sk-proj-your_openai_api_key
```

### 2. Supabase 설정
1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Settings → API에서 URL과 Keys 복사
4. SQL Editor에서 `supabase/webbuilder_schema.sql` 실행

### 3. OpenAI API 키 발급
1. [OpenAI Platform](https://platform.openai.com) 가입
2. API Keys 메뉴에서 새 키 생성
3. `.env.local`에 추가

### 4. JWT Secret 생성
터미널에서 실행:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💻 로컬 개발 환경 구축

### 1. 저장소 클론
```bash
git clone https://github.com/jobsclass/corefy.git
cd corefy
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정
위의 [환경 변수 설정](#환경-변수-설정) 참고

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 빌드 테스트
```bash
npm run build
```

---

## 🚀 Vercel 배포 가이드

### 1. Vercel 계정 연결
1. [Vercel](https://vercel.com) 가입
2. GitHub 저장소 연결
3. Import Project

### 2. 환경 변수 설정 ⚠️ **중요!**
Vercel 대시보드 → Settings → Environment Variables에서 다음 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
OPENAI_API_KEY=sk-proj-your_key  ← 🔴 AI 기능 필수!
```

**❗ OPENAI_API_KEY를 설정하지 않으면 배포는 성공하지만 AI 기능이 작동하지 않습니다!**

### 3. 배포 실행
- `main` 브랜치에 push 시 자동 배포
- 또는 Vercel 대시보드에서 "Redeploy" 클릭

### 4. 배포 확인
- Deployments 탭에서 상태 확인
- 배포 완료 후 URL 접속하여 테스트

### 5. 배포 에러 해결
배포 실패 시 체크리스트:
- [ ] 모든 환경 변수가 설정되어 있는가?
- [ ] OPENAI_API_KEY가 올바른가?
- [ ] Supabase 연결이 정상인가?
- [ ] 로컬에서 `npm run build`가 성공하는가?

---

## 🤖 AI 기능 사용법

### 1. 멀티모달 AI 생성 (텍스트 + 이미지)
**위치**: 서비스 등록 페이지

**사용 방법**:
1. 카테고리 선택 (예: 마케팅 대행)
2. 서비스명 입력 (예: SNS 마케팅 완전정복)
3. 우측 상단 **"✨ AI 원클릭 생성"** 버튼 클릭
4. 약 15초 대기
5. 자동 생성된 항목 확인:
   - ✅ 설명
   - ✅ 타겟 고객
   - ✅ 문제/해결/효과
   - ✅ 특징 3개
   - ✅ 썸네일 이미지
6. 필요 시 수정 후 저장

**API 엔드포인트**: `/api/ai/generate-multimodal`

---

### 2. 대화형 온보딩 (웹사이트 자동 생성)
**위치**: 회원가입 후 자동 시작

**5개 질문**:
1. 무슨 일을 하시나요?
2. 주로 누구를 도와주시나요?
3. 어떤 서비스를 제공하시나요?
4. 경력이 어떻게 되시나요?
5. (선택) 특별히 강조하고 싶은 성과가 있나요?

**자동 생성**:
- ✅ 프로필 (이름, 직함, 소개, 전문 분야)
- ✅ 서비스 3개
- ✅ 블로그 5개
- ✅ 포트폴리오 3개
- ✅ 커리어 1-2개

**API 엔드포인트**: `/api/ai/generate-website`

---

### 3. AI 가격 추천
**위치**: 서비스 등록 → 가격 정보 섹션

**사용 방법**:
1. 서비스명 + 카테고리 입력
2. **"✨ AI 가격 추천"** 버튼 클릭
3. 약 3초 대기
4. 팝업에서 확인:
   - 추천 가격
   - 가격 범위 (최소/최대)
   - 가격 책정 근거
   - 시장 인사이트
   - 경쟁 우위 포인트
   - 가격 설정 팁 3가지
5. 자동으로 가격 입력란에 반영

**API 엔드포인트**: `/api/ai/suggest-price`

---

## 🏆 특허 기술 상세

### 1️⃣ 멀티모달 AI 생성
**특허명**: "텍스트-이미지 동시 생성을 통한 일관성 있는 서비스 콘텐츠 자동 구축 방법"

**핵심 기술**:
- GPT-4o-mini로 텍스트 생성 (설명, 특징, 문제/해결/효과)
- 생성된 텍스트 기반 이미지 프롬프트 자동 최적화
- DALL-E 3로 이미지 생성
- 텍스트-이미지 일관성 검증 알고리즘 (0-100점)

**차별화 포인트**:
- ✅ 동시 생성으로 일관성 유지
- ✅ 키워드 매칭 기반 품질 검증
- ✅ 원클릭으로 전문가급 콘텐츠

**파일 위치**: `app/api/ai/generate-multimodal/route.ts`

---

### 2️⃣ 대화형 온보딩
**특허명**: "사용자 질의응답 기반 AI 웹사이트 자동 구축 방법 및 시스템"

**핵심 기술**:
- 5개 질문 기반 사용자 정보 수집
- GPT-4o-mini로 프로필/서비스/블로그/포트폴리오/커리어 동시 생성
- Supabase에 자동 저장
- /{username} 공개 웹사이트 즉시 배포

**차별화 포인트**:
- ✅ 비전문가도 10분 안에 웹사이트 완성
- ✅ 질의응답 기반 대화형 인터페이스
- ✅ 생성 후 자유롭게 편집 가능

**파일 위치**: 
- `app/onboarding/page.tsx`
- `app/api/ai/generate-website/route.ts`

---

### 3️⃣ 컨텍스트 기반 가격 추천
**특허명**: "서비스 카테고리 및 시장 데이터 기반 AI 가격 자동 산출 방법"

**핵심 기술**:
- 12개 카테고리 × 6개 지표 시장 데이터베이스
  - 평균 가격, 가격 범위, 시장 규모, 경쟁 강도, 트렌드, 인사이트
- GPT-4o-mini로 시장 데이터 + 서비스 정보 분석
- 추천 가격, 범위, 근거, 전략, 팁 제공

**차별화 포인트**:
- ✅ 실제 시장 데이터 기반 (조사 자료)
- ✅ AI 분석으로 맞춤형 추천
- ✅ 가격 책정 근거 및 전략 제시

**파일 위치**: `app/api/ai/suggest-price/route.ts`

---

## 📊 시장 데이터 (가격 추천용)

| 카테고리 | 평균 가격 | 가격 범위 | 경쟁도 | 트렌드 |
|---------|----------|----------|--------|--------|
| 온라인 강의 | 15만원 | 5만~50만원 | 높음 | 상승 |
| 컨설팅 | 100만원 | 50만~1000만원 | 높음 | 안정 |
| 개발 대행 | 200만원 | 50만~2000만원 | 높음 | 상승 |
| 마케팅 대행 | 150만원 | 50만~1000만원 | 높음 | 상승 |
| 1:1 코칭 | 30만원 | 10만~100만원 | 중간 | 상승 |
| 전자책 | 3만원 | 1만~10만원 | 높음 | 안정 |

---

## 🔧 개발 가이드

### 프로젝트 구조
```
corefy/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── ai/              # AI 관련 API
│   │   │   ├── generate-multimodal/  # 멀티모달 AI
│   │   │   ├── generate-website/     # 온보딩 AI
│   │   │   ├── suggest-price/        # 가격 추천 AI
│   │   │   ├── generate/             # 텍스트 생성
│   │   │   └── generate-image/       # 이미지 생성
│   │   ├── services/         # 서비스 CRUD
│   │   ├── blog/             # 블로그 CRUD
│   │   ├── portfolio/        # 포트폴리오 CRUD
│   │   └── profile/          # 프로필 CRUD
│   ├── dashboard/            # 대시보드 페이지
│   ├── onboarding/           # AI 온보딩 페이지
│   ├── [username]/           # 공개 웹사이트
│   └── auth/                 # 인증 페이지
├── components/               # 재사용 컴포넌트
├── lib/                      # 유틸리티 함수
│   └── supabase/            # Supabase 클라이언트
├── supabase/                 # Supabase SQL 스키마
└── public/                   # 정적 파일
```

### 주요 API 엔드포인트
- `POST /api/ai/generate-multimodal` - 멀티모달 AI 생성
- `POST /api/ai/generate-website` - 온보딩 웹사이트 생성
- `POST /api/ai/suggest-price` - 가격 추천
- `POST /api/services/create` - 서비스 생성
- `GET /api/services/list` - 서비스 목록
- `POST /api/blog/create` - 블로그 생성
- `POST /api/portfolio/create` - 포트폴리오 생성

---

## 🐛 트러블슈팅

### 배포 에러: "There was an error deploying corefy"
**원인**: OpenAI API 키 미설정

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `OPENAI_API_KEY` 추가
3. Redeploy

### AI 기능 오류: "OpenAI API 키가 설정되지 않았습니다"
**원인**: 환경 변수 누락

**해결**:
- 로컬: `.env.local`에 `OPENAI_API_KEY` 추가
- Vercel: Environment Variables에 추가 후 Redeploy

### 빌드 오류: Module not found
**해결**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 라이선스
MIT License

---

## 👥 기여자
- **JobsClass Team**

---

## 📞 문의
- GitHub Issues: https://github.com/jobsclass/jobsbuild/issues
- Email: startupjobs824@gmail.com

---

## 🎉 특허 출원 준비 중
- 멀티모달 AI 생성 방법 및 시스템
- 대화형 온보딩 시스템
- 컨텍스트 기반 가격 추천 시스템

---

**Made with ❤️ by JobsClass**
