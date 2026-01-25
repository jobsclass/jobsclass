# Vercel 배포 가이드 📦

## 🚨 배포 전 필수 체크리스트

### ✅ 1. 환경 변수 확인
다음 환경 변수가 **반드시** 설정되어 있어야 합니다:

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT Secret (필수)
JWT_SECRET=your_32_character_secret

# App URL (필수)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# OpenAI API (필수 - AI 기능용) ⚠️
OPENAI_API_KEY=sk-proj-...
```

**❗ OPENAI_API_KEY가 없으면 배포는 성공하지만 AI 기능이 작동하지 않습니다!**

---

## 📋 Vercel 배포 단계별 가이드

### Step 1: Vercel 계정 생성 및 프로젝트 Import

1. **Vercel 가입**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 `jobsclass/jobsbuild` 선택
   - "Import" 클릭

---

### Step 2: 환경 변수 설정 ⚠️ **가장 중요!**

1. **Settings → Environment Variables** 이동

2. **각 환경 변수 추가**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production, Preview, Development 모두 체크
   - "Save" 클릭

3. **필수 환경 변수 목록** (하나라도 빠지면 배포 실패 또는 기능 오류)
   ```
   ✅ NEXT_PUBLIC_SUPABASE_URL
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   ✅ SUPABASE_SERVICE_ROLE_KEY
   ✅ JWT_SECRET
   ✅ NEXT_PUBLIC_APP_URL
   ✅ OPENAI_API_KEY          ← 🔴 AI 기능 필수!
   ```

4. **환경 변수 설정 스크린샷**
   ```
   Name                              | Value                  | Environment
   ----------------------------------|------------------------|------------------
   NEXT_PUBLIC_SUPABASE_URL          | https://xxx.supabase.. | Production, Preview, Development
   NEXT_PUBLIC_SUPABASE_ANON_KEY     | eyJhbGc...            | Production, Preview, Development
   SUPABASE_SERVICE_ROLE_KEY         | eyJhbGc...            | Production, Preview, Development
   JWT_SECRET                        | your_secret...         | Production, Preview, Development
   NEXT_PUBLIC_APP_URL               | https://corefy.vercel..| Production, Preview, Development
   OPENAI_API_KEY                    | sk-proj-...           | Production, Preview, Development
   ```

---

### Step 3: 빌드 설정 확인

1. **Build & Development Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Node.js Version** (자동 선택됨)
   - 18.x 이상

---

### Step 4: 첫 배포 실행

1. **Deploy 버튼 클릭**
   - 자동으로 빌드 시작
   - 로그 실시간 확인

2. **배포 과정**
   ```
   ⏳ Initializing...
   ⏳ Building...
   ⏳ Uploading...
   ✅ Deployment Ready!
   ```

3. **예상 소요 시간**: 약 2~3분

---

### Step 5: 배포 확인 및 테스트

1. **배포 URL 확인**
   - `https://corefy-xxx.vercel.app` 형태
   - 또는 커스텀 도메인 설정 가능

2. **테스트 체크리스트**
   - [ ] 홈페이지 접속 가능
   - [ ] 회원가입 가능
   - [ ] 로그인 가능
   - [ ] 대시보드 접속 가능
   - [ ] AI 온보딩 작동 (회원가입 후)
   - [ ] AI 텍스트 생성 작동 (서비스 등록 페이지)
   - [ ] AI 이미지 생성 작동
   - [ ] AI 가격 추천 작동
   - [ ] 공개 프로필 페이지 (`/{username}`) 접속 가능

---

## 🐛 배포 에러 해결 가이드

### 에러 1: "There was an error deploying corefy"

**원인**: 환경 변수 누락 또는 잘못된 값

**해결 방법**:
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. 모든 필수 환경 변수가 설정되어 있는지 확인
3. 특히 `OPENAI_API_KEY` 확인 (가장 자주 누락됨)
4. 값이 올바른지 확인 (복사 시 공백 주의)
5. Deployments 탭 → "Redeploy" 클릭

**체크리스트**:
```bash
# 각 환경 변수 값 확인
echo $NEXT_PUBLIC_SUPABASE_URL      # https://로 시작하는가?
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY # eyJ로 시작하는가?
echo $SUPABASE_SERVICE_ROLE_KEY     # eyJ로 시작하는가?
echo $JWT_SECRET                     # 32자 이상인가?
echo $OPENAI_API_KEY                 # sk-proj-로 시작하는가?
```

---

### 에러 2: "Build failed"

**원인**: 코드 오류 또는 의존성 문제

**해결 방법**:
1. 로컬에서 빌드 테스트
   ```bash
   npm run build
   ```
2. 오류 메시지 확인 및 수정
3. 수정 후 commit & push
4. Vercel 자동 재배포

**일반적인 빌드 오류**:
- TypeScript 타입 에러
- ESLint 에러
- 패키지 누락

