# Jobs Build 개발 환경 세팅 가이드

> **소요 시간**: 약 15분  
> **최종 업데이트**: 2026.01.25
> **JobsClass 에코시스템의 첫 번째 제품**

---

## 📋 사전 준비 사항

### 필수 도구
- **Node.js**: v18 이상 ([다운로드](https://nodejs.org/))
- **npm**: v9 이상 (Node.js 설치 시 자동 포함)
- **Git**: 최신 버전 ([다운로드](https://git-scm.com/))
- **VS Code**: 권장 에디터 ([다운로드](https://code.visualstudio.com/))

### 계정 준비
- **Supabase**: 무료 계정 ([가입](https://supabase.com))
- **Vercel**: 무료 계정 ([가입](https://vercel.com))
- **Toss Payments**: 테스트 계정 ([가입](https://developers.tosspayments.com))

---

## 🚀 1단계: 저장소 클론

```bash
git clone https://github.com/jobsclass/jobsbuild.git
cd jobsbuild
```

---

## 📦 2단계: 의존성 설치

```bash
npm install
```

**설치되는 주요 패키지**:
- `next` (v15.1.6) - React 프레임워크
- `@supabase/supabase-js` - Supabase 클라이언트
- `jose` - JWT 토큰 처리
- `bcryptjs` - 비밀번호 해싱
- `lucide-react` - 아이콘
- `react-hot-toast` - 알림 메시지

---

## 🗄️ 3단계: Supabase 프로젝트 생성

### 3-1. 새 프로젝트 생성
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `jobsbuild` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 설정 (복사해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 권장
4. "Create new project" 클릭 (약 2분 소요)

### 3-2. 데이터베이스 스키마 실행
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사
4. 에디터에 붙여넣기
5. **Run** 버튼 클릭 (⌘ + Enter / Ctrl + Enter)
6. ✅ Success 메시지 확인

**생성되는 테이블**:
- `partner_profiles` - 파트너 정보
- `services` - 서비스 상품
- `course_videos` - 온라인 강의 영상
- `buyers` - 구매자
- `carts` - 장바구니
- `orders` - 주문
- `enrollments` - 수강 정보
- `coupons` - 쿠폰
- `coupon_usage` - 쿠폰 사용 내역
- `refund_requests` - 환불 요청

### 3-3. API 키 복사
1. 왼쪽 메뉴에서 **Settings** → **API** 클릭
2. 다음 값들을 복사해두세요:
   - `Project URL`
   - `anon public` (공개 키)
   - `service_role` (관리자 키, **비공개**)

---

## 🔐 4단계: 환경변수 설정

### 4-1. `.env.local` 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

### 4-2. Supabase 키 입력
`.env.local` 파일을 열고 다음 값 입력:

```env
# Supabase (3-3 단계에서 복사한 값)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Toss Payments (개발 단계에서는 테스트 키 사용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_your_test_key
TOSS_SECRET_KEY=test_sk_your_test_secret_key
```

### 4-3. Toss Payments 테스트 키 발급
1. [Toss Payments 개발자 센터](https://developers.tosspayments.com) 접속
2. "내 개발 정보" → "API 키" 메뉴
3. **테스트 키** 복사 (클라이언트 키 + 시크릿 키)
4. `.env.local`에 붙여넣기

---

## ▶️ 5단계: 개발 서버 실행

```bash
npm run dev
```

**성공 메시지**:
```
▲ Next.js 15.1.6
- Local:        http://localhost:3000
- Ready in 1.5s
```

브라우저에서 http://localhost:3000 접속

---

## ✅ 6단계: 동작 확인

### 6-1. 랜딩 페이지 확인
- URL: http://localhost:3000
- "파트너 회원가입" 버튼이 보여야 함

### 6-2. 파트너 회원가입 테스트
1. http://localhost:3000/auth/partner/signup 접속
2. 테스트 계정 생성:
   - **이메일**: `test@jobsbuild.com`
   - **비밀번호**: `test1234`
   - **표시 이름**: `테스트 파트너`
   - **URL**: `test-partner`
3. "회원가입" 클릭
4. ✅ 대시보드로 리다이렉트되면 성공

### 6-3. 서비스 등록 테스트
1. 대시보드 왼쪽 메뉴에서 "서비스 관리" 클릭
2. "새 서비스 등록" 버튼 클릭
3. 서비스 정보 입력:
   - **타입**: `온라인 강의`
   - **제목**: `Next.js 입문 강좌`
   - **가격**: `50000`
   - 나머지 필드 자유롭게 입력
4. "등록하기" 클릭
5. ✅ 서비스 목록에 추가되면 성공

### 6-4. 공개 페이지 확인
1. 서비스 목록에서 방금 등록한 서비스의 "미리보기" 클릭
2. URL: http://localhost:3000/p/test-partner/nextjs-입문-강좌
3. ✅ 서비스 상세 페이지가 렌더링되면 성공

---

## 🐛 문제 해결

### 문제 1: `npm install` 실패
**에러**: `ERESOLVE unable to resolve dependency tree`

**해결**:
```bash
npm install --legacy-peer-deps
```

---

### 문제 2: Supabase 연결 실패
**에러**: `Invalid API key`

**해결**:
1. `.env.local` 파일 확인 (오타 없는지)
2. Supabase Dashboard에서 키 재복사
3. 개발 서버 재시작 (`Ctrl + C` → `npm run dev`)

---

### 문제 3: 포트 3000 이미 사용 중
**에러**: `Port 3000 is already in use`

**해결**:
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

또는 기존 프로세스 종료:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID번호> /F
```

---

### 문제 4: TypeScript 에러
**에러**: `Cannot find module 'types/database'`

**해결**:
```bash
# Next.js 캐시 삭제 후 재실행
rm -rf .next
npm run dev
```

---

## 🚢 Vercel 배포 (선택 사항)

### 1. Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com) 접속
2. "New Project" 클릭
3. GitHub 저장소 연결 (`jobsclass/jobsbuild`)
4. "Import" 클릭

### 2. 환경변수 설정
1. "Environment Variables" 섹션에서 `.env.local`의 모든 변수 입력
2. **주의**: `NEXT_PUBLIC_APP_URL`을 Vercel URL로 변경
   ```
   NEXT_PUBLIC_APP_URL=https://jobsbuild.vercel.app
   ```

### 3. 배포
1. "Deploy" 클릭
2. 약 2분 후 배포 완료
3. ✅ 배포 URL 확인 (예: `https://jobsbuild.vercel.app`)

---

## 📚 다음 단계

### Phase 1 완성 목표 (6주)
자세한 개발 일정은 [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) 참고

### Week 1: 구매자 인증 & 장바구니 (다음 목표)
- 구매자 회원가입/로그인 페이지
- JWT 기반 인증 시스템
- 장바구니 기능
- 장바구니 API

### 개발 시작
```bash
# genspark_ai_developer 브랜치 생성
git checkout -b genspark_ai_developer

# Week 1 작업 시작
# 파일: app/p/[partner]/auth/signup/page.tsx
```

---

## 📞 문의

- **GitHub Issues**: https://github.com/jobsclass/jobsbuild/issues
- **프로젝트 관리자**: @jobsclass

---

## 🎯 체크리스트

설정이 완료되었는지 확인:

- [ ] Node.js 설치 완료 (`node -v`)
- [ ] 저장소 클론 완료
- [ ] `npm install` 성공
- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 실행 완료 (10개 테이블)
- [ ] `.env.local` 파일 생성 및 키 입력 완료
- [ ] `npm run dev` 실행 성공
- [ ] 파트너 회원가입 테스트 성공
- [ ] 서비스 등록 테스트 성공
- [ ] 공개 페이지 렌더링 확인

**모두 체크했다면 개발 시작 준비 완료!** 🎉

---

**JobsBuild - 15분 만에 시작하는 개발 환경** 🚀
