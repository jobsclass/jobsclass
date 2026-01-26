# Vercel 배포 가이드 🚀

## 1. 빌드 에러 해결 완료 ✅

### 수정된 항목
- ✅ `app/onboarding/page.tsx` - 닫는 태그 중복 제거
- ✅ `app/api/orders/[id]/route.ts` - Next.js 15 params Promise 타입 대응
- ✅ TypeScript null 체크 추가
- ✅ `@tosspayments/payment-sdk` 패키지 설치

### 빌드 결과
```bash
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (67/67)
✓ Finalizing page optimization
```

---

## 2. Vercel 환경 변수 설정 🔑

### 필수 환경 변수

#### A. Supabase 연결
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### B. OpenAI API (AI 기능)
```env
OPENAI_API_KEY=sk-proj-...
```

#### C. Toss Payments (결제 시스템)
```env
# 테스트 환경
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# 운영 환경 (실제 결제 시)
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...
TOSS_SECRET_KEY=live_sk_...
```

#### D. Next.js 설정
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

---

## 3. Vercel 배포 단계별 가이드

### Step 1: Vercel에 프로젝트 연결

1. Vercel 대시보드 접속: https://vercel.com/
2. "Add New" → "Project" 클릭
3. GitHub 저장소 선택: `jobsclass/corefy`
4. "Import" 클릭

### Step 2: 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)
**Root Directory**: `./` (기본값)
**Build Command**: `npm run build` (기본값)
**Output Directory**: `.next` (기본값)
**Install Command**: `npm install` (기본값)

### Step 3: 환경 변수 설정

**Environment Variables** 섹션에서 위의 모든 환경 변수를 추가:

1. `NEXT_PUBLIC_SUPABASE_URL` 추가
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
3. `SUPABASE_SERVICE_ROLE_KEY` 추가
4. `OPENAI_API_KEY` 추가
5. `NEXT_PUBLIC_TOSS_CLIENT_KEY` 추가
6. `TOSS_SECRET_KEY` 추가

**⚠️ 주의**: `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에 노출됩니다.

### Step 4: 배포

"Deploy" 버튼 클릭 → 빌드 시작

---

## 4. 배포 후 확인 사항 ✅

### 필수 체크리스트
- [ ] 홈페이지 접속 확인
- [ ] 회원가입 기능 테스트
- [ ] 로그인 기능 테스트
- [ ] 온보딩 (AI 웹사이트 생성) 테스트
- [ ] 대시보드 접속 확인
- [ ] 서비스 등록 테스트
- [ ] 고객 문의 폼 테스트
- [ ] 주문/결제 시스템 테스트 (테스트 모드)

### 테스트 결제 정보 (Toss Payments Sandbox)
```
카드 번호: 4000-0000-0000-0008
유효 기간: 01/26
CVC: 123
비밀번호: 1234
```

---

## 5. 환경별 배포 전략

### Development (개발)
- 브랜치: `dev`
- 도메인: `corefy-dev.vercel.app`
- 환경 변수: 테스트 API 키 사용

### Staging (스테이징)
- 브랜치: `staging`
- 도메인: `corefy-staging.vercel.app`
- 환경 변수: 테스트 API 키 사용

### Production (운영)
- 브랜치: `main`
- 도메인: `jobsbuild.com` (커스텀 도메인)
- 환경 변수: 실제 API 키 사용

---

## 6. 문제 해결 (Troubleshooting)

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run lint
```

### 환경 변수 확인
```bash
# Vercel CLI 설치
npm i -g vercel

# 환경 변수 확인
vercel env ls

# 환경 변수 추가
vercel env add OPENAI_API_KEY
```

### 로그 확인
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. "Deployments" 탭
4. 실패한 배포 클릭
5. "Build Logs" 확인

---

## 7. 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용
- Vercel CDN 자동 적용

### 캐싱 전략
- Static 페이지: ISR (Incremental Static Regeneration)
- Dynamic 페이지: 서버 사이드 렌더링

### 모니터링
- Vercel Analytics 활성화
- 성능 메트릭 추적
- 에러 로그 모니터링

---

## 8. 커스텀 도메인 연결 (선택)

### Step 1: 도메인 추가
1. Vercel 프로젝트 → "Settings" → "Domains"
2. 도메인 입력: `jobsbuild.com`
3. "Add" 클릭

### Step 2: DNS 설정
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: SSL 인증서
- Vercel에서 자동 발급 (Let's Encrypt)
- HTTPS 자동 리다이렉트

---

## 9. 배포 자동화

### GitHub Actions (선택)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 10. 모니터링 및 유지보수

### 정기 체크
- 주 1회: 에러 로그 확인
- 월 1회: 성능 메트릭 분석
- 분기 1회: 보안 업데이트

### 백업 전략
- Supabase 자동 백업 (일 1회)
- GitHub 코드 백업 (자동)
- 환경 변수 백업 (수동)

---

**작성일**: 2026-01-25  
**최종 커밋**: c118216  
**빌드 상태**: ✅ 성공  
**배포 준비**: ✅ 완료