---

### 에러 3: AI 기능 작동 안 함

**증상**: 
- 배포는 성공했지만 AI 버튼 클릭 시 오류
- "OpenAI API 키가 설정되지 않았습니다" 메시지

**원인**: `OPENAI_API_KEY` 환경 변수 미설정

**해결 방법**:
1. Vercel Settings → Environment Variables
2. `OPENAI_API_KEY` 추가
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-your_key_here`
   - Environments: Production, Preview, Development 모두 체크
3. Deployments → "Redeploy" 클릭
4. 재배포 완료 후 테스트

**OpenAI API 키 발급 방법**:
1. https://platform.openai.com 로그인
2. API keys 메뉴 클릭
3. "Create new secret key" 클릭
4. 키 복사 (한 번만 표시됨!)

---

### 에러 4: Supabase 연결 오류

**증상**: 
- 로그인 실패
- 데이터 로딩 안 됨
- "Failed to fetch" 오류

**원인**: Supabase 환경 변수 오류 또는 스키마 미설정

**해결 방법**:
1. **환경 변수 확인**
   - `NEXT_PUBLIC_SUPABASE_URL` 올바른가?
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 올바른가?
   - `SUPABASE_SERVICE_ROLE_KEY` 올바른가?

2. **Supabase 스키마 확인**
   - Supabase 대시보드 → SQL Editor
   - `supabase/webbuilder_schema.sql` 실행 여부 확인
   - 테이블 존재 확인:
     - `user_profiles`
     - `services`
     - `blog_posts`
     - `portfolios`
     - `experiences`

3. **재배포**
   - 환경 변수 수정 후 Redeploy

---

### 에러 5: 페이지 Not Found (404)

**증상**: 특정 페이지 접속 시 404

**원인**: 동적 라우팅 또는 빌드 설정 문제

**해결 방법**:
1. 로컬에서 해당 페이지 접속 테스트
2. `app/` 디렉토리 구조 확인
3. 동적 라우트 `[username]` 등이 올바른지 확인
4. 재배포

---

## 🔄 재배포 방법

### 방법 1: 자동 배포 (권장)
1. 로컬에서 코드 수정
2. Git commit & push
   ```bash
   git add .
   git commit -m "fix: 배포 에러 수정"
   git push origin main
   ```
3. Vercel 자동으로 재배포 시작
4. 1~2분 후 배포 완료

### 방법 2: 수동 재배포
1. Vercel 대시보드 → Deployments
2. 가장 최근 배포 클릭
3. "Redeploy" 버튼 클릭
4. 환경 변수 변경 시 이 방법 사용

### 방법 3: 특정 커밋 재배포
1. Vercel 대시보드 → Deployments
2. 원하는 커밋 찾기
3. 점 3개 메뉴 (···) → "Redeploy" 클릭

---

## 🎯 배포 후 TODO

### 1. 도메인 설정 (선택)
1. Vercel Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정
4. HTTPS 자동 적용

### 2. 환경 변수 업데이트
1. `NEXT_PUBLIC_APP_URL`을 실제 도메인으로 변경
2. Redeploy

### 3. 모니터링 설정
1. Vercel Analytics 활성화
2. Speed Insights 활성화
3. Web Vitals 확인

### 4. 프로덕션 데이터 확인
1. 회원가입 테스트
2. AI 기능 전체 테스트
3. 공개 페이지 확인

---

## 📊 배포 체크리스트

배포 전:
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] `.env.example` 최신화
- [ ] README 업데이트
- [ ] 모든 환경 변수 준비됨

배포 중:
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 6개 모두 설정
- [ ] 빌드 설정 확인
- [ ] Deploy 클릭

배포 후:
- [ ] 배포 성공 확인
- [ ] 홈페이지 접속 테스트
- [ ] 회원가입/로그인 테스트
- [ ] AI 기능 테스트
  - [ ] 온보딩 (회원가입 후)
  - [ ] AI 텍스트 생성
  - [ ] AI 이미지 생성
  - [ ] AI 가격 추천
- [ ] 공개 페이지 테스트
- [ ] 모바일 반응형 확인

---

## 🆘 도움이 필요한 경우

### Vercel 지원
- Vercel 문서: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord

### Next.js 지원
- Next.js 문서: https://nextjs.org/docs
- Next.js Discord: https://nextjs.org/discord

### 프로젝트 이슈
- GitHub Issues: https://github.com/jobsclass/corefy/issues
- Email: startupjobs824@gmail.com

---

## 🎉 배포 완료!

축하합니다! Corefy가 성공적으로 배포되었습니다. 🚀

다음 URL로 접속하세요:
- **프로덕션**: https://corefy.vercel.app
- **공개 프로필**: https://corefy.vercel.app/{username}

---

**Made with ❤️ by JobsClass**
